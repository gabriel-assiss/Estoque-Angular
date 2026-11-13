import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriaService } from '../../core/services/categoria.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria, CategoriaRequest, StatusCategoria } from '../../core/models/models';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal<boolean>(false);
  readonly salvando = signal<boolean>(false);
  readonly categorias = signal<Categoria[]>([]);

  readonly filtroAba = signal<'TODAS' | 'ATIVAS' | 'INATIVAS'>('TODAS');

  readonly paginaAtual = signal<number>(0);
  readonly totalPaginas = signal<number>(1);
  readonly totalElements = signal<number>(0);

  buscaNome = '';
  readonly buscaAtiva = signal<boolean>(false);

  // Modals
  readonly modalNovaAberto = signal<boolean>(false);
  readonly modalEditarAberto = signal<boolean>(false);
  readonly categoriaSelecionada = signal<Categoria | null>(null);

  editarNomeInput = '';
  editarStatusInput: StatusCategoria = 'ATIVO';

  readonly novaCategoriaForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]]
  });

  readonly ativasCount = computed(() => this.categorias().filter(c => c.statusCategoria === 'ATIVO').length);
  readonly inativasCount = computed(() => this.categorias().filter(c => c.statusCategoria === 'INATIVO').length);

  ngOnInit(): void {
    this.carregarCategorias();
  }

  definirAba(aba: 'TODAS' | 'ATIVAS' | 'INATIVAS'): void {
    this.filtroAba.set(aba);
    this.limparBusca();
  }

  carregarCategorias(page = 0): void {
    this.loading.set(true);
    const aba = this.filtroAba();

    if (aba === 'ATIVAS') {
      this.categoriaService.getAtivas(page, 10).subscribe({
        next: (res) => this.processarResposta(res, page),
        error: () => this.tratarErro('Erro ao carregar categorias ativas.')
      });
    } else if (aba === 'INATIVAS') {
      this.categoriaService.getInativas(page, 10).subscribe({
        next: (res) => this.processarResposta(res, page),
        error: () => this.tratarErro('Erro ao carregar categorias inativas.')
      });
    } else {
      this.categoriaService.getTodas(page, 10).subscribe({
        next: (res) => this.processarResposta(res, page),
        error: () => this.tratarErro('Erro ao carregar categorias.')
      });
    }
  }

  private processarResposta(res: any, page: number): void {
    this.categorias.set(res.content || []);
    this.paginaAtual.set(res.number ?? page);
    this.totalPaginas.set(res.totalPages || 1);
    this.totalElements.set(res.totalElements || 0);
    this.loading.set(false);
  }

  private tratarErro(msg: string): void {
    this.loading.set(false);
    this.toast.error(msg);
  }

  executarBuscaNome(): void {
    const nome = this.buscaNome.trim();
    if (!nome) {
      this.limparBusca();
      return;
    }

    this.loading.set(true);
    this.buscaAtiva.set(true);
    this.categoriaService.buscarPorNome(nome, 0, 10).subscribe({
      next: (res) => this.processarResposta(res, 0),
      error: () => {
        this.loading.set(false);
        this.toast.error('Nenhuma categoria encontrada com o nome informado.');
      }
    });
  }

  limparBusca(): void {
    this.buscaNome = '';
    this.buscaAtiva.set(false);
    this.carregarCategorias(0);
  }

  mudarPagina(novaPagina: number): void {
    if (this.buscaAtiva()) {
      this.categoriaService.buscarPorNome(this.buscaNome.trim(), novaPagina, 10).subscribe({
        next: (res) => this.processarResposta(res, novaPagina)
      });
    } else {
      this.carregarCategorias(novaPagina);
    }
  }

  abrirModalNova(): void {
    this.novaCategoriaForm.reset();
    this.modalNovaAberto.set(true);
  }

  fecharModalNova(): void {
    this.modalNovaAberto.set(false);
  }

  salvarNovaCategoria(): void {
    if (this.novaCategoriaForm.invalid) return;

    this.salvando.set(true);
    const dados = this.novaCategoriaForm.value as CategoriaRequest;

    this.categoriaService.salvar(dados).subscribe({
      next: (nova) => {
        this.salvando.set(false);
        this.toast.success(`Categoria "${nova.nome}" criada com sucesso!`);
        this.fecharModalNova();
        this.carregarCategorias(0);
      },
      error: (err) => {
        this.salvando.set(false);
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao cadastrar categoria.';
        this.toast.error(msg);
      }
    });
  }

  abrirModalEditar(cat: Categoria): void {
    this.categoriaSelecionada.set(cat);
    this.editarNomeInput = cat.nome;
    this.editarStatusInput = cat.statusCategoria || 'ATIVO';
    this.modalEditarAberto.set(true);
  }

  fecharModalEditar(): void {
    this.modalEditarAberto.set(false);
    this.categoriaSelecionada.set(null);
  }

  confirmarEdicao(): void {
    const cat = this.categoriaSelecionada();
    const nome = this.editarNomeInput.trim();
    if (!cat || !nome) return;

    this.salvando.set(true);
    const req: CategoriaRequest = {
      nome,
      statusCategoria: this.editarStatusInput
    };

    this.categoriaService.atualizar(cat.id, req).subscribe({
      next: (atualizada) => {
        this.salvando.set(false);
        this.toast.success(`Categoria "${atualizada.nome}" atualizada com sucesso!`);
        this.fecharModalEditar();
        this.carregarCategorias(this.paginaAtual());
      },
      error: (err) => {
        this.salvando.set(false);
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao atualizar categoria.';
        this.toast.error(msg);
      }
    });
  }

  excluirCategoria(cat: Categoria): void {
    if (!confirm(`Atenção: deseja excluir definitivamente a categoria "${cat.nome}"?`)) return;

    this.categoriaService.excluir(cat.id).subscribe({
      next: () => {
        this.toast.success(`Categoria "${cat.nome}" excluída.`);
        this.carregarCategorias(this.paginaAtual());
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : 'Não foi possível excluir a categoria (verifique vínculos).';
        this.toast.error(msg);
      }
    });
  }
}
