import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { MessageService, TreeNode } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';
import {
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    AbstractControl,
} from '@angular/forms';
import { CompanyInfoService } from 'src/app/core/services/company-info.service';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import { ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/identity/auth.service';

@Component({
    selector: 'app-organi-struct-update',
    templateUrl: './organi-struct-update.component.html',
    styleUrl: './organi-struct-update.component.scss',
})
export class OrganiStructUpdateComponent {
    items: any;
    cities: any[] = [];
    selectedCity: any;
    level: any[] = [];
    selectedLevel: any;
    date: string | '';
    countries: any[] | '';
    dialogVisible: boolean = false;
    checked: boolean = false;
    selectedCountry: string | undefined;
    isCreateUnit: boolean = true;
    isUnitCodeInvalid: boolean = false;
    isUnitCodeInvalidName: boolean = false;
    isParentUnitInvalid: boolean = false;
    isLevelUnitInvalid: boolean = false;
    isParentUnitClicked: boolean = false;
    isLevelUnitClicked: boolean = false;
    isDropdownInvalid: boolean = false;
    isDropdownTouched: boolean = false;
    organizationLevels: any[];
    organizationLeaders: any[];
    selectDepartmentHeads: any[];
    nodes: any[] = [];
    checkedMap: { [key: string]: boolean } = {};
    listAllcompany: any[] = [];
    listOrganiType: any[];
    listEmployee: any[] = [];
    organizationTypeNameNew: string = '';
    tempSelectedOrganiType: any = null;
    listAllName: any[];
    selectedOrganiType: any = null;
    nodeID: number = 0;
    unitForm: FormGroup;
    allOrganizationCodes: string[] = [];
    allOrganizationCodesSubject = new BehaviorSubject<string[]>([]);
    allOrganizationCodes$ = this.allOrganizationCodesSubject.asObservable();
    id: number | null;
    dataGetByID: any[];
    organizationTypeControl = new FormControl('');
    nodesCompanyId: number;
    companyIDHere: number;
    idoraganization:number
    constructor(
        private toastService: ToastService,
        private loadingService: LoadingService,
        private fb: FormBuilder,
        private organitype: OrganiStructTypeService,
        private router: ActivatedRoute,
        private router1: Router,
        private authService: AuthService,
         private messageService: MessageService
    ) {}
    ngOnInit() {
        this.items = [
            { label: 'Hệ thống' },
            { label: 'Cơ cấu tổ chức', routerLink: '/organizational-structure/show' },
            { label: 'Cập nhật' },
        ];
        this.authService.userCurrent.subscribe((user) => {
            this.idoraganization = user.organization.id})
        this.listAllOrganiStruct();
        this.getAllEmployee();
        this.listOrganitype();
        this.listCompany(),
            this.organitype
                .getAllOrganiStruct({ parseInt: 1, pageSize: 100000 })
                .subscribe((res) => {
                    if (res && res.data) {
                        this.allOrganizationCodes = res.data.items.map(
                            (item) => item.organizationCode
                        );
                    }
                });

        // this.level.forEach((pr) => {
        //     this.checkedMap[pr.code] = false;
        // });

        // this.transformDataToTreeStructure()

        this.unitForm = this.fb.group({
            organizationCode: ['', [Validators.required], ,],
            organizationName: [
                '',
                [Validators.required, this.noWhitespaceValidator],
            ],
            abbreviation: [''],
            organizatioParentId: [undefined, Validators.required],
            organizationTypeId: [null, Validators.required],
            rank: [null, [Validators.min(1), Validators.max(3)]],
            organizationLeaders: [[]],
            organizationDescription: [''],
            businessRegistrationCode: [''],
            businessRegistrationDate: [''],
            issuingAuthority: [''],
            organizationAddress: [''],
        });

        this.id = +this.router.snapshot.paramMap.get('id')!;
        this.getById(this.id);
    }
    // hàm lấy get by ID

    getById(id: number) {
        this.listCompanyToTreeSelect();

        setTimeout(() => {
            this.organitype.getByIdOrganiStruct(id).subscribe(
                (res) => {
                    if (res && res.data) {
                        this.unitForm.patchValue({
                            organizationCode: res.data.organizationCode,
                            organizationName: res.data.organizationName,
                            abbreviation: res.data.abbreviation,
                            organizatioParentId: res.data.organizatioParentId,
                            organizationTypeId: res.data.organizationTypeId,
                            rank: res.data.rank,
                            organizationDescription:
                                res.data.organizationDescription,
                            businessRegistrationCode:
                                res.data.businessRegistrationCode,
                            businessRegistrationDate: res.data
                                .businessRegistrationDate
                                ? new Date(res.data.businessRegistrationDate)
                                : null,
                            issuingAuthority: res.data.issuingAuthority,
                            organizationAddress: res.data.organizationAddress,
                        });


                        // Cập nhật leaders
                        const leaders = res.data.organizationLeaders
                            .map((leader: any) => {
                                return this.listEmployee.find(
                                    (emp) => emp.id === leader.employee.id
                                );
                            })
                            .filter((head: any) => head !== undefined);
                        this.unitForm.patchValue({
                            organizationLeaders: leaders,
                        });

                        // Cập nhật loại tổ chức
                        const selectedOrganiType = this.listOrganiType.find(
                            (type) => type.id === res.data.organizationTypeId
                        );
                        this.selectedOrganiType = selectedOrganiType || null;

                        const parentId = res.data.organizatioParentId;

                        if (parentId) {
                            const selectedNode = this.findNodeById(
                                this.nodes,
                                parentId
                            );
                            if (selectedNode) {
                                this.unitForm
                                    .get('organizatioParentId')
                                    ?.setValue(selectedNode);
                            } else {
                                this.unitForm
                                    .get('organizatioParentId')
                                    ?.setValue(this.nodeID);
                            }
                        }
                    }
                },
                (error) => {
                    console.error('Có lỗi xảy ra khi lấy dữ liệu:', error);
                }
            );
        }, 100);
    }

    findNodeById(nodes: any[], id: any): any {
        for (let node of nodes) {
            if (node.data === id) {
                return node;
            }
            if (node.children && node.children.length > 0) {
                const foundNode = this.findNodeById(node.children, id);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
        return null;
    }

    listAllOrganiStruct() {
        const request = {
            parseInt: 1,
            pageSize: 100000,
        };

        this.organitype.getAllOrganiStruct(request).subscribe((res) => {
            this.listAllName = res.data.items;

            let codes: string[] = [];
            let queue: any[] = [...res.data.items];

            while (queue.length > 0) {
                const org = queue.shift();
                codes.push(org.organizationCode);

                if (
                    org.organizationChildren &&
                    org.organizationChildren.length > 0
                ) {
                    queue = queue.concat(org.organizationChildren);
                }
            }

            this.allOrganizationCodesSubject.next(codes);
        });
    }

    checkIfOrganizationCodeExists() {
        return (
            control: AbstractControl
        ): Observable<ValidationErrors | null> => {
            const organizationCode = control.value?.trim();
            if (!organizationCode) {
                return of(null);
            }
            const allOrganizationCodes =
                this.allOrganizationCodesSubject.getValue();

            const isExist = allOrganizationCodes.some(
                (code) => code.trim() === organizationCode
            );

            return of(isExist ? { duplicate: true } : null);
        };
    }

    onTreeSelectChange(event: any) {
        const selectedNode = event.value;
        if (selectedNode) {
            const selectedData = selectedNode.data;
            this.unitForm.get('organizatioParentId')?.setValue(selectedData);
        } else {
            this.unitForm.get('organizatioParentId')?.setValue(null);
        }
    }

    noWhitespaceValidator1(
        control: AbstractControl
    ): { [key: string]: boolean } | null {
        const value = control.value || '';
        const containsWhitespace = /\s/.test(value);
        return containsWhitespace ? { whitespace: true } : null;
    }
    noWhitespaceValidator(
        control: AbstractControl
    ): { [key: string]: boolean } | null {
        const value = (control.value || '').trim();
        return value.length === 0 ? { whitespace: true } : null;
    }

    handleTreeSelectFocusOut(event: FocusEvent) {
        const target = event.relatedTarget as HTMLElement;
        const isInsideTreeSelect = target?.closest('.custom-tree-select');

        if (target && target.closest('[aria-hidden="true"]')) {
            event.preventDefault();
        }
        if (!isInsideTreeSelect) {
            this.isParentUnitClicked = true;
            this.validateParentUnit();
        }
    }
    handleLevelFocusOut(event: FocusEvent) {
        const target = event.relatedTarget as HTMLElement;

        const isselectedLevel = target?.closest('.level-list');

        if (target && target.closest('[aria-hidden="true"]')) {
            event.preventDefault();
        }
        if (!isselectedLevel) {
            this.isLevelUnitClicked = true;
            this.validateLevelUnit();
        }
    }

    // Hàm validate giá trị của p-treeSelect
    validateParentUnit() {
        const parentUnitControl = this.unitForm.get('organizatioParentId');
        const value = parentUnitControl?.value;

        this.isParentUnitInvalid = !value || value === 'Chọn đơn vị';
    }
    validateLevelUnit() {
        const parentUnitControl = this.unitForm.get('organizationTypeId');
        const value = parentUnitControl?.value;

        this.isLevelUnitInvalid = !value || value === 'Chọn cấp tổ chức';
    }

    // checkboxControl(pr) {
    //     return this.formGroup.get(pr.name);
    // }
    saveLevelSelection() {
        const selectedLevels = this.level
            .filter((pr) => pr.selected)
            .map((pr) => pr.name);

        this.unitForm.patchValue({
            selectedLevel: selectedLevels,
        });

        this.onDialogClose();
    }

    show() {
        this.toastService.showSuccess('Thành công', 'Thêm mới th');
    }

    startLoading() {
        this.loadingService.show();
    }
    showDialog() {
        this.dialogVisible = true;
    }
    onDialogClose() {
        this.dialogVisible = false;
        this.isCreateUnit = true;
    }
    getSelectedLabel() {
        if (this.selectedCity.length === 0) {
            return 'Chọn trưởng phòng ban';
        }
        return this.selectedCity.map((city) => city.name).join(', ');
    }

    onHandleCreate() {
        this.isCreateUnit = false;
    }

    removeSelectedHead(index: number) {
        const selectedHeads =
            this.unitForm.get('organizationLeaders').value || [];
        selectedHeads.splice(index, 1);
        this.unitForm.patchValue({ organizationLeaders: selectedHeads });
    }

    onSubmit() {
        if (this.id != this.nodeID) {
            const formData = this.unitForm.value;

            const requestBody = {
                organizationCode: formData.organizationCode,
                organizationName: formData.organizationName,
                abbreviation: formData.abbreviation || '',
                rank: formData.rank || 0,
                organizationTypeId: formData.organizationTypeId.id || 0,
                organizatioParentId: formData.organizatioParentId?.data || '',
                organizationDescription: formData.organizationDescription || '',
                businessRegistrationCode:
                    formData.businessRegistrationCode || '',
                businessRegistrationDate:
                    formData.businessRegistrationDate instanceof Date
                        ? formData.businessRegistrationDate.toISOString()
                        : new Date().toISOString(),
                issuingAuthority: formData.issuingAuthority || '',
                organizationAddress: formData.organizationAddress || '',
                organizationLeaders: formData.organizationLeaders.map(
                    (leader: any) => ({
                        employeeId: leader?.id || '',
                    })
                ),
            };

            // console.log(requestBody);

            this.organitype.updateOrganiStruct(this.id, requestBody).subscribe(
                (res) => {
                    setTimeout(() => {
                        this.messageService.add({'severity':'success','summary':'Thông báo','detail':'Cập nhật cơ cấu thành công'});
                       
                    }, 1000);
                    this.unitForm.reset();

                    this.unitForm.patchValue({
                        organizationTypeId: null,
                        organizatioParentId: null,
                    });

                    this.selectedOrganiType = null;
                    this.nodeID = null;
                    this.router1.navigate(['/organizational-structure/show']);
                },
                (error) => {
                  
                    this.messageService.add({'severity':'warn','summary':'Thông báo','detail':'Cập nhật cơ cấu thất bại lỗi :'+ error.message});
                }
            );
        } else {
            const formData = this.unitForm.value;

            const requestBody = {
                organizationCode: formData.organizationCode,
                organizationName: formData.organizationName,
                abbreviation: formData.abbreviation || '',
                rank: 0,
                organizationTypeId: this.nodesCompanyId,
                organizatioParentId: undefined,
                companyId:  this.companyIDHere,
                organizationDescription: formData.organizationDescription || '',
                businessRegistrationCode:
                    formData.businessRegistrationCode || '',
                businessRegistrationDate:
                    formData.businessRegistrationDate instanceof Date
                        ? formData.businessRegistrationDate.toISOString()
                        : new Date().toISOString(),
                issuingAuthority: formData.issuingAuthority || '',
                organizationAddress: formData.organizationAddress || '',
                organizationLeaders: formData.organizationLeaders.map(
                    (leader: any) => ({
                        employeeId: leader?.id || '',
                    })
                ),
            };

            // console.log(requestBody);

            this.organitype.updateOrganiStruct(this.id, requestBody).subscribe(
                (res) => {
                    setTimeout(() => {
                        this.toastService.showSuccess(
                            'Thành công',
                            (res.message = 'Cập nhật thành công')
                        );
                    }, 1000);
                    this.unitForm.reset();

                    this.unitForm.patchValue({
                        organizationTypeId: null,
                        organizatioParentId: null,
                    });

                    this.selectedOrganiType = null;
                    this.nodeID = null;
                    this.router1.navigate(['/organizational-structure/show']);
                },
                (error) => {
                    this.toastService.showError(
                        'Cập nhật thât bại',
                        'Nhập  đầy đủ các trường bắt buộc '
                    );
                }
            );
        }
    }

    onNodeSelect(event: any) {
        const selectedNode = event.value;
        console.log('Selected node:', selectedNode);
        if (selectedNode) {
            console.log('Selected node data:', selectedNode.data);
        }
    }

    listCompany() {
        const request = { Id: this.idoraganization };
        this.organitype.getOrganiStructType(request.Id).subscribe((res) => {
            if (res && res.data) {
                this.nodeID = res.data.id;
                // phải gán thêm company của cyt cha đó ko lỗi lòi mắt
                // chứ ý trường company chưa có trong select
                
                
                this.companyIDHere = res.data.companyId;
                console.log(this.companyIDHere);
                this.listAllcompany = [this.convertToTree(res.data)];
            } else {
                this.listAllcompany = [];
            }

            this.listCompanyToTreeSelect();
        });
    }

    convertToTree(node: any): any {
        if (!node.id) {
            console.log('Node không có id:', node);
        }
        return {
            label: node.organizationName,
            data: node.id,
            children: (node.organizationChildren || []).map((child: any) =>
                this.convertToTree(child)
            ),
        };
    }

    mapToTreeNode(node: any): any {
        return {
            label: node.label,
            data: node.data,
            children: node.children || [],
        };
    }

    listCompanyToTreeSelect() {
        if (Array.isArray(this.listAllcompany)) {
            this.nodes = this.listAllcompany.map((company) =>
                this.mapToTreeNode(company)
            );
        } else {
            console.error(
                'listCompany không phải là mảng',
                this.listAllcompany
            );
        }
    }
    listOrganitype() {
        const resquest = {};
        this.organitype.getAllOrganiStructType(resquest).subscribe((res) => {
            this.listOrganiType = res.data;

            const targetOrg = this.listOrganiType.find(
                (item: any) => item.organizationTypeName === 'Tổng Công Ty'
            );

            if (targetOrg) {
                this.nodesCompanyId = targetOrg.id;
            } else {
                this.nodesCompanyId = 1;
            }
        });
    }

    onCheckboxChange(pr: any): void {
        if (this.selectedOrganiType && this.selectedOrganiType.id === pr.id) {
            this.selectedOrganiType = null;
        } else {
            this.selectedOrganiType = pr;
        }
        this.listOrganiType.forEach((item) => {
            item.selected = item.id === pr.id;
        });
    }

    onParentUnitChange(event: any) {
        const selectedNode = event.value;
        this.unitForm
            .get('organizatioParentId')
            .setValue(selectedNode ? selectedNode.data : null);
        this.validateParentUnit();
    }

    // thêm mới cáp tổ chức

    onSubmitOrganiStructType() {
        const organizationTypeName = this.organizationTypeControl.value?.trim();

        if (!organizationTypeName) {
            this.messageService.add({'severity':'warn','summary':'Thông báo','detail':'Tên cấp tổ chức không được để trống'});
            return;
        }

        const request = {
            companyId: 1,
            organizationTypeName,
        };

        this.organitype.createOrganiStructType(request).subscribe(
            (res) => {
                this.organizationTypeControl.setValue(''); // Reset form control
                this.listOrganitype();
                this.messageService.add({'severity':'success','summary':'Thông báo','detail':'Thêm thành công'});
            },
            (error) => {
                this.messageService.add({'severity':'error','summary':'Thông báo','detail': 'Thêm thất bại lỗi :'+ error.message});
            }
        );
    }

    // Sự kiện khi chọn radio
    onRadioChange(pr: any) {
        this.tempSelectedOrganiType = pr;
    }

    // Sự kiện khi nhấn Lưu khi chọn cấp tổ chức
    onSaveOrganiType(): void {
        if (!this.tempSelectedOrganiType) {
            this.toastService.showError('Lỗi', 'Vui lòng chọn một cấp tổ chức');
            return;
        }
        this.selectedOrganiType = this.tempSelectedOrganiType;
        this.unitForm.patchValue({
            organizationTypeId: this.selectedOrganiType,
        });

        this.toastService.showSuccess(
            'Thành công',
            'Cấp tổ chức đã được cập nhật.'
        );
        this.onDialogClose();
    }

    getAllEmployee() {
        const request = {
            parseInt: 1,
            pageSize: 1000,
        };

        this.organitype.getEmployee(request).subscribe(
            (res) => {
                if (res && res.items) {
                    // Ánh xạ dữ liệu trả về để thêm thuộc tính `name`
                    this.listEmployee = res.items.map((employee) => ({
                        ...employee,
                        name: `${employee?.lastName} ${employee?.firstName}`, // Tạo thuộc tính `name` để hiển thị
                    }));
                } else {
                    this.listEmployee = [];
                }
            },
            (error) => {
                console.error('API Error:', error);
                this.listEmployee = [];
            }
        );
    }
}
