import { Component } from '@angular/core';
import { Produtos } from './componentes/produtos/produtos';
import { Notas } from './componentes/notas/notas';
import { MatIconModule } from '@angular/material/icon'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Produtos, Notas, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent { }