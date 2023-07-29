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
      data_nascimento: [localStorage.getItem(this.localStorageKey + '_data_nascimento') || '', Validators.required],
      endereco: [localStorage.getItem(this.localStorageKey + '_endereco') || '', Validators.required],
      telefone: [localStorage.getItem(this.localStorageKey + '_telefone') || '', Validators.required],
      email: [localStorage.getItem(this.localStorageKey + '_email') || '', [Validators.required, Validators.email]],
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
    const data_nascimento = this.googleSheetForm.value.data_nascimento;
    const endereco = this.googleSheetForm.value.endereco;
    const telefone = this.googleSheetForm.value.telefone;
    const email = this.googleSheetForm.value.email;
    
  
    if (navigator.onLine) {
      this.service.createSheet(nome, data_nascimento, endereco, telefone, email).subscribe({
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
        email,
        data_nascimento,
        telefone,
        endereco,
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
      const data_nascimento = formData.data_nascimento;
      const endereco = formData.endereco;
      const telefone = formData.telefone;
      const email = formData.email;

      // Enviar os dados para a planilha
      this.service.createSheet(nome, data_nascimento, endereco, telefone, email).subscribe({
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
}