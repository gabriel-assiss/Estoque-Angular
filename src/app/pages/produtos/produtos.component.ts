import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProdutoService } from '../../core/services/produto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { ToastService } from '../../core/services/toast.service';
import { Produto, Categoria, ProdutoRequest } from '../../core/models/models';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.css'
})
export class ProdutosComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal<boolean>(false);
  readonly salvando = signal<boolean>(false);
  readonly produtos = signal<Produto[]>([]);
  readonly categorias = signal<Categoria[]>([]);

  readonly paginaAtual = signal<number>(0);
  readonly totalPaginas = signal<number>(1);
  readonly totalElements = signal<number>(0);

  buscaNome = '';
  categoriaFiltroSelecionada = '';
  readonly buscaAtiva = signal<boolean>(false);

  // Modal
  readonly modalNovoAberto = signal<boolean>(false);

  readonly novoProdutoForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    categoriaId: [null, [Validators.required]],
    unidadeMedida: ['UN', [Validators.required]],
    quantidade: [1, [Validators.required, Validators.min(1)]]
  });

  readonly ativosCount = computed(() => this.produtos().filter(p => p.statusProduto === 'ATIVO').length);
  readonly inativosCount = computed(() => this.produtos().filter(p => p.statusProduto === 'INATIVO').length);

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarProdutos();
  }

  carregarCategorias(): void {
    this.categoriaService.getTodas(0, 100).subscribe({
      next: (res) => {
        this.categorias.set(res.content || []);
      }
    });
  }

  carregarProdutos(page = 0): void {
    this.loading.set(true);
    this.produtoService.getTodos(page, 10).subscribe({
      next: (res) => this.processarResposta(res, page),
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar catálogo de produtos.');
      }
    });
  }

  private processarResposta(res: any, page: number): void {
    this.produtos.set(res.content || []);
    this.paginaAtual.set(res.number ?? page);
    this.totalPaginas.set(res.totalPages || 1);
    this.totalElements.set(res.totalElements || 0);
    this.loading.set(false);
  }

  executarBuscaNome(): void {
    const nome = this.buscaNome.trim();
    if (!nome) {
      this.limparFiltros();
      return;
    }

    this.loading.set(true);
    this.buscaAtiva.set(true);
    this.produtoService.buscarPorNome(nome, 0, 10).subscribe({
      next: (res) => this.processarResposta(res, 0),
      error: () => {
        this.loading.set(false);
        this.toast.error('Nenhum produto encontrado com o nome pesquisado.');
      }
    });
  }

  filtrarPorCategoria(): void {
    const cat = this.categoriaFiltroSelecionada;
    if (!cat) {
      this.limparFiltros();
      return;
    }

    this.loading.set(true);
    this.buscaAtiva.set(true);
    this.produtoService.buscarPorCategoria(cat, 0, 10).subscribe({
      next: (res) => this.processarResposta(res, 0),
      error: () => {
        this.loading.set(false);
        this.toast.error('Nenhum produto encontrado nesta categoria.');
      }
    });
  }

  limparFiltros(): void {
    this.buscaNome = '';
    this.categoriaFiltroSelecionada = '';
    this.buscaAtiva.set(false);
    this.carregarProdutos(0);
  }

  mudarPagina(novaPagina: number): void {
    if (this.buscaNome.trim()) {
      this.produtoService.buscarPorNome(this.buscaNome.trim(), novaPagina, 10).subscribe({
        next: (res) => this.processarResposta(res, novaPagina)
      });
    } else if (this.categoriaFiltroSelecionada) {
      this.produtoService.buscarPorCategoria(this.categoriaFiltroSelecionada, novaPagina, 10).subscribe({
        next: (res) => this.processarResposta(res, novaPagina)
      });
    } else {
      this.carregarProdutos(novaPagina);
    }
  }

  abrirModalNovo(): void {
    this.novoProdutoForm.reset({
      unidadeMedida: 'UN',
      quantidade: 1,
      categoriaId: this.categorias().length > 0 ? this.categorias()[0].id : null
    });
    this.modalNovoAberto.set(true);
  }

  fecharModalNovo(): void {
    this.modalNovoAberto.set(false);
  }

  salvarNovoProduto(): void {
    if (this.novoProdutoForm.invalid) return;

    this.salvando.set(true);
    const dados = this.novoProdutoForm.value as ProdutoRequest;

    // POST /produtos?quantidade={qtd}
    this.produtoService.salvar(dados).subscribe({
      next: (novo) => {
        this.salvando.set(false);
        this.toast.success(`Produto "${novo.nome}" cadastrado com estoque inicial de ${dados.quantidade}!`);
        this.fecharModalNovo();
        this.carregarProdutos(0);
      },
      error: (err) => {
        this.salvando.set(false);
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao cadastrar produto.';
        this.toast.error(msg);
      }
    });
  }

  inativarProduto(prod: Produto): void {
    this.produtoService.inativar(prod.id).subscribe({
      next: () => {
        this.toast.success(`Produto "${prod.nome}" inativado com sucesso.`);
        this.carregarProdutos(this.paginaAtual());
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao inativar produto.';
        this.toast.error(msg);
      }
    });
  }

  ativarProduto(prod: Produto): void {
    this.produtoService.ativar(prod.id).subscribe({
      next: () => {
        this.toast.success(`Produto "${prod.nome}" ativado com sucesso.`);
        this.carregarProdutos(this.paginaAtual());
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao ativar produto.';
        this.toast.error(msg);
      }
    });
  }

  excluirProduto(prod: Produto): void {
    if (!confirm(`Deseja realmente excluir o produto "${prod.nome}"?`)) return;

    this.produtoService.excluir(prod.id).subscribe({
      next: () => {
        this.toast.success(`Produto "${prod.nome}" excluído com sucesso.`);
        this.carregarProdutos(this.paginaAtual());
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao excluir produto.';
        this.toast.error(msg);
      }
    });
  }
}
