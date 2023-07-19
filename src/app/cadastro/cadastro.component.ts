import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Sheet } from 'src/app/cadastro/sheet.model';
import { SheetService } from 'src/app/cadastro/sheet.service';

@Component({
  selector: 'app-create-data',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css'],
})
export class CadastroComponent implements OnInit {
  googleSheetForm!: FormGroup;
  private localStorageKey = 'form_data';

  constructor(
    private formBuilder: FormBuilder,
    private service: SheetService,
    private router: Router
  ) {
    this.googleSheetForm = this.formBuilder.group({
      name: formBuilder.control(localStorage.getItem(this.localStorageKey + '_name') || ''),
      sobrenome: formBuilder.control(localStorage.getItem(this.localStorageKey + '_sobrenome') || ''),
      datanasci: formBuilder.control(localStorage.getItem(this.localStorageKey + '_datanasci') || ''),
      telefone: formBuilder.control(localStorage.getItem(this.localStorageKey + '_telefone') || ''),
      local: formBuilder.control(localStorage.getItem(this.localStorageKey + '_local') || ''),
    });

    window.addEventListener('online', () => {
      this.sendDataToSheet();
    });

    setInterval(() => {
      if (navigator.onLine) {
        this.sendDataToSheet();
      }
    }, 10000);
  }

  ngOnInit() {
    // Verificar se já existem registros no Local Storage
    let savedData = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');

    // Preencher os campos do formulário com o último registro armazenado
    if (savedData.length > 0) {
      const lastFormData = savedData[savedData.length - 1];
      this.googleSheetForm.setValue(lastFormData);
    }

    if (navigator.onLine) {
      this.sendDataToSheet();
    }
  }

  public onSubmit() {
    const name = this.googleSheetForm.value.name;
    const sobrenome = this.googleSheetForm.value.sobrenome;
    const datanasci = this.googleSheetForm.value.datanasci;
    const telefone = this.googleSheetForm.value.telefone;
    const local = this.googleSheetForm.value.local;

    if(navigator.onLine){
      this.service.createSheet(name, sobrenome, datanasci, telefone, local).subscribe({
        next: (res) => {
          console.log(res);
          if (res) {
            this.clearLocalStorage();
            this.clearFormFields();
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    } else {
      const formData = {
        name,
        sobrenome,
        datanasci,
        telefone,
        local,
      };
      // Verificar se já existem registros no Local Storage
      let savedData = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');

      // Adicionar o novo registro ao array de objetos
      savedData.push(formData);

      // Armazenar os dados atualizados no Local Storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(savedData));

      this.clearFormFields(); 
    }
  }

  private sendDataToSheet() {
    // Verificar se existem dados armazenados no localStorage
    const savedData = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');

    if (savedData.length > 0) {
      const formData = savedData[0];
      const name = formData.name;
      const sobrenome = formData.sobrenome;
      const datanasci = formData.datanasci;
      const telefone = formData.telefone;
      const local = formData.local;

      // Enviar os dados para a planilha
      this.service.createSheet(name, sobrenome, datanasci, telefone, local).subscribe({
        next: (res) => {
          console.log(res);
          if (res) {
            // Remover o registro enviado do Local Storage
            savedData.shift();
            localStorage.setItem(this.localStorageKey, JSON.stringify(savedData));
            // Enviar o próximo registro (se houver)
            this.sendDataToSheet();
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }

  private clearLocalStorage() {
    localStorage.removeItem(this.localStorageKey);
  }

  private clearFormFields() {
    this.googleSheetForm.reset();
  }

  locais: string[] = [
    'ÁGUA VERDE', 'ANTONIO DIOGO','AQUIRAZ','ANCURI','ARACOIABA','ARUARU','BARREIRA', 'BAÚ', 'BELA VISTA', 'BOM JARDIM', 'CANINDÉ',
    'CARMO','CASTELÃO', 'CAUCAIA', 'CIDADE DOS FUNCIONÁRIOS','CONJUNTO CEARÁ','CRISTO REDENTOR','COCÓ','ESTRADA DO FIO','EUSÉBIO','FÁTIMA', 'GENIBAÚ', 'HORIZONTE','IPARANA', 'JARDIM GUANABARA','MARACANAÚ','MARANGUAPE','MESSEJANA','MONDUBIM','PACAJUS','PARANGABA','PARQUELÂNDIA','PASSARÉ',
    'PAZ','PECÉM', 'PEDRAS', 'PINDORETAMA','PRAIA DO FUTURO','QUINTINO CUNHA','REDENÇÃO','SÃO GONÇALO','SERRINHA' 
  ];
}