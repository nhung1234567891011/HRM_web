import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimekeepingConstant } from 'src/app/core/constants/timekeeoing.constant';
import { HolidayComponent } from '../holiday/holiday.component';
import { TypeOfVacationComponent } from '../type-of-vacation/type-of-vacation.component';

@Component({
  selector: 'app-regulations-common',
  templateUrl: './regulations-common.component.html',
  styleUrl: './regulations-common.component.scss'
})
export class RegulationsCommonComponent {
  items: any;
  Page: any = TimekeepingConstant;
  pageFlag : any = TimekeepingConstant.General
  
    constructor(
      private router: Router,
      private route : ActivatedRoute
    ){}
  
    ngOnInit(){
      this.route.queryParams.subscribe(params => {
        const page = params['page'];
        if(page){
          if( page=='general')
            this.pageFlag= 1;
          if( page=='tracking')
            this.pageFlag= 2;
          if ( page=='checking')
            this.pageFlag= 3;
        }
        else{
          this.pageFlag= this.Page.General;
          this.router.navigate([],{
            queryParams: {'page':' general'},
            queryParamsHandling:'merge',});
          }
        
      });
      this.items = [
        { label: 'Thiết lập' },
        { label: 'Quy định nghỉ' },
      ];
  
     
  
    }
    handleChangePage(page) {
      this.pageFlag = page;
      const pageKey = page == 1 ? 'general' : page == 2 ? 'tracking' : page == 3 ? 'checking' : '';
      this.router.navigate([], {
        queryParams: { 'page': pageKey },
        queryParamsHandling: 'merge',
      });
    }    
}
