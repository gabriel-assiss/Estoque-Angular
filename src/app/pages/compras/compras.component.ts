import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CompraService } from '../../core/services/compra.service';
import { MovimentacaoService } from '../../core/services/movimentacao.service';
import { ProdutoService } from '../../core/services/produto.service';
import { FornecedorService } from '../../core/services/fornecedor.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Compra, MovimentacaoEstoque, Produto, Fornecedor, CompraItem, CompraRequest } from '../../core/models/models';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.css'
})
export class ComprasComponent implements OnInit {
  private readonly compraService = inject(CompraService);
  private readonly movimentacaoService = inject(MovimentacaoService);
  private readonly produtoService = inject(ProdutoService);
  private readonly fornecedorService = inject(FornecedorService);
  readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly abaAtiva = signal<'COMPRAS' | 'MOVIMENTACOES'>('COMPRAS');

  // Compras State
  readonly loadingCompras = signal<boolean>(false);
  readonly salvandoCompra = signal<boolean>(false);
  readonly compras = signal<Compra[]>([]);
  readonly paginaAtualCompras = signal<number>(0);
  readonly totalPaginasCompras = signal<number>(1);
  readonly totalElementsCompras = signal<number>(0);

  readonly concluidasCount = computed(() => this.compras().filter(c => c.statusCompra === 'CONCLUIDA').length);
  readonly canceladasCount = computed(() => this.compras().filter(c => c.statusCompra === 'CANCELADA').length);

  // Modal Nova Compra
  readonly modalNovaCompraAberto = signal<boolean>(false);
  readonly fornecedoresDisponiveis = signal<Fornecedor[]>([]);
  readonly produtosDisponiveis = signal<Produto[]>([]);

  novaCompraFornecedorId: number | null = null;
  readonly itensCompra = signal<CompraItem[]>([]);

  novoItemProdutoId: number | null = null;
  novoItemQuantidade = 1;
  novoItemPreco = 10.0;

  readonly valorTotalCompra = computed(() => {
    return this.itensCompra().reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);
  });

  // Movimentações State
  readonly loadingMov = signal<boolean>(false);
  readonly movimentacoes = signal<MovimentacaoEstoque[]>([]);
  filtroMovProdutoId: number | null = null;
  filtroMovFuncionarioId: number | null = null;

  ngOnInit(): void {
    // Check route query params (e.g. ?tab=movimentacoes&produtoId=1)
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'movimentacoes') {
        this.abaAtiva.set('MOVIMENTACOES');
        if (params['produtoId']) {
          this.filtroMovProdutoId = Number(params['produtoId']);
        }
      }
    });

    this.carregarFornecedoresEProdutos();
    this.carregarCompras();
    if (this.abaAtiva() === 'MOVIMENTACOES') {
      this.carregarMovimentacoes();
    }
  }

  mudarAba(aba: 'COMPRAS' | 'MOVIMENTACOES'): void {
    this.abaAtiva.set(aba);
    if (aba === 'COMPRAS') {
      this.carregarCompras();
    } else {
      this.carregarMovimentacoes();
    }
  }

  carregarFornecedoresEProdutos(): void {
    this.fornecedorService.getTodos(0, 100).subscribe({
      next: (res) => this.fornecedoresDisponiveis.set(res.content || [])
    });

    this.produtoService.getTodos(0, 100).subscribe({
      next: (res) => this.produtosDisponiveis.set(res.content || [])
    });
  }

  carregarCompras(page = 0): void {
    this.loadingCompras.set(true);
    this.compraService.getTodas(page, 10).subscribe({
      next: (res) => {
        this.compras.set(res.content || []);
        this.paginaAtualCompras.set(res.number ?? page);
        this.totalPaginasCompras.set(res.totalPages || 1);
        this.totalElementsCompras.set(res.totalElements || 0);
        this.loadingCompras.set(false);
      },
      error: () => {
        this.loadingCompras.set(false);
        this.toast.error('Erro ao carregar compras.');
      }
    });
  }

  mudarPaginaCompras(p: number): void {
    this.carregarCompras(p);
  }

  abrirModalNovaCompra(): void {
    this.novaCompraFornecedorId = this.fornecedoresDisponiveis().length > 0 ? this.fornecedoresDisponiveis()[0].id : null;
    this.novoItemProdutoId = this.produtosDisponiveis().length > 0 ? this.produtosDisponiveis()[0].id : null;
    this.novoItemQuantidade = 10;
    this.novoItemPreco = 50.0;
    this.itensCompra.set([]);
    this.modalNovaCompraAberto.set(true);
  }

  fecharModalNovaCompra(): void {
    this.modalNovaCompraAberto.set(false);
  }

  adicionarItem(): void {
    if (!this.novoItemProdutoId || this.novoItemQuantidade <= 0 || this.novoItemPreco <= 0) return;

    const prod = this.produtosDisponiveis().find(p => p.id === this.novoItemProdutoId);
    const item: CompraItem = {
      produtoId: this.novoItemProdutoId,
      quantidade: this.novoItemQuantidade,
      precoUnitario: this.novoItemPreco,
      produtoNome: prod?.nome || `Produto #${this.novoItemProdutoId}`
    };

    this.itensCompra.update(list => [...list, item]);
    this.novoItemQuantidade = 1;
  }

  removerItem(index: number): void {
    this.itensCompra.update(list => list.filter((_, i) => i !== index));
  }

  salvarCompra(): void {
    const fornecedorId = this.novaCompraFornecedorId;
    const funcionarioId = this.authService.currentUser()?.id || 1;
    const itens = this.itensCompra();

    if (!fornecedorId || itens.length === 0) return;

    this.salvandoCompra.set(true);
    const req: CompraRequest = {
      fornecedor: fornecedorId,
      funcionario: funcionarioId,
      itens: itens.map(i => ({
        produtoId: i.produtoId,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario
      }))
    };

    this.compraService.salvar(req).subscribe({
      next: (compraCriada) => {
        this.salvandoCompra.set(false);
        this.toast.success(`Ordem de compra #${compraCriada.id} finalizada com sucesso! Estoque abastecido.`);
        this.fecharModalNovaCompra();
        this.carregarCompras(0);
      },
      error: (err) => {
        this.salvandoCompra.set(false);
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao registrar compra.';
        this.toast.error(msg);
      }
    });
  }

  cancelarCompra(compra: Compra): void {
    const funcionarioId = this.authService.currentUser()?.id || 1;
    if (!confirm(`Deseja cancelar a compra #${compra.id}? O estoque correspondente será estornado.`)) return;

    // PUT /compras/{id}/cancelar?idFuncionario={idFuncionario}
    this.compraService.cancelar(compra.id, funcionarioId).subscribe({
      next: () => {
        this.toast.success(`Compra #${compra.id} cancelada com sucesso.`);
        this.carregarCompras(this.paginaAtualCompras());
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : 'Não foi possível cancelar a compra (estoque pode estar insuficiente para estorno).';
        this.toast.error(msg);
      }
    });
  }

  // ==========================================
  // Movimentações Logic
  // ==========================================
  carregarMovimentacoes(): void {
    this.loadingMov.set(true);

    const prodId = this.filtroMovProdutoId;
    const funcId = this.filtroMovFuncionarioId;

    if (prodId && funcId) {
      this.movimentacaoService.buscarPorProdutoEFuncionario(prodId, funcId).subscribe({
        next: (res) => {
          this.movimentacoes.set(res.content || []);
          this.loadingMov.set(false);
        },
        error: () => {
          this.loadingMov.set(false);
          this.toast.error('Nenhuma movimentação para os filtros indicados.');
        }
      });
    } else if (prodId) {
      this.movimentacaoService.buscarPorProduto(prodId).subscribe({
        next: (res) => {
          this.movimentacoes.set(res.content || []);
          this.loadingMov.set(false);
        },
        error: () => {
          this.loadingMov.set(false);
          this.toast.error('Nenhuma movimentação encontrada para o produto.');
        }
      });
    } else if (funcId) {
      this.movimentacaoService.buscarPorFuncionario(funcId).subscribe({
        next: (res) => {
          this.movimentacoes.set(res.content || []);
          this.loadingMov.set(false);
        },
        error: () => {
          this.loadingMov.set(false);
          this.toast.error('Nenhuma movimentação encontrada para o funcionário.');
        }
      });
    } else {
      // Default: fetch for the first available product or logged in user
      const defaultProd = this.produtosDisponiveis()[0];
      if (defaultProd) {
        this.movimentacaoService.buscarPorProduto(defaultProd.id).subscribe({
          next: (res) => {
            this.movimentacoes.set(res.content || []);
            this.loadingMov.set(false);
          },
          error: () => {
            this.movimentacoes.set([]);
            this.loadingMov.set(false);
          }
        });
      } else {
        this.movimentacoes.set([]);
        this.loadingMov.set(false);
      }
    }
  }

  limparFiltrosMov(): void {
    this.filtroMovProdutoId = null;
    this.filtroMovFuncionarioId = null;
    this.carregarMovimentacoes();
  }
}
