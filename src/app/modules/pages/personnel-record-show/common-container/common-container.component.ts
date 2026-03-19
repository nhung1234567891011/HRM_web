import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonnelRecordConstant } from 'src/app/core/constants/personnel-record.constant';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { ObjectService } from 'src/app/core/services/object.service';
import { environment } from 'src/environments/environment';
@Component({
    selector: 'app-common-container',
    templateUrl: './common-container.component.html',
    styleUrl: './common-container.component.scss',
})
export class CommonContainerComponent implements OnInit {
    items: any;
    Page: any = PersonnelRecordConstant;
    pageFlag: any = PersonnelRecordConstant.General;
    dataGetById: any;
    baseImageUrl = environment.baseApiImageUrl;
    id: number;
    constructor(
        private toastService: ToastService,
        private loadingService: LoadingService,
        private router: Router,
        private route: ActivatedRoute,
        private objectservice: ObjectService,
        private router1: ActivatedRoute
    ) {}

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            const page = params['page'];
            if (page) {
                if (page == 'job') this.pageFlag = 3;
                if (page == 'contact') this.pageFlag = 1;
                if (page == 'general') this.pageFlag = 2;
            } else {
                this.pageFlag = this.Page.General;
                this.router.navigate([], {
                    queryParams: { page: 'general' },
                    queryParamsHandling: 'merge',
                });
            }
        });

        this.items = [
            { label: 'Thông tin nhân sự' },
            { label: 'Hồ sơ', routerLink: '/profile' },
            { label: 'Chi tiết' },
        ];
        this.id = +this.router1.snapshot.paramMap.get('id')!;
        const request = { Id: this.id };
        this.getById(request);
    }

    handleChangePage(page) {
        this.pageFlag = page;
        const pageKey = page == 1 ? 'contact' : page == 2 ? 'general' : 'job';
        this.router.navigate([], {
            queryParams: { page: pageKey },
            queryParamsHandling: 'merge',
        });
    }

    getById(resquest: any) {
        this.objectservice.getInforEmployee(resquest).subscribe((res) => {
            this.dataGetById = res || [];
            console.log('this.getbyId', this.dataGetById);
        });
    }
}
