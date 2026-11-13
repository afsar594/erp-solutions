import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng';

@Component({
  selector: 'app-customer-sales-detail',
  templateUrl: './customer-sales-detail.component.html',
  styleUrls: ['./customer-sales-detail.component.scss']
})
export class CustomerSalesDetailComponent implements OnInit {
  title:string;
  subtitle:string;
   breadcumbmodel: MenuItem[];
  customersalesdetail: FormGroup;
  index: number = 0;
  handleChange(e) {
    this.index = e.index;
  }
   
    constructor(    private activatedroute: ActivatedRoute,
      private translate: TranslateService,
      private router: Router,
  private fb:FormBuilder
  
      ) { }
  
    ngOnInit(): void {
      this.customersalesdetail = new FormGroup({
        customername: new FormControl('', Validators.required),
         fromdate: new FormControl('', Validators.required),
        todate: new FormControl('', Validators.required),
      });
      this.activatedroute.data.subscribe(data => {
        this.title = data.title;
        this.subtitle = data.title;
        
      });
 
  
    }
    get f() {
      return this.customersalesdetail.controls;
    }
  
  }
  
