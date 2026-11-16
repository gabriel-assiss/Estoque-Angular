import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Funcionario, FuncionarioRequest, PageResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class FuncionarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/funcionarios`;

  salvar(funcionario: FuncionarioRequest): Observable<Funcionario> {
    return this.http.post<Funcionario>(`${this.baseUrl}/salvar`, funcionario);
  }

  getTodos(page = 0, size = 10, sort = 'id,desc'): Observable<PageResponse<Funcionario>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<Funcionario>>(`${this.baseUrl}/todos`, { params });
  }

  getPorId(id: number): Observable<Funcionario> {
    return this.http.get<Funcionario>(`${this.baseUrl}/buscaid/${id}`);
  }

  buscarPorNome(nome: string, page = 0, size = 10): Observable<PageResponse<Funcionario>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Funcionario>>(`${this.baseUrl}/buscanome/${encodeURIComponent(nome)}`, { params });
  }

  atualizarNome(id: number, novoNome: string): Observable<Funcionario> {
    const params = new HttpParams().set('nome', novoNome);
    return this.http.put<Funcionario>(`${this.baseUrl}/atualizanome/${id}`, null, { params });
  }

  inativar(id: number): Observable<Funcionario> {
    return this.http.put<Funcionario>(`${this.baseUrl}/inativar/${id}`, null);
  }

  ativar(id: number): Observable<Funcionario> {
    return this.http.put<Funcionario>(`${this.baseUrl}/ativar/${id}`, null);
  }
}
