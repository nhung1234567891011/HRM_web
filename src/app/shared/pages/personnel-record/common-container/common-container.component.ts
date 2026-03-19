import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonnelRecordConstant } from 'src/app/core/constants/personnel-record.constant';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';

@Component({
	selector: 'app-common-container',
	templateUrl: './common-container.component.html',
	styleUrl: './common-container.component.scss'
})
export class CommonContainerComponent implements OnInit {

	items: any;
	Page: any = PersonnelRecordConstant;
	pageFlag: any = PersonnelRecordConstant.General;

	constructor(
		private toastService: ToastService,
		private loadingService: LoadingService,
		private router: Router,
		private route:ActivatedRoute
	) { }

	ngOnInit() {
		
		this.route.queryParams.subscribe(params => {
			const page = params['page']; 
			if (page) {
				if(page=='job')
				this.pageFlag = 3;
				if(page=='contact')
					this.pageFlag = 1;
				if(page=='general')
					this.pageFlag = 2;
			} else {
				this.pageFlag = this.Page.General; 
				this.router.navigate([], {
					queryParams: { 'page': 'general' }, 
					queryParamsHandling: 'merge', });
			}
		});
	
		this.items = [
			{ label: 'Thông tin nhân sự' },
			{ label: 'Hồ sơ', routerLink: '/profile' },
			{ label: 'Thêm mới' },
		];
	}

	handleChangePage(page) {
		this.pageFlag = page;
		const pageKey=page==1?'contact':page==2?'general':'job';
		this.router.navigate([], {
			queryParams: { 'page': pageKey }, 
			queryParamsHandling: 'merge', });
	}

}
