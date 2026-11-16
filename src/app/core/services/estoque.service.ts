import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Estoque, PageResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/estoques`;

  getTodos(page = 0, size = 20): Observable<PageResponse<Estoque>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Estoque>>(this.baseUrl, { params });
  }

  getPorId(id: number): Observable<Estoque> {
    return this.http.get<Estoque>(`${this.baseUrl}/${id}`);
  }

  adicionarQuantidade(idProduto: number, quantidade: number): Observable<void> {
    const params = new HttpParams().set('quantidade', quantidade.toString());
    return this.http.put<void>(`${this.baseUrl}/adicionar/${idProduto}`, null, { params });
  }

  subtrairQuantidade(idProduto: number, quantidade: number): Observable<void> {
    const params = new HttpParams().set('quantidade', quantidade.toString());
    return this.http.put<void>(`${this.baseUrl}/subtrair/${idProduto}`, null, { params });
  }
}
