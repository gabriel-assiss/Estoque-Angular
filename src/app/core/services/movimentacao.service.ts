import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { MovimentacaoEstoque, PageResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class MovimentacaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/movimentacoes`;

  buscarPorFuncionario(funcionarioId: number, page = 0, size = 15): Observable<PageResponse<MovimentacaoEstoque>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<MovimentacaoEstoque>>(`${this.baseUrl}/funcionario/${funcionarioId}`, { params });
  }

  buscarPorProduto(produtoId: number, page = 0, size = 15): Observable<PageResponse<MovimentacaoEstoque>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<MovimentacaoEstoque>>(`${this.baseUrl}/produto/${produtoId}`, { params });
  }

  buscarPorProdutoEFuncionario(produtoId: number, funcionarioId: number, page = 0, size = 15): Observable<PageResponse<MovimentacaoEstoque>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<MovimentacaoEstoque>>(`${this.baseUrl}/produto/${produtoId}/funcionario/${funcionarioId}`, { params });
  }
}
