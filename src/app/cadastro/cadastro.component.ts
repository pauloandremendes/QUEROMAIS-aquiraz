import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  municipios: string[] = [
    "AQUIRAZ", "ANCURÍ", "ARACOIABA", "ARUARU", "BARREIRA", "BAÚ", "BELA VISTA",
    "BOM JARDIM", "CANINDÉ", "CARMO", "CASTELÃO", "CAUCAIA", "CIDADE DOS FUNCIONÁRIOS",
    "CONJUNTO CEARÁ", "CRISTO REDENTOR", "COCÓ", "ESTRADA DO FIO", "EUSÉBIO", "FÁTIMA",
    "GENIBAÚ", "HORIZONTE", "IPARANA", "JARDIM GUANABARA", "MARACANAÚ", "MARANGUAPE",
    "MESSEJANA", "MONDUBIM", "PACAJUS", "PARANGABA", "PARQUELÂNDIA", "PASSARÉ", "ALDEOTA",
    "PECÉM", "PEDRAS", "PINDORETAMA", "PRAIA DO FUTURO", "QUINTINO CUNHA", "REDENÇÃO",
    "SÃO GONÇALO", "SERRINHA", "OUTROS"
  ];

  showMessage: boolean = false;

  hideMessage() {
    this.showMessage = false;
  }

  constructor(
    private formBuilder: FormBuilder,
    private service: SheetService,
    private router: Router
  ) {
    this.googleSheetForm = this.formBuilder.group({
      nome: [localStorage.getItem(this.localStorageKey + '_nome') || '', Validators.required],
      sobrenome: [localStorage.getItem(this.localStorageKey + '_sobrenome') || '', Validators.required],
      datanascimento: [localStorage.getItem(this.localStorageKey + '_datanascimento') || '', Validators.required],
      telefone: [localStorage.getItem(this.localStorageKey + '_telefone') || '', Validators.required],
      local: [localStorage.getItem(this.localStorageKey + '_local') || '', [Validators.required]],
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
  console.log(this.googleSheetForm);
  // Verificar se já existem registros no Local Storage
  let savedData = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');

  // Filtrar os registros que ainda não foram enviados
  const unsentData = savedData.filter((formData: any) => !formData.dataSent);

  // Preencher os campos do formulário com o último registro armazenado
  if (unsentData.length > 0) {
    const lastFormData = unsentData[unsentData.length - 1];
    this.googleSheetForm.setValue(lastFormData);
  }

  if (navigator.onLine) {
    this.sendDataToSheet();
  }
  }

  private markAllFieldsAsTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markAllFieldsAsTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  public onSubmit() {

    if (this.googleSheetForm.invalid) {
      this.markAllFieldsAsTouched(this.googleSheetForm); // Marca os campos inválidos como "touched" para mostrar as mensagens de erro
      return;
    }

    const nome = this.googleSheetForm.value.nome;    
    const sobrenome = this.googleSheetForm.value.sobrenome;
    const datanascimento = this.googleSheetForm.value.datanascimento;
    const telefone = this.googleSheetForm.value.telefone;
    const local = this.googleSheetForm.value.local;
    
  
    if (navigator.onLine) {
      this.service.createSheet(nome, sobrenome, datanascimento, telefone, local).subscribe({
        next: (res) => {
          console.log(res);
          if (res) {
            this.clearLocalStorage();
            this.clearFormFields();
  
            this.dataSent = false;

            this.showMessage = true;

            setTimeout(() => {
              this.hideMessage();
            }, 3000);
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
    } else {
      const formData = {
        nome,
        sobrenome,
        datanascimento,
        telefone,
        local,
        dataSent: false, // Definir a propriedade dataSent para false antes de salvar no Local Storage
      };
      // Verificar se já existem registros no Local Storage
      let savedData = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
  
      const newData = [...savedData];
  
      newData.push(formData);
  
      // Armazenar os dados atualizados no Local Storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(newData));
  
      this.clearFormFields(); 
    }
  }

  private dataSent = false;

  private sendDataToSheet() {
    // Verificar se existem dados armazenados no localStorage
    const savedData = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');

    if (savedData.length > 0) {
      const formData = savedData[0];
      const nome = formData.nome;      
      const sobrenome = formData.sobrenome;
      const datanascimento = formData.datanascimento;
      const telefone = formData.telefone;
      const local = formData.local;

      // Enviar os dados para a planilha
      this.service.createSheet(nome, sobrenome, datanascimento, telefone, local).subscribe({
        next: (res) => {
          console.log(res);
          if (res) {
            const index = savedData.indexOf(formData);
            if (index > -1) {
              savedData.splice(index, 1);
            }

            localStorage.setItem(this.localStorageKey, JSON.stringify(savedData));

          }
        },
        error: (error) => {
          console.log(error);
        },
      });
      this.dataSent = true;
    }
  }

  private clearLocalStorage() {
    localStorage.removeItem(this.localStorageKey);
  }

  private clearFormFields() {
    this.googleSheetForm.reset();
  }

  formatarTelefone(event: any): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (valor.length > 0) {
      valor = '(' + valor.substring(0, 2) + ') ' + valor.substring(2, 6) + '-' + valor.substring(6, 10);
    }
    input.value = valor;
  }
}