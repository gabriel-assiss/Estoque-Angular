import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Fornecedor, FornecedorRequest, PageResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/fornecedores`;

  salvar(fornecedor: FornecedorRequest): Observable<Fornecedor> {
    return this.http.post<Fornecedor>(this.baseUrl, fornecedor);
  }

  getTodos(page = 0, size = 10, sort = 'id,desc'): Observable<PageResponse<Fornecedor>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<Fornecedor>>(this.baseUrl, { params });
  }

  getPorId(id: number): Observable<Fornecedor> {
    return this.http.get<Fornecedor>(`${this.baseUrl}/${id}`);
  }

  buscarPorNome(nome: string, page = 0, size = 10): Observable<PageResponse<Fornecedor>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Fornecedor>>(`${this.baseUrl}/nome/${encodeURIComponent(nome)}`, { params });
  }

  atualizarNome(id: number, novoNome: string): Observable<Fornecedor> {
    const params = new HttpParams().set('nome', novoNome);
    return this.http.put<Fornecedor>(`${this.baseUrl}/${id}/nome`, null, { params });
  }

  inativar(id: number): Observable<Fornecedor> {
    return this.http.put<Fornecedor>(`${this.baseUrl}/${id}/inativar`, null);
  }

  ativar(id: number): Observable<Fornecedor> {
    return this.http.put<Fornecedor>(`${this.baseUrl}/${id}/ativar`, null);
  }
}
