import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Produto, ProdutoRequest, PageResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/produtos`;

  salvar(produto: ProdutoRequest): Observable<Produto> {
    // IMPORTANT (per backend.md): quantidade deve obrigatoriamente ir como query param na URL (?quantidade=X)
    const params = new HttpParams().set('quantidade', produto.quantidade.toString());
    return this.http.post<Produto>(this.baseUrl, produto, { params });
  }

  getTodos(page = 0, size = 10, sort = 'id,desc'): Observable<PageResponse<Produto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<Produto>>(this.baseUrl, { params });
  }

  getPorId(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.baseUrl}/${id}`);
  }

  buscarPorNome(nome: string, page = 0, size = 10): Observable<PageResponse<Produto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Produto>>(`${this.baseUrl}/nome/${encodeURIComponent(nome)}`, { params });
  }

  buscarPorCategoria(categoriaNome: string, page = 0, size = 10): Observable<PageResponse<Produto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Produto>>(`${this.baseUrl}/categoria/${encodeURIComponent(categoriaNome)}`, { params });
  }

  inativar(id: number): Observable<Produto> {
    return this.http.put<Produto>(`${this.baseUrl}/${id}/inativar`, null);
  }

  ativar(id: number): Observable<Produto> {
    return this.http.put<Produto>(`${this.baseUrl}/${id}/ativar`, null);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
