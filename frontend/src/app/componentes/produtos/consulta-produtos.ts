import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-consulta-produto',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div style="padding: 24px; background-color: #f8f9fa;">
      <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #1a1a1a; display: flex; align-items: center; gap: 8px;">
        <mat-icon style="color: #5e35b1;">search</mat-icon> Consultar Produto
      </h2>
      <p style="margin-bottom: 20px; color: #424242; font-size: 14px;">Busque um produto digitando seu código ou nome:</p>

      <mat-form-field appearance="outline" style="width: 100%;" subscriptSizing="dynamic">
        <mat-icon matPrefix>inventory_2</mat-icon>
        <input matInput [(ngModel)]="termoBusca" placeholder="Ex: 5 ou Teclado" (keyup.enter)="buscar()">
      </mat-form-field>

      <div *ngIf="resultadoBusca" style="margin-top: 20px; padding: 16px; background: white; border: 1px solid #eaeaea; border-radius: 6px;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #5e35b1;">Produto Encontrado:</h3>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Código:</strong> {{ resultadoBusca.id || resultadoBusca.Id }}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Descrição:</strong> {{ resultadoBusca.descricao || resultadoBusca.Descricao }}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Estoque Atual:</strong> {{ resultadoBusca.saldo || resultadoBusca.Saldo }} unidades</p>
      </div>
    </div>

    <div mat-dialog-actions style="padding: 20px 24px; background-color: #f8f9fa; justify-content: flex-end; margin-bottom: 0; gap: 12px;">
      <button mat-button (click)="fechar()">Fechar</button>
      <button mat-flat-button style="background-color: #5e35b1; color: white; padding: 0 24px;" (click)="buscar()" [disabled]="!termoBusca || buscando">
        {{ buscando ? 'Buscando...' : 'Buscar' }}
      </button>
    </div>
  `
})
export class ConsultaProduto implements OnInit {
  termoBusca: string = '';
  buscando: boolean = false;
  resultadoBusca: any = null;
  todosProdutos: any[] = [];
  erroAPI: boolean = false; // Controle de falha

  constructor(
    public dialogRef: MatDialogRef<ConsultaProduto>,
    private api: ApiService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.api.listarProdutos().subscribe({
      next: (dados) => {
        this.todosProdutos = dados;
        this.erroAPI = false;
      },
      error: (err) => {
        this.erroAPI = true;
        // TRATAMENTO DE FALHA DO MICROSSERVIÇO
        let mensagem = 'Erro ao buscar base de produtos.';
        if (err.status === 0) {
          mensagem = 'Sistema de estoque indisponível: Não é possível listar os produtos no momento.';
        }
        this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
      }
    });
  }

  fechar() {
    this.dialogRef.close();
  }

  buscar() {
    if (!this.termoBusca) return;

    if (this.erroAPI) {
      this.snackBar.open('Sistema indisponível: Não é possível realizar a busca no momento.', 'Fechar', { duration: 4000 });
      return;
    }
    
    this.buscando = true;
    this.resultadoBusca = null;
    this.cdr.detectChanges();

    setTimeout(() => {
      const termoLimpo = this.termoBusca.toString().toLowerCase().trim();
      
      this.resultadoBusca = this.todosProdutos.find(p => {
        const id = (p.id || p.Id)?.toString();
        const desc = (p.descricao || p.Descricao)?.toLowerCase();
        return id === termoLimpo || desc?.includes(termoLimpo);
      });

      this.buscando = false;
      this.cdr.detectChanges();

      if (!this.resultadoBusca) {
        this.snackBar.open('Nenhum produto encontrado com este termo ou código.', 'Fechar', { duration: 3000 });
      }
    }, 300);
  }
}