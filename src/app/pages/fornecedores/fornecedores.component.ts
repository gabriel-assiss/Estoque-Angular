import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FornecedorService } from '../../core/services/fornecedor.service';
import { ToastService } from '../../core/services/toast.service';
import { Fornecedor, FornecedorRequest } from '../../core/models/models';

@Component({
  selector: 'app-fornecedores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './fornecedores.component.html',
  styleUrl: './fornecedores.component.css'
})
export class FornecedoresComponent implements OnInit {
  private readonly fornecedorService = inject(FornecedorService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal<boolean>(false);
  readonly salvando = signal<boolean>(false);
  readonly fornecedores = signal<Fornecedor[]>([]);

  readonly paginaAtual = signal<number>(0);
  readonly totalPaginas = signal<number>(1);
  readonly totalElements = signal<number>(0);

  buscaNome = '';
  readonly buscaAtiva = signal<boolean>(false);

  // Modals
  readonly modalNovoAberto = signal<boolean>(false);
  readonly modalEditarNomeAberto = signal<boolean>(false);
  readonly fornecedorSelecionado = signal<Fornecedor | null>(null);
  novoNomeInput = '';

  readonly novoFornecedorForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cnpj: ['', [Validators.required, Validators.minLength(11)]]
  });

  readonly ativosCount = computed(() => this.fornecedores().filter(f => f.statusFornecedor === 'ATIVO').length);
  readonly inativosCount = computed(() => this.fornecedores().filter(f => f.statusFornecedor === 'INATIVO').length);

  ngOnInit(): void {
    this.carregarFornecedores();
  }

  carregarFornecedores(page = 0): void {
    this.loading.set(true);
    this.fornecedorService.getTodos(page, 10).subscribe({
      next: (res) => this.processarResposta(res, page),
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar lista de fornecedores.');
      }
    });
  }

  private processarResposta(res: any, page: number): void {
    this.fornecedores.set(res.content || []);
    this.paginaAtual.set(res.number ?? page);
    this.totalPaginas.set(res.totalPages || 1);
    this.totalElements.set(res.totalElements || 0);
    this.loading.set(false);
  }

  executarBuscaNome(): void {
    const nome = this.buscaNome.trim();
    if (!nome) {
      this.limparBusca();
      return;
    }

    this.loading.set(true);
    this.buscaAtiva.set(true);
    this.fornecedorService.buscarPorNome(nome, 0, 10).subscribe({
      next: (res) => this.processarResposta(res, 0),
      error: () => {
        this.loading.set(false);
        this.toast.error('Nenhum fornecedor encontrado com o nome informado.');
      }
    });
  }

  limparBusca(): void {
    this.buscaNome = '';
    this.buscaAtiva.set(false);
    this.carregarFornecedores(0);
  }

  mudarPagina(novaPagina: number): void {
    if (this.buscaAtiva()) {
      this.fornecedorService.buscarPorNome(this.buscaNome.trim(), novaPagina, 10).subscribe({
        next: (res) => this.processarResposta(res, novaPagina)
      });
    } else {
      this.carregarFornecedores(novaPagina);
    }
  }

  abrirModalNovo(): void {
    this.novoFornecedorForm.reset();
    this.modalNovoAberto.set(true);
  }

  fecharModalNovo(): void {
    this.modalNovoAberto.set(false);
  }

  salvarNovoFornecedor(): void {
    if (this.novoFornecedorForm.invalid) return;

    this.salvando.set(true);
    const dados = this.novoFornecedorForm.value as FornecedorRequest;

    this.fornecedorService.salvar(dados).subscribe({
      next: (novo) => {
        this.salvando.set(false);
        this.toast.success(`Fornecedor "${novo.nome}" cadastrado com sucesso!`);
        this.fecharModalNovo();
        this.carregarFornecedores(0);
      },
      error: (err) => {
        this.salvando.set(false);
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao cadastrar fornecedor (verifique se CNPJ já existe).';
        this.toast.error(msg);
      }
    });
  }

  abrirModalEditarNome(forn: Fornecedor): void {
    this.fornecedorSelecionado.set(forn);
    this.novoNomeInput = forn.nome;
    this.modalEditarNomeAberto.set(true);
  }

  fecharModalEditarNome(): void {
    this.modalEditarNomeAberto.set(false);
    this.fornecedorSelecionado.set(null);
  }

  confirmarAtualizacaoNome(): void {
    const forn = this.fornecedorSelecionado();
    const novoNome = this.novoNomeInput.trim();
    if (!forn || !novoNome) return;

    this.salvando.set(true);
    // PUT /fornecedores/{id}/nome?nome={novoNome}
    this.fornecedorService.atualizarNome(forn.id, novoNome).subscribe({
      next: (atualizado) => {
        this.salvando.set(false);
        this.toast.success(`Nome atualizado para "${atualizado.nome}".`);
        this.fecharModalEditarNome();
        this.carregarFornecedores(this.paginaAtual());
      },
      error: (err) => {
        this.salvando.set(false);
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao atualizar nome do fornecedor.';
        this.toast.error(msg);
      }
    });
  }

  inativarFornecedor(forn: Fornecedor): void {
    this.fornecedorService.inativar(forn.id).subscribe({
      next: () => {
        this.toast.success(`Fornecedor "${forn.nome}" inativado com sucesso.`);
        this.carregarFornecedores(this.paginaAtual());
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao inativar fornecedor.';
        this.toast.error(msg);
      }
    });
  }

  ativarFornecedor(forn: Fornecedor): void {
    this.fornecedorService.ativar(forn.id).subscribe({
      next: () => {
        this.toast.success(`Fornecedor "${forn.nome}" ativado com sucesso.`);
        this.carregarFornecedores(this.paginaAtual());
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao ativar fornecedor.';
        this.toast.error(msg);
      }
    });
  }
}
