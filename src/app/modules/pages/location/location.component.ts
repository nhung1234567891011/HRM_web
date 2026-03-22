import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import { ObjectService } from 'src/app/core/services/object.service';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import { TimekeepingLocationService } from 'src/app/core/services/timekeepingLocation.service';

@Component({
    selector: 'app-location',
    templateUrl: './location.component.html',
    styleUrl: './location.component.scss',
})
export class LocationComponent {
    dialogVisible: boolean;
    createLcocation: FormGroup;
    mapUrl: string;
    map: any;
    marker: any;
    updateVisible: boolean;
    iframeUrl: string = '';
    listAllEmployee: any;
    pageIndex: number = 1;
    pageSize: number = 10;
    totalItems: number = 0;
    listLocation:any [] =[];
    nameorganization: string[] = [];
    deleteLocation:boolean;
    iddeleteLocation: number;
    statusDeleteLocation: boolean;
    nameLocation: string;
    allColumns = [
        { field: 'name', header: 'Tên địa điểm' },
        { field: 'latitude', header: 'Vĩ độ' },
        { field: 'longitude', header: 'Kinh độ' },
        { field: 'allowableRadius', header: 'Bán kính cho phép(m)' },
        { field: 'action', header: 'Hành động' },
    ];
    selectedColumns: any[] = [...this.allColumns];
    constructor(
        private formBuilder: FormBuilder,
        private employeeObject: ObjectService,
        private route: ActivatedRoute,
        private router: Router,
        private locationService: TimekeepingLocationService,
        private organizationService: OrganiStructTypeService,
        private messageService: MessageService,
         public permisionHelper:HasPermissionHelper
    ) {}
    permissionConstant=PermissionConstant
    ngOnInit() {
        this.createLcocation = this.formBuilder.group({
            name: [null, Validators.required],
            Vd: [
                null,
                [
                    Validators.required,
                    Validators.pattern('^-?([1-8]?[0-9]|90)\\.\\d+$'),
                ],
            ],
            kd: [
                null,
                [
                    Validators.required,
                    Validators.pattern(
                        '^-?((([1-9])|([1-9][0-9]))\\d*)\\.(\\d+)$'
                    ),
                ],
            ],
            bk: [null, [Validators.required, Validators.min(1)]],
        });
        this.getAllLocation(this.pageIndex, this.pageSize);
    }

    showDialogcreate() {
        this.dialogVisible = true;
        console.log(this.mapUrl);
    }
    handleSubmit() {
        console.log(this.createLcocation.value);
    }
    handleClose() {
        (this.dialogVisible = false),
            this.createLcocation.patchValue({
                name: null,
                Vd: null,
                kd: null,
                bk: null,
            });
    }

    getAllLocation(
        pageIndex: number = this.pageIndex,
        pageSize: number = this.pageSize,
        filterData: any = null
    ) {
        const request = {
            pageIndex: pageIndex,
            pageSize: pageSize,
            ...filterData,
        };

        this.locationService.getAll(request).subscribe(
            (response) => {
                
                if (response && response.items) {
                    this.listLocation = response.items || [];

                    this.totalItems = response.totalRecords || 0;
                    this.pageIndex = response.pageIndex;
                    this.pageSize = response.pageSize;
                    // this.updatePageReport();
                } else {
                    this.listAllEmployee = [];
                    this.totalItems = 0;
                }
            },
            (error) => {
                // this.messageService.add({
                //     severity: 'error',
                //     summary: 'Lỗi',
                //     detail : ' Lỗi khi lấy danh sách đơn hàng'
                // })
            }
        );
    }
    onPageChange(event: any) {
        this.pageIndex = event.page + 1;
        this.pageSize = event.rows;

        const queryParams = { ...this.route.snapshot.queryParams };

        queryParams['pageIndex'] = this.pageIndex;
        queryParams['pageSize'] = this.pageSize;

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParams,
            queryParamsHandling: 'merge',
        });
     
        this.getAllLocation(this.pageIndex, this.pageSize, queryParams);
    }
    showDialogDeleteLocation(data: any) {
        this.nameorganization = [];
        this.iddeleteLocation = data.id;
        this.nameLocation = data.name
        this.deleteLocation = true;
        const resquest = {
            pageIndex: 1,
            pageSize: 100000
        }
        this.locationService.getLocationID(data.id,resquest).subscribe((res)=>{
            res.items.forEach((item)=>{
                this.organizationService.getByIdOrganiStruct(item.organizationId).subscribe((res)=>{
                        this.nameorganization.push(res.data.organizationName)
                })
            })
            this.statusDeleteLocation = this.nameorganization.length > 0 ? true : false;
        })
        // if(this.nameorganization.length > 0){
        //     this.statusDeleteLocation = true;
        // }
        // else{

        //     this.statusDeleteLocation= false;
        // }

            
    }
    handleDeleteLocation() {
        if(this.nameorganization.length === 0){
            this.locationService.deleteLocation(this.iddeleteLocation).subscribe((res)=>{
              if(res){
                this.nameorganization = [];
                this.getAllLocation(this.pageIndex, this.pageSize);
                this.deleteLocation = false;
                this.messageService.add({'severity':'success','summary':'Thành công','detail':'Xóa địa điểm thành công'});
              }
              else{
                this.nameorganization = [];
                  this.messageService.add({'severity':'warning','summary':'Xóa ','detail':'Xóa địa điểm thất bại'});
              }
            })
        }
    }

    isColVisible(field: string): boolean {
        return this.selectedColumns.some((c) => c.field === field);
    }

    onColumnToggle(event: any, col: any): void {
        if (event.checked) {
            if (!this.selectedColumns.some((c) => c.field === col.field)) {
                this.selectedColumns = this.allColumns.filter(
                    (c) =>
                        this.selectedColumns.some((s) => s.field === c.field) ||
                        c.field === col.field
                );
            }
        } else {
            this.selectedColumns = this.selectedColumns.filter(
                (c) => c.field !== col.field
            );
        }
    }
  
}
