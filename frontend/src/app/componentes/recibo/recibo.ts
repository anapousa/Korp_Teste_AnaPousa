import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recibo',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './recibo.html',
  styleUrl: './recibo.css'
})
export class Recibo {
  constructor(
    public dialogRef: MatDialogRef<Recibo>,
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {}

  fechar() {
    this.dialogRef.close();
  }
}