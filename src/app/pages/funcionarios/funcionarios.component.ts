import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FuncionarioService } from '../../core/services/funcionario.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Funcionario, FuncionarioRequest } from '../../core/models/models';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './funcionarios.component.html',
  styleUrl: './funcionarios.component.css'
})
export class FuncionariosComponent implements OnInit {
  private readonly funcionarioService = inject(FuncionarioService);
  readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal<boolean>(false);
  readonly salvando = signal<boolean>(false);
  readonly funcionarios = signal<Funcionario[]>([]);

  readonly paginaAtual = signal<number>(0);
  readonly totalPaginas = signal<number>(1);
  readonly totalElements = signal<number>(0);

  buscaNome = '';
  readonly buscaAtiva = signal<boolean>(false);

  // Modals
  readonly modalNovoAberto = signal<boolean>(false);
  readonly modalEditarNomeAberto = signal<boolean>(false);
  readonly funcionarioSelecionado = signal<Funcionario | null>(null);
  novoNomeInput = '';

  readonly novoFuncionarioForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    cargo: ['', [Validators.required]],
    matricula: ['', [Validators.required]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    role: ['PADRAO', [Validators.required]]
  });

  readonly ativosCount = computed(() => this.funcionarios().filter(f => f.statusFuncionario === 'ATIVO').length);
  readonly inativosCount = computed(() => this.funcionarios().filter(f => f.statusFuncionario === 'INATIVO').length);
  readonly adminsCount = computed(() => this.funcionarios().filter(f => f.role === 'ADMIN').length);

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.carregarFuncionarios();
    }
  }

  carregarFuncionarios(page = 0): void {
    this.loading.set(true);
    this.funcionarioService.getTodos(page, 10).subscribe({
      next: (res) => {
        this.funcionarios.set(res.content || []);
        this.paginaAtual.set(res.number ?? page);
        this.totalPaginas.set(res.totalPages || 1);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao listar funcionários.');
      }
    });
  }

  executarBuscaNome(): void {
    const nome = this.buscaNome.trim();
    if (!nome) {
      this.limparBusca();
      return;
    }

    this.loading.set(true);
    this.buscaAtiva.set(true);
    this.funcionarioService.buscarPorNome(nome, 0, 10).subscribe({
      next: (res) => {
        this.funcionarios.set(res.content || []);
        this.paginaAtual.set(res.number ?? 0);
        this.totalPaginas.set(res.totalPages || 1);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Nenhum funcionário encontrado com o nome informado.');
      }
    });
  }

  limparBusca(): void {
    this.buscaNome = '';
    this.buscaAtiva.set(false);
    this.carregarFuncionarios(0);
  }

  mudarPagina(novaPagina: number): void {
    if (this.buscaAtiva()) {
      this.funcionarioService.buscarPorNome(this.buscaNome.trim(), novaPagina, 10).subscribe({
        next: (res) => {
          this.funcionarios.set(res.content || []);
          this.paginaAtual.set(res.number ?? novaPagina);
          this.totalPaginas.set(res.totalPages || 1);
        }
      });
    } else {
      this.carregarFuncionarios(novaPagina);
    }
  }

  abrirModalNovo(): void {
    this.novoFuncionarioForm.reset({ role: 'PADRAO' });
    this.modalNovoAberto.set(true);
  }

  fecharModalNovo(): void {
    this.modalNovoAberto.set(false);
  }

  salvarNovoFuncionario(): void {
    if (this.novoFuncionarioForm.invalid) return;

    this.salvando.set(true);
    const dados = this.novoFuncionarioForm.value as FuncionarioRequest;

    this.funcionarioService.salvar(dados).subscribe({
      next: (novo) => {
        this.salvando.set(false);
        this.toast.success(`Funcionário "${novo.nome}" cadastrado com sucesso!`);
        this.fecharModalNovo();
        this.carregarFuncionarios(0);
      },
      error: (err) => {
        this.salvando.set(false);
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao cadastrar funcionário.';
        this.toast.error(msg);
      }
    });
  }

  abrirModalEditarNome(func: Funcionario): void {
    this.funcionarioSelecionado.set(func);
    this.novoNomeInput = func.nome;
    this.modalEditarNomeAberto.set(true);
  }

  fecharModalEditarNome(): void {
    this.modalEditarNomeAberto.set(false);
    this.funcionarioSelecionado.set(null);
  }

  confirmarAtualizacaoNome(): void {
    const func = this.funcionarioSelecionado();
    const novoNome = this.novoNomeInput.trim();
    if (!func || !novoNome) return;

    this.salvando.set(true);
    // PUT /funcionarios/atualizanome/{id}?nome={novoNome}
    this.funcionarioService.atualizarNome(func.id, novoNome).subscribe({
      next: (atualizado) => {
        this.salvando.set(false);
        this.toast.success(`Nome atualizado para "${atualizado.nome}".`);
        this.fecharModalEditarNome();
        this.carregarFuncionarios(this.paginaAtual());
      },
      error: (err) => {
        this.salvando.set(false);
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao atualizar nome.';
        this.toast.error(msg);
      }
    });
  }

  inativarFuncionario(func: Funcionario): void {
    if (!confirm(`Deseja realmente inativar o funcionário "${func.nome}"?`)) return;

    this.funcionarioService.inativar(func.id).subscribe({
      next: () => {
        this.toast.success(`Funcionário "${func.nome}" inativado com sucesso.`);
        this.carregarFuncionarios(this.paginaAtual());
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao inativar funcionário.';
        this.toast.error(msg);
      }
    });
  }

  ativarFuncionario(func: Funcionario): void {
    this.funcionarioService.ativar(func.id).subscribe({
      next: () => {
        this.toast.success(`Funcionário "${func.nome}" ativado com sucesso.`);
        this.carregarFuncionarios(this.paginaAtual());
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao ativar funcionário.';
        this.toast.error(msg);
      }
    });
  }
}
