import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProdutoService } from '../../core/services/produto.service';
import { EstoqueService } from '../../core/services/estoque.service';
import { ToastService } from '../../core/services/toast.service';
import { Produto } from '../../core/models/models';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './estoque.component.html',
  styleUrl: './estoque.component.css'
})
export class EstoqueComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly estoqueService = inject(EstoqueService);
  private readonly toast = inject(ToastService);

  readonly loading = signal<boolean>(false);
  readonly salvandoAjuste = signal<boolean>(false);
  readonly produtos = signal<Produto[]>([]);

  filtroTexto = '';
  filtroStatus = 'TODOS';

  // Modal State
  readonly modalAberto = signal<boolean>(false);
  readonly produtoSelecionado = signal<Produto | null>(null);
  readonly tipoAjuste = signal<'ADICIONAR' | 'SUBTRAIR'>('ADICIONAR');
  quantidadeAjuste = 1;

  // Computed metrics
  readonly totalUnidadesEstoque = computed(() => {
    return this.produtos().reduce((sum, p) => sum + (p.estoqueQuantidade || 0), 0);
  });

  readonly produtosEstoqueBaixo = computed(() => {
    return this.produtos().filter(p => (p.estoqueQuantidade || 0) > 0 && (p.estoqueQuantidade || 0) <= 10).length;
  });

  readonly produtosEsgotados = computed(() => {
    return this.produtos().filter(p => (p.estoqueQuantidade || 0) === 0).length;
  });

  readonly produtosFiltrados = computed(() => {
    let list = this.produtos();
    const termo = this.filtroTexto.trim().toLowerCase();

    if (termo) {
      list = list.filter(p => 
        p.nome.toLowerCase().includes(termo) || 
        (p.categoriaNome && p.categoriaNome.toLowerCase().includes(termo))
      );
    }

    if (this.filtroStatus === 'BAIXO') {
      list = list.filter(p => (p.estoqueQuantidade || 0) > 0 && (p.estoqueQuantidade || 0) <= 10);
    } else if (this.filtroStatus === 'ESGOTADO') {
      list = list.filter(p => (p.estoqueQuantidade || 0) === 0);
    } else if (this.filtroStatus === 'NORMAL') {
      list = list.filter(p => (p.estoqueQuantidade || 0) > 10);
    }

    return list;
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading.set(true);
    // Fetch products
    this.produtoService.getTodos(0, 100).subscribe({
      next: (res) => {
        this.produtos.set(res.content || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar dados do estoque.');
      }
    });
  }

  abrirModalAjuste(produto: Produto, tipo: 'ADICIONAR' | 'SUBTRAIR'): void {
    this.produtoSelecionado.set(produto);
    this.tipoAjuste.set(tipo);
    this.quantidadeAjuste = 1;
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
    this.produtoSelecionado.set(null);
  }

  confirmarAjuste(): void {
    const prod = this.produtoSelecionado();
    if (!prod || this.quantidadeAjuste <= 0) return;

    this.salvandoAjuste.set(true);
    const qtd = this.quantidadeAjuste;

    if (this.tipoAjuste() === 'ADICIONAR') {
      this.estoqueService.adicionarQuantidade(prod.id, qtd).subscribe({
        next: () => {
          this.salvandoAjuste.set(false);
          this.toast.success(`Adicionado ${qtd} unidades ao estoque de "${prod.nome}".`);
          this.fecharModal();
          this.carregarDados();
        },
        error: (err) => {
          this.salvandoAjuste.set(false);
          const msg = typeof err.error === 'string' ? err.error : 'Erro ao adicionar quantidade ao estoque.';
          this.toast.error(msg);
        }
      });
    } else {
      this.estoqueService.subtrairQuantidade(prod.id, qtd).subscribe({
        next: () => {
          this.salvandoAjuste.set(false);
          this.toast.success(`Subtraído ${qtd} unidades do estoque de "${prod.nome}".`);
          this.fecharModal();
          this.carregarDados();
        },
        error: (err) => {
          this.salvandoAjuste.set(false);
          const msg = typeof err.error === 'string' ? err.error : 'Erro ao dar baixa no estoque. Verifique o saldo.';
          this.toast.error(msg);
        }
      });
    }
  }
}
