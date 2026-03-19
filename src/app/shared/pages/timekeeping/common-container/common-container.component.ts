import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimekeepingConstant } from 'src/app/core/constants/timekeeoing.constant';
import { GeneralRulesComponent } from "../general-rules/general-rules.component";
import { AttendanceTrackingComponent } from "../attendance-tracking/attendance-tracking.component";


@Component({
  selector: 'app-common-container',
  templateUrl: './common-container.component.html',
  styleUrl: './common-container.component.scss',
 
})
export class CommonContainerComponent {
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
            { label: 'Quy định chấm công' },
        ];

   

  }
  handleChangePage(page) {
		this.pageFlag = page;
		const pageKey=page==1?'general':page==2?'tracking':'';
		this.router.navigate([], {
			queryParams: { 'page': pageKey }, 
			queryParamsHandling: 'merge', });
	}

}
