import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api';
import { Recibo } from '../recibo/recibo'; 

@Component({
  selector: 'app-consulta-nota',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div style="padding: 24px; background-color: #f8f9fa;">
      <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #1a1a1a; display: flex; align-items: center; gap: 8px;">
        <mat-icon style="color: #5e35b1;">search</mat-icon> Consultar Nota
      </h2>
      <p style="margin-bottom: 20px; color: #424242; font-size: 14px;">Digite o número da nota fiscal para visualizar o comprovante:</p>

      <mat-form-field appearance="outline" style="width: 100%;" subscriptSizing="dynamic">
        <mat-icon matPrefix>receipt</mat-icon>
        <input matInput type="number" [(ngModel)]="notaIdBusca" placeholder="Ex: 51" (keyup.enter)="buscar()">
      </mat-form-field>
    </div>

    <div mat-dialog-actions style="padding: 20px 24px; background-color: #f8f9fa; justify-content: flex-end; margin-bottom: 0; gap: 12px;">
      <button mat-button (click)="fechar()">Cancelar</button>
      <button mat-flat-button style="background-color: #5e35b1; color: white; padding: 0 24px;" (click)="buscar()" [disabled]="!notaIdBusca || buscando">
        {{ buscando ? 'Buscando...' : 'Buscar Nota' }}
      </button>
    </div>
  `
})
export class ConsultaNota {
  notaIdBusca: number | null = null;
  buscando: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ConsultaNota>,
    private api: ApiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef // Adicionamos o atualizador de tela aqui!
  ) {}

  fechar() {
    this.dialogRef.close();
  }

  buscar() {
    if (!this.notaIdBusca) return;
    
    this.buscando = true;
    this.cdr.detectChanges(); // Força a tela a mostrar "Buscando..."

    this.api.buscarNota(this.notaIdBusca).subscribe({
      next: (notaRetornada: any) => {
        this.buscando = false;
        this.fechar();

        let itensDaNota = notaRetornada.itens || notaRetornada.Itens || notaRetornada.itensNotaFiscal || [];

        this.dialog.open(Recibo, {
          width: '400px',
          panelClass: 'modal-quadrado',
          data: {
            notaId: notaRetornada.id || notaRetornada.Id || this.notaIdBusca,
            itens: itensDaNota
          }
        });
      },
      error: (err) => {
        this.buscando = false;
        this.cdr.detectChanges(); // Força a tela a destravar o botão após o erro!
        this.snackBar.open('Nota não encontrada no sistema.', 'Fechar', { duration: 4000 });
      }
    });
  }
}