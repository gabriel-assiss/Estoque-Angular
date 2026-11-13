import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'estoque'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Login - EstoKit'
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/cadastro/cadastro.component').then(m => m.CadastroComponent),
    title: 'Cadastro de Usuário - EstoKit'
  },
  {
    path: 'estoque',
    loadComponent: () => import('./pages/estoque/estoque.component').then(m => m.EstoqueComponent),
    canActivate: [authGuard],
    title: 'Gestão de Estoque - EstoKit'
  },
  {
    path: 'produtos',
    loadComponent: () => import('./pages/produtos/produtos.component').then(m => m.ProdutosComponent),
    canActivate: [authGuard],
    title: 'Catálogo de Produtos - EstoKit'
  },
  {
    path: 'categorias',
    loadComponent: () => import('./pages/categorias/categorias.component').then(m => m.CategoriasComponent),
    canActivate: [authGuard],
    title: 'Categorias - EstoKit'
  },
  {
    path: 'fornecedores',
    loadComponent: () => import('./pages/fornecedores/fornecedores.component').then(m => m.FornecedoresComponent),
    canActivate: [authGuard],
    title: 'Fornecedores - EstoKit'
  },
  {
    path: 'compras',
    loadComponent: () => import('./pages/compras/compras.component').then(m => m.ComprasComponent),
    canActivate: [authGuard],
    title: 'Compras e Movimentações - EstoKit'
  },
  {
    path: 'funcionarios',
    loadComponent: () => import('./pages/funcionarios/funcionarios.component').then(m => m.FuncionariosComponent),
    canActivate: [adminGuard],
    title: 'Gestão de Funcionários - EstoKit'
  },
  {
    path: '**',
    redirectTo: 'estoque'
  }
];
