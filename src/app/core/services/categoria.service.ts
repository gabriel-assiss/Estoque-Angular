import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Categoria, CategoriaRequest, PageResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/categorias`;

  salvar(categoria: CategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(this.baseUrl, categoria);
  }

  getTodas(page = 0, size = 10, sort = 'id,desc'): Observable<PageResponse<Categoria>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<Categoria>>(this.baseUrl, { params });
  }

  getPorId(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.baseUrl}/${id}`);
  }

  getAtivas(page = 0, size = 50): Observable<PageResponse<Categoria>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Categoria>>(`${this.baseUrl}/ativas`, { params });
  }

  getInativas(page = 0, size = 50): Observable<PageResponse<Categoria>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Categoria>>(`${this.baseUrl}/inativas`, { params });
  }

  buscarPorNome(nome: string, page = 0, size = 10): Observable<PageResponse<Categoria>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Categoria>>(`${this.baseUrl}/nome/${encodeURIComponent(nome)}`, { params });
  }

  atualizar(id: number, categoria: CategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/${id}`, categoria);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
