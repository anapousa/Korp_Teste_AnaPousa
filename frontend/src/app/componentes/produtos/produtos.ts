import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { ApiService } from '../../services/api'; 

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; 

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ListaProdutos } from './lista-produtos';
import { ConsultaProduto } from './consulta-produtos'; 

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [
    FormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule 
  ], 
  templateUrl: './produtos.html',
  styleUrl: './produtos.css'
})
export class Produtos {
  produto = { descricao: '', saldo: 0 };

  constructor(
    private api: ApiService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog 
  ) {}

  salvar() {
    if (!this.produto.descricao || this.produto.saldo == null || this.produto.saldo < 0) {
      this.snackBar.open('É necessário preencher todos os campos obrigatórios.', 'Fechar', { duration: 3000 });
      return; 
    }

    this.api.cadastrarProduto(this.produto).subscribe({
      next: (resposta) => {
        this.snackBar.open('Produto cadastrado com sucesso!', 'Fechar', { duration: 3000 });
        this.produto = { descricao: '', saldo: 0 }; 
        this.api.notificarAtualizacao(); 
      },
      error: (err) => {
        console.error(err);
        
        // TRATAMENTO DE FALHA DO MICROSSERVIÇO
        let mensagem = 'Erro ao cadastrar produto.';
        if (err.status === 0) {
          mensagem = 'Sistema de estoque indisponível: Não é possível cadastrar produtos no momento.';
        }

        this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
      }
    });
  }

  abrirLista() {
    this.dialog.open(ListaProdutos, {
      width: '600px',
      panelClass: 'modal-quadrado'
    });
  }

  abrirConsultaProduto() {
    this.dialog.open(ConsultaProduto, {
      width: '400px',
      panelClass: 'modal-quadrado'
    });
  }
}