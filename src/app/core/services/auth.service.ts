import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { LoginRequest, LoginResponse, FuncionarioRequest, Funcionario } from '../models/models';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  private readonly TOKEN_KEY = '@estoque:token';
  private readonly USER_KEY = '@estoque:user';

  readonly currentUser = signal<LoginResponse | null>(this.loadStoredUser());
  readonly token = signal<string | null>(this.loadStoredToken());

  readonly isAuthenticated = computed(() => !!this.token());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  readonly isPadrao = computed(() => this.currentUser()?.role === 'PADRAO');

  private loadStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadStoredUser(): LoginResponse | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as LoginResponse;
    } catch {
      return null;
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, credentials).pipe(
      tap((response) => {
        if (response && response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response));
          this.token.set(response.token);
          this.currentUser.set(response);
          this.toast.success(`Bem-vindo, ${response.nome || 'Usuário'}!`);
        }
      })
    );
  }

  register(data: FuncionarioRequest): Observable<Funcionario> {
    // According to backend.md, cadastro of employees is handled via POST /funcionarios/salvar
    return this.http.post<Funcionario>(`${API_BASE_URL}/funcionarios/salvar`, data);
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.token.set(null);
    this.currentUser.set(null);
    this.toast.info('Sessão encerrada com sucesso.');
    this.router.navigate(['/login']);
  }
}
