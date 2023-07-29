import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Sheet } from '../cadastro/sheet.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SheetService {
  constructor(private http: HttpClient) {}

  createSheet(
    nome: string,
    data_nascimento: string,
    endereco: string,
    telefone: string,
    email: string
  ): Observable<Sheet> {
    return this.http.post<Sheet>(`${environment.CONNECTION_URL}`, {
      nome,
      data_nascimento,
      endereco,
      telefone,
      email,
    });
  }


}