import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Subscription } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; 

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Recibo } from '../recibo/recibo'; 
import { ConsultaNota } from './consulta-notas';

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule 
  ],
  templateUrl: './notas.html',
  styleUrl: './notas.css'
})
export class Notas implements OnInit, OnDestroy {
  produtos: any[] = [];
  notaId: number | null = null;
  produtoSelecionado: any = null;
  quantidade: number = 1;
  carregandoImpressao: boolean = false;
  notaFechada: boolean = false; 
  itensDaNota: any[] = []; 
  
  private inscricao: Subscription = new Subscription();

  constructor(
    private api: ApiService, 
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.carregarProdutos();
    const subAtualizacao = this.api.escutarAtualizacao().subscribe(() => {
      this.carregarProdutos();
    });
    this.inscricao.add(subAtualizacao);
  }

  carregarProdutos() {
    const sub = this.api.listarProdutos().subscribe({
      next: (dados) => {
        this.produtos = dados;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        // TRATAMENTO DE FALHA DO MICROSSERVIÇO
        let mensagem = 'Erro ao carregar lista de produtos.';
        
        if (err.status === 0) {
          mensagem = 'Falha de comunicação: O Microsserviço de Estoque está offline!';
        } else if (err.status >= 500) {
          mensagem = 'Erro interno no servidor de Estoque.';
        }

        this.snackBar.open(mensagem, 'Fechar', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
    this.inscricao.add(sub);
  }

  ngOnDestroy() {
    this.inscricao.unsubscribe();
  }

  criarNota() {
    this.api.criarNota({ status: 'Aberta' }).subscribe({
      next: (res: any) => {
        this.notaId = res.id || res.Id || res.notaFiscalId; 
        this.notaFechada = false;
        this.produtoSelecionado = null;
        this.quantidade = 1;
        this.itensDaNota = []; 
        
        this.cdr.detectChanges(); 
        this.snackBar.open(`Nota ${this.notaId} criada com sucesso!`, 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        let msg = 'Erro ao criar a nota!';
        if (err.status === 0) msg = 'Sistema offline: Falha ao conectar no FaturamentoApi.';
        this.snackBar.open(msg, 'Fechar', { duration: 4000 });
      }
    });
  }

  adicionarProduto() {
    if (!this.notaId) {
      this.snackBar.open('Abra uma nova nota primeiro!', 'Fechar', { duration: 3000 });
      return;
    }
    
    if (this.notaFechada) {
      this.snackBar.open('Esta nota já está fechada! Por favor, abra uma nova nota.', 'Fechar', { duration: 4000 });
      return;
    }
    
    if (!this.produtoSelecionado || this.quantidade < 1) {
      this.snackBar.open('Escolha um produto e uma quantidade maior que zero!', 'Fechar', { duration: 3000 });
      return;
    }

    const estoqueDisponivel = this.produtoSelecionado.saldo ?? this.produtoSelecionado.Saldo ?? 0;
    if (this.quantidade > estoqueDisponivel) {
      this.snackBar.open('Erro: Quantidade solicitada é maior que o estoque disponível!', 'Fechar', { duration: 4000 });
      return;
    }

    const item = { 
      notaFiscalId: this.notaId, 
      produtoId: this.produtoSelecionado.id || this.produtoSelecionado.Id, 
      quantidade: this.quantidade 
    };
    
    this.api.adicionarItem(item).subscribe({
      next: () => {
        this.itensDaNota.push({
          produto: this.produtoSelecionado,
          quantidade: this.quantidade
        });
        this.snackBar.open('Produto adicionado à nota!', 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        let msg = 'Erro ao adicionar produto.';
        if (err.status === 0) msg = 'Sistema offline: Falha ao conectar no FaturamentoApi.';
        this.snackBar.open(msg, 'Fechar', { duration: 3000 });
      }
    });
  }

  imprimirNota() {
    if (!this.notaId) {
      this.snackBar.open('Abra uma nova nota primeiro antes de imprimir!', 'Fechar', { duration: 3000 });
      return;
    }

    this.carregandoImpressao = true;
    this.cdr.detectChanges();

    this.api.imprimirNota(this.notaId).subscribe({
      next: () => { 
        this.carregandoImpressao = false;
        this.notaFechada = true;
        
        this.api.notificarAtualizacao(); 
        this.cdr.detectChanges(); 
        this.snackBar.open('Nota impressa e fechada com sucesso!', 'Fechar', { duration: 3000 });

        this.dialog.open(Recibo, {
          width: '400px',
          panelClass: 'modal-quadrado',
          data: {
            notaId: this.notaId,
            itens: this.itensDaNota
          }
        });

        this.produtoSelecionado = null;
        this.quantidade = 1;
      },
      error: (err) => {
        this.carregandoImpressao = false;
        this.cdr.detectChanges(); 
        
        let mensagemErro = err.error?.detail || err.error || 'Estoque indisponível.';
        if (err.status === 0) mensagemErro = 'Falha de comunicação com o servidor de Faturamento.';
        
        this.snackBar.open(`Erro: ${mensagemErro}`, 'Fechar', { duration: 4000 });
      }
    });
  }

  abrirConsulta() {
    this.dialog.open(ConsultaNota, {
      width: '400px',
      panelClass: 'modal-quadrado'
    });
  }
}