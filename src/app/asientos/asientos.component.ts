import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VuelosService } from '../services/vuelos.service';
import {SeatsioAngularModule} from '@seatsio/seatsio-angular'
import { SeatsioClient, Region } from 'seatsio';
import { NgForm } from '@angular/forms';
import { NgModel } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Pasajeroinfo } from '../shared/models/pasajero.model';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';



@Component({
  selector: 'app-asientos',
  templateUrl: './asientos.component.html',
  styleUrls: ['./asientos.component.scss'],
})
export class AsientosComponent {
  vuelo_id:any;
  clase:any;
  asiento:any;
  config:any;
  pasajeros:any;
  category:number;
  informacionPasajeros:any;
  form:FormGroup;
  asientos:any;
  seleccion:any;
  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private cookieService:CookieService,
    private fb:FormBuilder
  ){
    // console.log("hey");
    // this.reservarAsientos();
    // this.form=this.fb.group({
      
    // });

    this.route.params.subscribe(params=>{
      let info=params['info'];
      this.vuelo_id=info.split('-')[0];
      this.clase=info.split('-')[1];
      this.asiento=info.split('-')[2];
      this.cookieService.set('vuelo_id',this.vuelo_id)
      this.cookieService.set('clase',this.clase);
      this.cookieService.set('asiento',this.asiento);
    });
      this.seleccion = {adultos_mayores:[],adultos:[],ninos:[],infantes:[]};
      this.pasajeros = JSON.parse(this.cookieService.get('pasajeros')) 
      this.informacionPasajeros = {adultos_mayores:this.fb.array([]), adultos:this.fb.array([]), ninos:this.fb.array([]), infantes:this.fb.array([])}
      for(let i=0;i<this.pasajeros.adultos_mayores;i++){
        this.informacionPasajeros.adultos_mayores.push(this.fb.group({
          asiento: '',
          nombre: '',
          apellido: '',
          nacionalidad: '',
          pasaporte: '',
          fechaNacimiento:''
        }));
      }
      for(let i=0;i<this.pasajeros.adultos;i++){
        this.informacionPasajeros.adultos.push(this.fb.group({
          asiento: '',
          nombre: '',
          apellido: '',
          nacionalidad: '',
          pasaporte: '',
          fechaNacimiento:''
        }));
      }
      for(let i=0;i<this.pasajeros.ninos;i++){
        this.informacionPasajeros.ninos.push(this.fb.group({
          asiento: '',
          nombre: '',
          apellido: '',
          nacionalidad: '',
          pasaporte: '',
          fechaNacimiento:''
        }));
      }
      for(let i=0;i<this.pasajeros.infantes;i++){
        this.informacionPasajeros.infantes.push(this.fb.group({
          asiento: '',
          nombre: '',
          apellido: '',
          nacionalidad: '',
          pasaporte: '',
          fechaNacimiento:''
        }));
      }
      let ticketTypesMap = [
        { ticketType:'Adulto Mayor', price: this.asiento*0.5},
        { ticketType:'Adulto', price: this.asiento},
        { ticketType:'Ninio', price: this.asiento},
        { ticketType:'Infante', price: 0}
      ];
      let maxSelectedObjectsMap = [
        { category: this.clase.toUpperCase(), ticketTypes:[
          {ticketType:'Adulto Mayor', quantity: this.pasajeros.adultos_mayores},
          {ticketType:'Adulto', quantity: this.pasajeros.adultos},
          {ticketType:'Ninio', quantity: this.pasajeros.ninos},
          {ticketType:'Infante', quantity: this.pasajeros.infantes}
        ]}        
      ]
      this.config = {
      region: 'sa', // e.g. "eu"
      workspaceKey: '26b63090-3ae6-4517-ac96-f899acb49252',
      event: this.vuelo_id,
      session: 'continue',
      language: 'es',
      categoryFilter: { enabled: true, zoomOnSelect: true },
      pricing: [
        {
          category: 1,
          ticketTypes: ticketTypesMap
        },
        {
          category: 2,
          ticketTypes: ticketTypesMap
        },
      ],
      maxSelectedObjects: maxSelectedObjectsMap,
      priceFormatter: (price: number) => '$' + price,
      selectedObjectsInputName: 'selectedSeatsField'
    };
  }
  
  reservarAsientos(form:any){
    console.log(document.getElementsByName('selectedSeatsField')[0].getAttribute('value')?.split(','));
    this.asientos=document.getElementsByName('selectedSeatsField')[0].getAttribute('value')?.split(',');
    this.consultarEstado(this.asientos);
    console.log(this.seleccion);
    console.log(this.informacionPasajeros);
  }
  parseClases(clase:string){
    if(clase=='vip') return 1;
    else return 2;
  }
  imprimirPasajeros(){
    // console.log(this.informacionPasajeros.split);
  }
  consultarEstado(asientos:any){
    this.seleccion={adultos_mayores:[],adultos:[],ninos:[],infantes:[]};
    let client = new SeatsioClient(Region.SA(), '3675e545-9ec7-4a50-8b5f-9707cb85f058');
    client.events.retrieveObjectInfos(this.vuelo_id, asientos)
    .then((response)=>{
      let resp = JSON.parse(JSON.stringify(response));
      this.asientos.forEach((element:any) => {
        // this.seleccion.push({asiento:element, ticketType:resp[element].ticketType})
        switch (resp[element].ticketType){
          case 'Adulto Mayor':
            this.seleccion.adultos_mayores.push(element);
            break;
          case 'Adulto':
            this.seleccion.adultos.push(element);
            break;
          case 'Ninio':
            this.seleccion.ninos.push(element);
            break;
          case 'Infante':
            this.seleccion.infantes.push(element);
            break;
        }
      });
    })
    .catch(error=>{
      console.log(error);
    });    
  }
  guardarPasajeros(){
    let total = this.asiento*this.pasajeros.adultos + 0.5*this.asiento*this.pasajeros.adultos_mayores + this.asiento*this.pasajeros.ninos;
    let informacion={
      precio_base:this.asiento,
      precio_total:total,
      vuelo_id:this.vuelo_id,
      clase:this.clase,
      asientos:this.asientos,
      distribucion_asientos:this.seleccion,
      pasajeros: {
        adultos_mayores:this.informacionPasajeros.adultos_mayores.value,
        adultos:this.informacionPasajeros.adultos.value,
        ninos:this.informacionPasajeros.ninos.value,
        infantes:this.informacionPasajeros.infantes.value
      }
    }
    console.log(this.seleccion.adultos_mayores.length)
    for(let i=0;i<this.seleccion.adultos_mayores.length;i++){
      informacion.pasajeros.adultos_mayores[i].asiento=this.asientos.adultos_mayores[i];
    }
    for(let i=0;i<this.seleccion.adultos.length;i++){
      informacion.pasajeros.adultos[i].asiento=this.asientos.adultos[i];
    }
    for(let i=0;i<this.seleccion.ninos.length;i++){
      informacion.pasajeros.ninos[i].asiento=this.asientos.ninos[i];
    }
    for(let i=0;i<this.seleccion.infantes.length;i++){
      informacion.pasajeros.infantes[i].asiento=this.asientos.infantes[i];
    }
    // console.log(this.asiento);
    // console.log(this.seleccion);
    // console.log(this.asientos);
    // console.log(this.informacionPasajeros);
    // console.log(this.informacionPasajeros.adultos_mayores.value);
    // console.log(this.informacionPasajeros.adultos.value);
    // console.log(this.informacionPasajeros.ninos.value);
    // console.log(this.informacionPasajeros.infantes.value);
    console.log(informacion);
  }
}
