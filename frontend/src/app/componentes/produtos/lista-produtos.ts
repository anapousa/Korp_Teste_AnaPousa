import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar'; // Importado o SnackBar
import { ApiService } from '../../services/api'; 

@Component({
  selector: 'app-lista-produtos',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTableModule, MatIconModule],
  template: `
    <div style="padding: 24px; background-color: #f8f9fa;">
      <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #1a1a1a; display: flex; align-items: center; gap: 8px;">
        <mat-icon style="color: #5e35b1;">inventory</mat-icon> Estoque Atual
      </h2>
      
      <div style="background: white; border: 1px solid #eaeaea; border-radius: 4px; max-height: 350px; overflow-y: auto;">
        <table mat-table [dataSource]="produtos" style="width: 100%;">
          
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef style="font-weight: bold; color: #424242; background-color: white; position: sticky; top: 0; z-index: 100; width: 20%;"> Código </th>
            <td mat-cell *matCellDef="let p"> {{ p.id || p.Id }} </td>
          </ng-container>

          <ng-container matColumnDef="descricao">
            <th mat-header-cell *matHeaderCellDef style="font-weight: bold; color: #424242; background-color: white; position: sticky; top: 0; z-index: 100; width: 60%;"> Produto </th>
            <td mat-cell *matCellDef="let p"> {{ p.descricao || p.Descricao || 'Sem Descrição' }} </td>
          </ng-container>

          <ng-container matColumnDef="saldo">
            <th mat-header-cell *matHeaderCellDef style="font-weight: bold; color: #424242; background-color: white; position: sticky; top: 0; z-index: 100; width: 20%;"> Quantidade </th>
            <td mat-cell *matCellDef="let p"> {{ p.saldo || p.Saldo || 0 }} </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="colunas"></tr>
          <tr mat-row *matRowDef="let row; columns: colunas;"></tr>
        </table>

        <!-- Mensagem de lista vazia padrão -->
        <div *ngIf="produtos.length === 0 && !carregando && !erroCarregamento" style="padding: 24px; text-align: center; color: #757575;">
          Nenhum produto cadastrado no banco de dados.
        </div>

        <!-- NOVA Mensagem de falha de conexão -->
        <div *ngIf="erroCarregamento" style="padding: 24px; text-align: center; color: #d32f2f; font-weight: 500;">
          Não foi possível conectar ao servidor para buscar os dados.
        </div>
        
        <div *ngIf="carregando" style="padding: 24px; text-align: center; color: #5e35b1; font-weight: 500;">
          Buscando produtos... ⏳
        </div>
      </div>
    </div>
    
    <div mat-dialog-actions style="padding: 0 24px 24px 24px; background-color: #f8f9fa; justify-content: flex-end; margin-bottom: 0;">
      <button mat-flat-button style="background-color: #5e35b1; color: white; border-radius: 6px; padding: 0 24px; height: 44px;" (click)="fechar()">
        Fechar Tabela
      </button>
    </div>
  `
})
export class ListaProdutos implements OnInit {
  produtos: any[] = [];
  colunas: string[] = ['id', 'descricao', 'saldo'];
  carregando: boolean = true; 
  erroCarregamento: boolean = false; // Controle de falha

  constructor(
    public dialogRef: MatDialogRef<ListaProdutos>,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar // Injetado para dar o aviso visual
  ) {}

  ngOnInit() {
    this.carregando = true;
    this.erroCarregamento = false;

    this.api.listarProdutos().subscribe({
      next: (dados) => {
        this.produtos = dados.sort((a: any, b: any) => {
          const idA = a.id || a.Id || 0;
          const idB = b.id || b.Id || 0;
          return idA - idB;
        });
        
        this.carregando = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.carregando = false;
        this.erroCarregamento = true;
        this.cdr.detectChanges();

        let mensagem = 'Erro ao carregar lista de produtos.';
        if (err.status === 0) {
          mensagem = 'O serviço de estoque está temporariamente indisponível. Por favor, tente novamente mais tarde.';
        }
        
        this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
      }
    });
  }

  fechar() {
    this.dialogRef.close();
  }
}