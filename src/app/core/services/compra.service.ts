import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Compra, CompraRequest, PageResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/compras`;

  salvar(compra: CompraRequest): Observable<Compra> {
    return this.http.post<Compra>(this.baseUrl, compra);
  }

  getTodas(page = 0, size = 10, sort = 'id,desc'): Observable<PageResponse<Compra>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<Compra>>(this.baseUrl, { params });
  }

  getPorId(id: number): Observable<Compra> {
    return this.http.get<Compra>(`${this.baseUrl}/${id}`);
  }

  buscarPorFuncionario(funcionarioId: number, page = 0, size = 10): Observable<PageResponse<Compra>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Compra>>(`${this.baseUrl}/funcionario/${funcionarioId}`, { params });
  }

  buscarPorFornecedor(fornecedorId: number, page = 0, size = 10): Observable<PageResponse<Compra>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Compra>>(`${this.baseUrl}/fornecedor/${fornecedorId}`, { params });
  }

  cancelar(id: number, idFuncionario: number): Observable<Compra> {
    // IMPORTANT: idFuncionario goes as query param in the URL
    const params = new HttpParams().set('idFuncionario', idFuncionario.toString());
    return this.http.put<Compra>(`${this.baseUrl}/${id}/cancelar`, null, { params });
  }
}
