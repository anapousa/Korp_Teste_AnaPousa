import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private urlEstoque = 'http://localhost:5195'; 
  private urlFaturamento = 'http://localhost:5172'; 

  private atualizacaoSubject = new Subject<void>();

  constructor(private http: HttpClient) { }

  notificarAtualizacao() {
    this.atualizacaoSubject.next();
  }

  escutarAtualizacao(): Observable<void> {
    return this.atualizacaoSubject.asObservable();
  }

  cadastrarProduto(produto: any): Observable<any> {
    return this.http.post(`${this.urlEstoque}/produtos`, produto);
  }

  listarProdutos(): Observable<any> {
    return this.http.get(`${this.urlEstoque}/produtos`);
  }

  criarNota(nota: any): Observable<any> {
    return this.http.post(`${this.urlFaturamento}/notas`, nota);
  }

  adicionarItem(item: any): Observable<any> {
    return this.http.post(`${this.urlFaturamento}/itensNotaFiscal`, item);
  }

  imprimirNota(id: number): Observable<any> {
    return this.http.put(`${this.urlFaturamento}/notas/${id}/imprimir`, {});
  }

  buscarNota(id: number) {
    return this.http.get(`${this.urlFaturamento}/notas/${id}`);
  }
}