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

  constructor(
    private formBuilder: FormBuilder,
    private service: SheetService,
    private router: Router
  ) {
    this.googleSheetForm = this.formBuilder.group({
      name: formBuilder.control(''),
      sobrenome: formBuilder.control(''),
      datanasci: formBuilder.control(''),
      telefone: formBuilder.control(''),
      local: formBuilder.control(''),
    });
  }

  ngOnInit() {}

  public onSubmit() {
    console.log(this.googleSheetForm.value);

    const name = this.googleSheetForm.value.name;
    const sobrenome = this.googleSheetForm.value.sobrenome;
    const datanasci = this.googleSheetForm.value.datanasci;
    const telefone = this.googleSheetForm.value.telefone;
    const local = this.googleSheetForm.value.local;

    this.service.createSheet(name, sobrenome, datanasci, telefone, local).subscribe({
      next: (res) => {
        console.log(res);
        if (res) {
          // this.router.navigate(['/cadastro']);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  locais: string[] = [
    'ÁGUA VERDE', 'ANTONIO DIOGO','AQUIRAZ','ANCURI','ARACOIABA','ARUARU','BARREIRA', 'BAÚ', 'BELA VISTA', 'BOM JARDIM', 'CANINDÉ',
    'CARMO','CASTELÃO', 'CAUCAIA', 'CIDADE DOS FUNCIONÁRIOS','CONJUNTO CEARÁ','CRISTO REDENTOR','COCÓ','ESTRADA DO FIO','EUSÉBIO','FÁTIMA', 'GENIBAÚ', 'HORIZONTE','IPARANA', 'JARDIM GUANABARA','MARACANAÚ','MARANGUAPE','MESSEJANA','MONDUBIM','PACAJUS','PARANGABA','PARQUELÂNDIA','PASSARÉ',
    'PAZ','PECÉM', 'PEDRAS', 'PINDORETAMA','PRAIA DO FUTURO','QUINTINO CUNHA','REDENÇÃO','SÃO GONÇALO','SERRINHA' 
  ];
}