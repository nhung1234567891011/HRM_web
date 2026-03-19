// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-job-information',
//   templateUrl: './job-information.component.html',
//   styleUrl: './job-information.component.scss'
// })
// export class JobInformationComponent {

// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from 'chart.js';
import { AllowanceService } from 'src/app/core/services/allowance.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { LaborService } from 'src/app/core/services/labor.service';
import { ObjectService } from 'src/app/core/services/object.service';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import { StaffPositionService } from 'src/app/core/services/staff-position.service';

@Component({
    selector: 'app-job-information',
    templateUrl: './job-information.component.html',
    styleUrl: './job-information.component.scss',
})
export class JobInformationComponent {
    items: any;
    selectedCities!: any[];
    positionVisible: boolean = false;
    status: boolean = false;
    positionAddVisible: boolean = false;
    jobTitleVisible: boolean = false;
    date: any;
    checked: boolean = false;
    cities: any[] | undefined;

    selectedCity: any | undefined;
    allowances: any[] = [];

    //Contract
    contractTypes: any;

    //Dialog
    allowanceVisible: boolean = false;
    deductionsVisible: boolean = false;

    contractTypeVisible: boolean = false;
    selectedContructType: any;
    isContractTypeEditing: number | null = null; // Thêm biến này
    contractTypeCreateForm: FormGroup;
    contractTypeAddVisible: boolean | null = null;

    laborVisible: boolean = false;
    selectedLabor: any;
    isLaborEditing: number | null = null; // Thêm biến này
    laborAddVisible: boolean | null = null;
    // createAllowanceForm: FormGroup;
    createJobInfo: FormGroup;
    totalAmount: number = 0;
    allowanceAccount: any;
    allowanceStandard: any;
    allowanceValue: any;
    id: number;
    dataGetById: any;
    workstatus: any;
    list: any;
    foreginmoney: any[] = [];
    totalMoney: number;
    listALLLabol: any[] = [];
    listDeductions: any[];
    totalDeductions: number;
    reasonsForLeaving: any;

    constructor(
        private toastService: ToastService,
        private loadingService: LoadingService,
        private contractService: ContractService,
        private formBuilder: FormBuilder,
        private allowanceService: AllowanceService,
        private objectservice: ObjectService,
        private router: ActivatedRoute,
        private oragaservice: OrganiStructTypeService,
        private staffService: StaffPositionService,
        private labolService: LaborService
    ) {
        this.createJobInfo = this.formBuilder.group({
            //THông tin công việc
            organizationId:  [{ value: null, disabled: true }],
            staffPositionId:  [{ value: null, disabled: true }],
            staffTitleId:  [{ value: null, disabled: true }],
            timeKeepingId:  [{ value: null, disabled: true }],
            workingStatus: [{ value: null, disabled: true }],
            // jobTypeId:  [{ value: null, disabled: true }],
            jobTypeName:  [{ value: null, disabled: true }],
            workingArea:  [{ value: null, disabled: true }],
            workingLocation:  [{ value: null, disabled: true }],
            contractTypeId:  [{ value: null, disabled: true }],
            internshipStartDate: [{ value: null, disabled: true }],
            probationStartDate: [{ value: null, disabled: true }],
            officialStartDate: [{ value: null, disabled: true }],
            seniority:  [{ value: null, disabled: true }],
            retiredDate: [{ value: null, disabled: true }],
            level: [{ value: null, disabled: true }],
            bac: [{ value: null, disabled: true }],

            //Thông tin nghỉ việc
            reasonGroupQuitJob:  [{ value: null, disabled: true }],
            reasonQuitJob:  [{ value: null, disabled: true }],
            quitJobDate: [{ value: null, disabled: true }],
            opinionContribute:  [{ value: null, disabled: true }],

            //THông tin lương
            salaryLevel:  [{ value: null, disabled: true }],
            basicSalary:  [{ value: null, disabled: true }],
            insuranceSalary:  [{ value: null, disabled: true }],
            totalSalary:  [{ value: null, disabled: true }],
            bankAccountNumber: [null, Validators.pattern('^[0-9]*$')], // Validate số tài khoản
            bankName:  [{ value: null, disabled: true }],

            reviewer:  [{ value: null, disabled: true }],
        });

        // this.createAllowanceForm = this.formBuilder.group({
        //     accountId: [null, [Validators.required]],
        //     account:  [{ value: null, disabled: true }],
        //     standard: [0],
        //     standardId: [null],
        //     value: [0],
        //     valueId: [null],
        //     note: [null],
        // });

        this.workstatus = [
            {
                Title: 'Đang làm việc',
                code: 0,
            },
            {
                Title: 'Ngừng làm việc',
                code: 1,
            },
        ];
        this.reasonsForLeaving = [
            {
                label: 'Chế độ đãi ngỗ',
                value: '1',
            },
            {
                label: 'Phúc lợi',
                value: '2',
            },
        ];
    }
    ngOnInit() {
        this.listLabol();
        this.id = +this.router.snapshot.paramMap.get('id')!;
        const resquest = {
            Id: this.id,
        };
        this.getById(resquest);
        this.allowanceAccount = [
            {
                label: 'Khen thưởng nhân viên',
                value: '1',
            },
        ];
        this.allowanceStandard = [
            {
                label: 'Số tiền cố định',
                value: '1',
            },
        ];
        this.allowanceValue = [
            {
                label: 'Số tiền cố định',
                value: '1',
            },
        ];
        this.items = [
            { label: 'Thông tin nhân sự' },
            { label: 'Hồ sơ', routerLink: '/profile' },
            { label: 'Chi tiết' },
        ];
        this.cities = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' },
        ];
        this.loadPositionGroups();
        this.loadPosition();
        this.loadUnit();
        this.loadContractType();
        // this.loadAllowance();
      
    }

    loadContractType() {
        this.contractService.getPagingAll().subscribe((result) => {
            if (Array.isArray(result.items)) {
                this.contractTypes = result.items;
            } else {
                this.contractTypes = [];
                console.error('API did not return an array');
            }
        });
    }

    loadPositionGroups(): void {}
    loadPosition(): void {}
    loadUnit(): void {}
    // loadAllowance(): void {
    //     this.allowanceService.getPaging().subscribe((result) => {
    //         this.allowances = result.items || [];
    //         this.totalAmount = this.allowances?.reduce(
    //             (sum, item) => sum + (item.value || 0),
    //             0
    //         );
    //     });
    // }
    show() {
        console.log(1);
        this.toastService.showSuccess('Thành công', 'Thêm mới th');
    }

    startLoading() {
        this.loadingService.show();
    }

    handleCancelContractType() {
        //  groupAddVisible: boolean = false;
        if (this.contractTypeAddVisible) {
            this.contractTypeAddVisible = false;
        } else {
            this.contractTypeVisible = false;
        }
    }

    handleCreateContractType(): void {
        if (this.contractTypeCreateForm.valid) {
            this.contractService
                .createContractType(this.contractTypeCreateForm.value)
                .subscribe((result) => {
                    console.log(result);
                    if (result.status) {
                        this.contractTypeCreateForm.reset();
                        // this.loadContractType();
                    }
                });
        }
    }

    editContractType(index: number) {
        this.isContractTypeEditing = index;
    }

    saveContractTypeEdit(position: any) {
        this.contractService
            .updateContractType(position.id, position)
            .subscribe(() => {
                // this.loadContractType();
            });
        this.isContractTypeEditing = null;
    }

    // handleCreateAllowance(): void {
    //     this.contractService
    //         .createAllowance(this.createAllowanceForm.value)
    //         .subscribe((result) => {
    //             this.toastService.showSuccess(
    //                 'Thành công',
    //                 'Thêm mới phụ cấp thành công'
    //             );
    //             this.createAllowanceForm.reset();
    //             this.allowanceVisible = false;
    //             // this.loadAllowance();
    //         });
    // }

    ////////////////////////////////////////////////////////////////
    //Tính chất lao động
    handleCancelLabor() {
        //  groupAddVisible: boolean = false;
        if (this.laborAddVisible) {
            this.laborAddVisible = false;
        } else {
            this.laborVisible = false;
        }
    }
    listLabol() {
        const resquest = {
            pageIndex: 1,
            pageSize: 100000,
        };
        this.labolService.getPaging(resquest).subscribe((res) => {
            this.listALLLabol = res.items || [];
        });
    }

    getById(resquest: any) {
        this.objectservice.getInforEmployee(resquest).subscribe((res) => {
            if (res) {
                this.dataGetById = res;
                (this.foreginmoney = this.dataGetById?.contracts?.allowances),
                    (this.foreginmoney = this.dataGetById?.contracts?.flatMap(
                        (contract: any) => contract?.allowances
                    ));

                const jobTypeName =
                    this.listALLLabol.find(
                        (item) =>
                            item.id ===
                            this.dataGetById?.jobInfo?.natureOfLaborId
                    )?.name || 'Không xác định';

                this.totalMoney = 0;
                this.totalMoney = this.foreginmoney?.reduce(
                    (sum, item) => sum + (item?.value || 0),
                    0
                );
                this.listDeductions = this.dataGetById?.deductions;

                this.totalDeductions = this.listDeductions?.reduce(
                    (sum, item) => sum + (item?.value || 0),
                    0
                );
                //  console.log(this.dataGetById.);

                this.createJobInfo.patchValue({
                    organizationId:
                        this.dataGetById?.organizationLeaders[0]
                            ?.organizationName,
                    staffPositionId:
                        this.dataGetById?.staffPosition?.positionName,
                    staffTitleId: this.dataGetById?.staffTitle?.staffTitleName,
                    timeKeepingId: this.dataGetById?.jobInfo?.timeKeepingId,
                    workingStatus: this.dataGetById?.jobInfo?.workingStatus,
                    // jobTypeId: jobTypeName,
                    jobTypeName: jobTypeName,
                    workingArea: this.dataGetById?.jobInfo?.workingArea,
                    workingLocation: this.dataGetById?.jobInfo?.workingLocation,
                    contractTypeId: this.dataGetById?.jobInfo?.contractTypeId,
                    internshipStartDate: new Date(
                        this.dataGetById?.jobInfo?.internshipStartDate
                    ),
                    probationStartDate: new Date(
                        this.dataGetById?.jobInfo?.probationStartDate
                    ),
                    officialStartDate: new Date(
                        this.dataGetById?.jobInfo?.officialStartDate
                    ),
                    seniority: this.dataGetById?.jobInfo?.seniority,
                    retiredDate: new Date(
                        this.dataGetById?.jobInfo?.retiredDate
                    ),
                    level: this.dataGetById?.jobInfo?.level,
                    bac: this.dataGetById?.jobInfo?.bac,

                    //Thông tin nghỉ việc
                    reasonGroupQuitJob:
                        this.dataGetById?.jobInfo?.reasonGroupQuitJob,
                    reasonQuitJob: this.dataGetById?.jobInfo?.reasonQuitJob,
                    quitJobDate: this.dataGetById?.jobInfo?.quitJobDate
                        ? new Date(this.dataGetById?.jobInfo?.quitJobDate)
                        : null,
                    opinionContribute:
                        this.dataGetById?.jobInfo?.opinionContribute,

                    //THông tin lươngo
                    salaryLevel: this.dataGetById?.jobInf?.salaryLevel,
                    basicSalary: this.dataGetById?.jobInfo?.basicSalary,
                    insuranceSalary: this.dataGetById?.jobInfo?.insuranceSalary,
                    totalSalary: this.dataGetById?.jobInfo?.totalSalary,
                    bankAccountNumber:
                        this.dataGetById?.jobInfo?.bankAccountNumber, // Validate số tài khoản
                    bankName: this.dataGetById?.jobInfo?.bankName,

                    reviewer: this.dataGetById?.jobInfo?.reviewer,
                });
            } else {
                console.warn('No data received from API');
            }
        });
    }
}
