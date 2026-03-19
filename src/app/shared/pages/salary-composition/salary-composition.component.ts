// import { StaffPositionService } from './../../../../core/services/staff-position.service';
// import {
//     DEFAULT_PAGE_INDEX,
//     DEFAULT_PAGE_SIZE,
// } from './../../../../core/configs/paging.config';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { environment } from 'src/environments/environment';
import { AccountStatus } from 'src/app/core/enums/status-account.enum';
import { WorkStatus } from 'src/app/core/enums/status-work.enum';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import { ObjectService } from 'src/app/core/services/object.service';
import {
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    AbstractControl,
} from '@angular/forms';
import { AccountStatusEmployee } from 'src/app/core/enums/account-status-employee.enum';
import { Observable } from 'rxjs';
import { Workingstatus } from 'src/app/core/enums/working-status.enum';
import { StaffPositionService } from 'src/app/core/services/staff-position.service';
import { Pipe, PipeTransform } from '@angular/core';
import { TextTransformPipe } from 'src/app/shared/pipes/salary.pipe';
import { SalaryComponentsService } from 'src/app/core/services/salary-components.service';
import { di, el, s } from '@fullcalendar/core/internal-common';
import { LogarithmicScale } from 'chart.js';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';
import { SalaryComponentStatus } from 'src/app/core/enums/salary-component.enum';
import { TreeNode } from 'primeng/api';

interface Status {
    name: string;
    code: number;
}

@Component({
    selector: 'app-salary-composition',
    templateUrl: './salary-composition.component.html',
    styleUrl: './salary-composition.component.scss',
})
export class SalaryCompositionComponent implements OnInit {
    items: any;
    selectedLocation: Status | undefined;
    visible1: boolean = false;
    listheaderTable: any[] = [];
    dialogVisible: boolean = false;
    optionWorkStatus: any[];
    optionAccountStatus: any[];
    listAllEmployee: any;
    listAllOrganistrucr: any[];
    selectedAccountStatus: any[];
    nodes: any[] = [];
    listAllcompany: any[] = [];
    selectedEmployeeIds: number[] = [];
    selectedEmployees: any[] = [];
    checkedEP: boolean = false;
    listEmployeeUpdate: any[];
    isParentUnitClicked: boolean;
    isParentUnitInvalid: boolean;
    selectedLocationUpdate: number;
    textSearch: string;
    staffTitleName: string;
    pageIndex: number = 1;
    pageSize: number = 10;
    totalItems: number = 0;
    currentPageReport: string = '';
    organizatioParentSelect1: number;
    organizatioParentIdObject: any[];
    organizationLeadersUpdate: any[] = [];
    listable: any[] = [];
    filteredListheaderTable = [];
    searchText: string = '';
    unitForm: FormGroup;
    position: string = '';
    idoraganization: number;
    listProperty: any[] = [];
    listAttribute: any[] = [];
    createForm: FormGroup;
    updateForm: FormGroup;
    listvalueSalary: any[] = [];
    filteredSalary: any[] = [];
    filteredList = [];
    activeTab: 'formula' | 'parameter' = 'formula';
    listSalary: any;
    updateDialog: boolean;
    booleanStatus: boolean;
    textdifferentcreate: string;
    listAllSalary: any;
    suggestions: any;
    previousValue: string = '';
    showdialogdelete: boolean
    salaryComponentsEnum: typeof SalaryComponentStatus = SalaryComponentStatus;
    private editingSalaryComponent: any = null;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private staffPositionService: StaffPositionService,
        private authService: AuthService,
        private toastService: ToastService,
        private organistruct: OrganiStructTypeService,
        private employeeObject: ObjectService,
        private messageService: MessageService,
        private fb: FormBuilder,
        private pipeSalary: TextTransformPipe,
        private salaryService: SalaryComponentsService,
        public permisionHelper:HasPermissionHelper
    ) {
        this.createForm = this.fb.group({
            nameSalary: [null, Validators.required],
            codeSalary: [null],
            origanoSalary: [null, Validators.required],
            characteristic: [null, Validators.required],
            nature: [null, Validators.required],
            valueSalary: [null],
            descriptionSalary: [null],
        });
        this.updateForm = this.fb.group({
            nameSalaryUpdate: [null, Validators.required],
            codeSalaryUpdate: [null],
            origanoSalaryUpdate: [null, Validators.required],
            characteristicUpdate: [null, Validators.required],
            natureUpdate: [null, Validators.required],
            valueSalaryUpdate: [null],
            descriptionSalaryUpdate: [null],
            status: [null],
        });
    }

    //Banners
    public staffPositiones: any = [];

    public selectedStaffPosition: any = [];
    permissionConstant=PermissionConstant

    ngOnInit() {
        this.listvalueSalary = [
            // { name: 'SUM()', type: 'formula' },
            // { name: 'DIV()', type: 'formula' },
        ];
        this.authService.userCurrent.subscribe((user) => {
            const orgId = user?.organization?.id;
            if (!orgId) return;
            this.idoraganization = orgId;
            this.getFormulaSuggestions(this.idoraganization);
            this.getAllOrganiStruct();
            this.listCompany();
            this.getAllEmployee(this.pageIndex, this.pageSize);
        });
        this.items = [
            { label: 'Tính lương' },
            { label: 'Thành phần lương' },
        ];
        this.listheaderTable = [
            { name: 'Mã thành phần ', status: true, code: 1 },
            { name: 'Tên thành phần', status: true, code: 1 },
            { name: 'Đơn vị áp dụng', status: true, code: 1 },
            { name: 'Mô tả', status: true, code: 1 },
            { name: 'Giá trị', status: true, code: 1 },
            { name: 'Thuộc tính', status: true, code: 1 },
            { name: 'Tính chất', status: true, code: 1 },
            { name: 'Trạng thái', status: true, code: 1 },
        ];
        this.listProperty = [
            {
                name: 'Thu nhập',
                label: 0,
            },
            {
                name: 'Khấu trừ',
                label: 1,
            },
            {
                name: 'Khác',
                label: 2,
            },
        ];
        this.listAttribute = [
            {
                name: 'Cố định',
                label: 0,
            },
            {
                name: 'Biến đổi',
                label: 1,
            },
        ];

        this.optionAccountStatus = [
            {
                name: this.getStatus(AccountStatus.NotSend).text,
                value: AccountStatus.NotSend,
            },
            {
                name: this.getStatus(AccountStatus.Peding).text,
                value: AccountStatus.Peding,
            },
        ];

        const storedData = localStorage.getItem('listheaderTableSalary');
        if (storedData) {
            this.listable = JSON.parse(storedData);
        } else {
            this.listable = [...this.listheaderTable];
        }
    }

    openDialog(position: string) {
        this.position = position;

        this.filteredListheaderTable = this.listheaderTable.map((item) => {
            const storedItem = this.listable.find(
                (listableItem) => listableItem.name === item.name
            );
            return {
                ...item,
                status: storedItem ? storedItem.status : item.status,
            };
        });

        this.visible1 = true;
        this.searchText = '';
    }

    // Hàm xử lý tìm kiếm
    onSearch() {
        const search = this.searchText.trim().toLowerCase();
        if (search) {
            this.filteredListheaderTable = this.listheaderTable
                .filter((pr) => pr.name.toLowerCase().includes(search))
                .map((item) => {
                    const storedItem = this.listable.find(
                        (listableItem) => listableItem.name === item.name
                    );
                    return {
                        ...item,
                        status: storedItem ? storedItem.status : item.status,
                    };
                });
        } else {
            this.filteredListheaderTable = this.listheaderTable.map((item) => {
                const storedItem = this.listable.find(
                    (listableItem) => listableItem.name === item.name
                );
                return {
                    ...item,
                    status: storedItem ? storedItem.status : item.status,
                };
            });
        }
    }

    applyChanges() {
        this.filteredListheaderTable.forEach((filteredItem) => {
            const originalItem = this.listheaderTable.find(
                (item) => item.name === filteredItem.name
            );
            if (originalItem) {
                originalItem.status = filteredItem.status;
            }
        });
        localStorage.setItem(
            'listheaderTableSalary',
            JSON.stringify(this.listheaderTable)
        );
        this.listable = JSON.parse(
            localStorage.getItem('listheaderTableSalary')
        );
        this.visible1 = false;
    }

    resetDefaults() {
        this.listheaderTable = this.listheaderTable.map((item) => ({
            ...item,
            status: item.code === 1,
        }));

        this.filteredListheaderTable = [...this.listheaderTable];

        localStorage.setItem(
            'listheaderTableSalary',
            JSON.stringify(this.listheaderTable)
        );
        this.listable = JSON.parse(
            localStorage.getItem('listheaderTableSalary')
        );
        this.visible1 = false;
        this.getAllEmployee(this.pageIndex, this.pageSize, []);
    }

    getAllEmployee(
        pageIndex: number = this.pageIndex,
        pageSize: number = this.pageSize,
        filterData: any = null
    ) {
        const request = {
            pageIndex: pageIndex,
            pageSize: pageSize,
            OrderBy: 'desc',
            OrganizationId:this.idoraganization,
            ...filterData,
        };

        this.salaryService.getAllSalaryComponent(request).subscribe(
            (response) => {
                if (response && response.items) {
                    this.listAllEmployee = response.items || [];
                    this.totalItems = response.totalRecords || 0;
                    this.pageIndex = response.pageIndex;
                    this.pageSize = response.pageSize;
                    this.updatePageReport();
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

    updatePageReport() {
        const startRecord = (this.pageIndex - 1) * this.pageSize + 1;
        const endRecord = Math.min(
            startRecord + this.pageSize - 1,
            this.totalItems
        );
        this.currentPageReport = ` <b>${startRecord}</b> - <b>${endRecord}</b> trong <b>${this.totalItems}</b> bản ghi`;
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
        this.selectedEmployeeIds = [];
        this.selectedEmployees = [];
        this.getAllEmployee(this.pageIndex, this.pageSize, queryParams);
    }

    getStatus(status: number): {
        text: string;
        color: string;
        bgColor: string;
    } {
        switch (status) {
            case 0:
                return {
                    text: 'Đang theo dõi',
                    color: '#155724', // màu xanh lá đậm
                    bgColor: '#d4edda',
                };
            case 1:
                return {
                    text: 'Ngừng theo dõi',
                    color: '#721c24', // màu đỏ đậm
                    bgColor: '#f8d7da', // màu đỏ nhạt
                };

            default:
                return {
                    text: '',
                    color: 'white', // màu đen để rõ ràng
                    bgColor: 'white', // màu trắng đơn giản
                };
        }
    }

    getNature(status: number): {
        text: string;
        color: string;
        bgcolor: string;
    } {
        switch (status) {
            case 0:
                return {
                    text: 'Cố định',
                    color: '#155724', // Màu xanh lá đậm hơn
                    bgcolor: '#d4edda', // Màu xanh lá nhạt hơn
                };
            case 1:
                return {
                    text: 'Biến đổi',
                    color: '#494949', // Màu xám đậm hơn
                    bgcolor: '#ececec', // Màu xám nhạt hơn
                };
            default:
                return {
                    text: 'khác',
                    color: 'black',
                    bgcolor: 'white',
                };
        }
    }
    getCharater(status: number): {
        text: string;
        color: string;
        bgcolor: string;
    } {
        switch (status) {
            case 0:
                return {
                    text: 'Thu nhập ',
                    color: '#155724', // Màu xanh lá đậm hơn
                    bgcolor: '#d4edda', // Màu xanh lá nhạt hơn
                };
            case 1:
                return {
                    text: 'Khấu trừ',
                    color: '#494949', // Màu xám đậm hơn
                    bgcolor: '#ececec', // Màu xám nhạt hơn
                };
            default:
                return {
                    text: 'khác',
                    color: 'black',
                    bgcolor: 'white',
                };
        }
    }

    showDialog2() {
        this.dialogVisible = true;
    }
    onDialogClose() {
        this.dialogVisible = false;
        (this.staffTitleName = ''),
            (this.organizatioParentIdObject = this.nodes),
            (this.organizationLeadersUpdate = []),
            (this.selectedLocationUpdate = 0);
    }

    // lấy ra tất cả tổ chức của cty
    getAllOrganiStruct() {
        const resquest = {
            pageIndex: 1,
            pageSize: 10000,
        };
        this.organistruct.getAllOrganiStruct(resquest).subscribe((res) => {
            this.listAllOrganistrucr = res.data.items;
        });
    }

    // lấy danh sách nhân viên

    listCompany() {
        this.organistruct
            .getOrganiStructType(this.idoraganization)  
            .subscribe((res) => {
                if (res && res.data) {
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
            // console.error(
            //     'listCompany không phải là mảng',
            //     this.listAllcompany
            // );
        }
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
    validateParentUnit() {
        this.isParentUnitInvalid =
            !this.organizatioParentIdObject ||
            this.organizatioParentIdObject.length === 0;
    }

    onParentUnitChange(event: any) {
        this.validateParentUnit();
    }
    onParentUnitChangeSearch(event: any) {
        const selectedNode = event.value;
        this.unitForm
            .get('organizatioParentSelect')
            .setValue(selectedNode ? selectedNode.data : []);
    }
    search() {
        const request: any = {};
        if (this.textSearch?.trim()) {
            request.Name = this.textSearch.trim();
        }

        request.Status = (this.selectedAccountStatus as any)?.value;

        if (
            this.organizatioParentSelect1 &&
            (this.organizatioParentSelect1 as any)?.data
        ) {
            request.OrganizationId = (
                this.organizatioParentSelect1 as any
            )?.data;
        }

        //   console.log(request);

        const queryParams: any = {
            pageIndex: (this.pageIndex = 1),
            pageSize: this.pageSize,
            ...request,
        };
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParams,
            // queryParamsHandling: 'merge',
        });
        this.getAllEmployee(this.pageIndex, this.pageSize, request);
    }

    hideList() {
        this.filteredList = [];
    }
    showinput() {
        return this.createForm.get('valueSalary')?.value;
    }
    

    // nhân enter khi chỉ có 1 lọc 1 phần tử
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && this.filteredList.length === 1) {
            const selectedItem = this.filteredList[0].name;
            this.onClickItemli(selectedItem);
            event.preventDefault();
        }
    }
    onKeyDownUpdate(event: KeyboardEvent): void {
        if (event.key === 'Enter' && this.filteredList.length === 1) {
            const selectedItem = this.filteredList[0].name;
            this.onClickItemliUPadte(selectedItem);
            event.preventDefault();
        }
    }
    
    // Hàm gọi khi người dùng nhập
    onInputCreate(event: any): void {
        const currentValue = event.target.value;

        if (this.previousValue !== currentValue) {
            const newKeyword = this.getNewKeyword(
                this.previousValue,
                currentValue
            );
            if (newKeyword || currentValue.startsWith('=')) {
                this.setActiveTab(this.activeTab, newKeyword);
            }
        }

        // Cập nhật giá trị cũ
        this.previousValue = currentValue;
    }

    // Hàm tìm sự khác biệt giữa giá trị cũ và mới

    getNewKeyword(oldValue: string, newValue: string): string {
        const delimiters = /\W+/;
        const oldParts = oldValue
            .trim()
            .split(delimiters)
            .filter((part) => part !== '');
        const newParts = newValue
            .trim()
            .split(delimiters)
            .filter((part) => part !== '');
        const difference = newParts.filter((part) => !oldParts.includes(part));
        this.textdifferentcreate = difference.join('/');
        return this.textdifferentcreate;
    }
    // Hàm setActiveTab tìm kiếm theo từ khóa
    setActiveTab(tab: 'formula' | 'parameter', query: string = '') {
        const cleanedQuery = query.trim().toLowerCase();
        const filteredItems = this.listvalueSalary.filter((item) =>
            item.name.trim().toLowerCase().includes(cleanedQuery)
        );
        if (filteredItems.length > 0) {
            this.activeTab = filteredItems[0].type as 'formula' | 'parameter';
        } else {
            this.activeTab = tab;
        }
        this.filteredList = filteredItems.filter(
            (item) => item.type === this.activeTab
        );
        if (this.filteredList.length === 0) {
            this.filteredList = filteredItems;
        }
    }
    clicksetActiveTab(tab: 'formula' | 'parameter') {
        this.activeTab = tab;
        if (this.activeTab === 'parameter') {
            this.filteredList = this.listvalueSalary.filter(
                (item) => item.type === 'parameter'
            );
        } else if (this.activeTab === 'formula') {
            this.filteredList = this.listvalueSalary.filter(
                (item) => item.type === 'formula'
            );
        }
    }
    onClickItemli(selectedValue: string) {
        const inputElement = document.querySelector(
            'textarea[formControlName="valueSalary"]'
        ) as HTMLTextAreaElement;
        if (!inputElement) return;
        const currentValue = this.createForm.get('valueSalary')?.value || '';
        const keyword = this.textdifferentcreate;
        const index = currentValue.lastIndexOf(keyword);
        let newCursorPosition = 0;
        if (index !== -1) {
            // Thay thế từ khóa khác biệt
            const beforeKeyword = currentValue.slice(0, index).trimEnd();
            const afterKeyword = currentValue
                .slice(index + keyword.length)
                .trimStart();
            const updatedValue =
                `${beforeKeyword} ${selectedValue} ${afterKeyword}`.trim();
            this.createForm.get('valueSalary')?.setValue(updatedValue);
            // Tính toán vị trí con trỏ mới
            newCursorPosition = beforeKeyword.length + 1 + selectedValue.length;
        } else {
            if (inputElement.selectionStart !== null) {
                // Chèn tại vị trí con trỏ
                const cursorPosition = inputElement.selectionStart;
                const beforeCursor = currentValue.slice(0, cursorPosition).trimEnd();
                const afterCursor = currentValue.slice(cursorPosition).trimStart();
                const updatedValue =
                    `${beforeCursor} ${selectedValue} ${afterCursor}`.trim();
                this.createForm.get('valueSalary')?.setValue(updatedValue);
                // Tính toán vị trí con trỏ mới
                newCursorPosition = beforeCursor.length + 1 + selectedValue.length;
            } else {
                // Thêm vào cuối nếu không xác định được vị trí con trỏ
                const updatedValue = `${currentValue.trim()} ${selectedValue}`.trim();
                this.createForm.get('valueSalary')?.setValue(updatedValue);
                // Vị trí con trỏ ở cuối chuỗi
                newCursorPosition = updatedValue.length;
            }
        }
    
        // Đảm bảo cập nhật giao diện trước khi đặt con trỏ
        setTimeout(() => {
            inputElement.focus();
            inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
        });
    
        // Reset giá trị khác biệt
        this.textdifferentcreate = '';
        this.setActiveTab('formula', this.textdifferentcreate);
    }
    onClickItemliUPadte(selectedValue: string) {
        const inputElement = document.querySelector(
            'textarea[formControlName="valueSalaryUpdate"]'
        ) as HTMLTextAreaElement;
    
        if (!inputElement) return;
    
        const currentValue = this.updateForm.get('valueSalaryUpdate')?.value || '';
        const keyword = this.textdifferentcreate;
        const index = currentValue.lastIndexOf(keyword);
        let newCursorPosition = 0;
    
        if (index !== -1) {
            // Thay thế từ khóa khác biệt
            const beforeKeyword = currentValue.slice(0, index).trimEnd();
            const afterKeyword = currentValue
                .slice(index + keyword.length)
                .trimStart();
            const updatedValue =
                `${beforeKeyword} ${selectedValue} ${afterKeyword}`.trim();
            this.updateForm.get('valueSalaryUpdate')?.setValue(updatedValue);
    
            // Tính toán vị trí con trỏ mới
            newCursorPosition = beforeKeyword.length + 1 + selectedValue.length;
        } else {
            if (inputElement.selectionStart !== null) {
                // Chèn tại vị trí con trỏ
                const cursorPosition = inputElement.selectionStart;
                const beforeCursor = currentValue.slice(0, cursorPosition).trimEnd();
                const afterCursor = currentValue.slice(cursorPosition).trimStart();
                const updatedValue =
                    `${beforeCursor} ${selectedValue} ${afterCursor}`.trim();
                this.updateForm.get('valueSalaryUpdate')?.setValue(updatedValue);
    
                // Tính toán vị trí con trỏ mới
                newCursorPosition = beforeCursor.length + 1 + selectedValue.length;
            } else {
                // Thêm vào cuối nếu không xác định được vị trí con trỏ
                const updatedValue = `${currentValue.trim()} ${selectedValue}`.trim();
                this.updateForm.get('valueSalaryUpdate')?.setValue(updatedValue);
    
                // Vị trí con trỏ ở cuối chuỗi
                newCursorPosition = updatedValue.length;
            }
        }
    
        // Đảm bảo cập nhật giao diện trước khi đặt con trỏ
        setTimeout(() => {
            inputElement.focus();
            inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
        });
    
        // Reset giá trị khác biệt
        this.textdifferentcreate = '';
        this.setActiveTab('formula', this.textdifferentcreate);
    }


    onNameInput(name: string): void {
        const code = this.pipeSalary.transform(
            this.createForm.value.nameSalary
        );
        this.createForm.get('codeSalary')?.setValue(code);
    }
    onNameInputupdate(name: string): void {
        const code = this.pipeSalary.transform(
            this.updateForm.value.nameSalaryUpdate
        );
        this.updateForm.get('codeSalaryUpdate')?.setValue(code);
    }

    /* hàm lấy tất cả cho màn thêm */
    getFormulaSuggestions(id: number) {
        this.salaryService.getformulasuggestions(id).subscribe((res) => {
            console.log(res)
            this.listSalary = res.data;
            this.listvalueSalary = [];
            res.data.suggestions.forEach((item) => {
                if (item.componentCode) {
                    this.listvalueSalary.push({
                        name: item.componentCode,
                        type: 'parameter',
                    });
                }
            });
            res.data.formulaOperators.forEach((item) => {
                if (item) {
                    this.listvalueSalary.push({
                        name: item,
                        type: 'formula',
                    });
                }
            });
        });
    }
    /* thêm mới thành phần lươg */
    handleCreate() {
        const data = [
            {
                organizationId: this.createForm.value.origanoSalary.data,
                componentName: this.createForm.value.nameSalary,
                componentCode: this.createForm.value.codeSalary,
                nature: this.createForm.value.nature.label,
                characteristic: this.createForm.value.characteristic.label,
                valueFormula: this.createForm.value.valueSalary,
                description: this.createForm.value.descriptionSalary,
                status: 0,
            },
        ];

        this.salaryService.createSalaryComponent(data).subscribe((res) => {
            if (res) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thông báo',
                    detail: ' Thêm thành công',
                });
                this.getFormulaSuggestions(this.idoraganization);
                this.hadleResetCreate();
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: ' Thêm không thành công',
                });
            }
        });
    }
    hadleResetCreate() {
        this.createForm.reset();
        this.dialogVisible = false;
        this.getAllEmployee(this.pageIndex, this.pageSize);
    }

    //   sửa
    idupdate: number;
    private findNodeByData(nodes: TreeNode[] = [], data: any): TreeNode | null {
        for (const node of nodes) {
            if ((node as any)?.data === data) return node;
            const children = (node as any)?.children as TreeNode[] | undefined;
            if (children?.length) {
                const found = this.findNodeByData(children, data);
                if (found) return found;
            }
        }
        return null;
    }
    showDialogUpdate(id: number) {
        this.idupdate = id;
        this.salaryService.getIDSalaryComponent(id).subscribe((res) => {
            this.editingSalaryComponent = res;
            const selectedOrgNode = this.findNodeByData(
                this.nodes as any,
                res?.organizationId
            );
            this.updateForm.patchValue({
                nameSalaryUpdate: res?.componentName,
                codeSalaryUpdate: res?.componentCode,
                origanoSalaryUpdate:
                    selectedOrgNode ??
                    (res?.organizationId
                        ? {
                              label: res?.organizationName ?? 'Đơn vị',
                              data: res.organizationId,
                          }
                        : null),
                characteristicUpdate: res?.characteristic,
                natureUpdate: res?.nature,
                valueSalaryUpdate: res?.valueFormula,
                descriptionSalaryUpdate: res?.description,
                status: res?.status,
            });
        });
        this.updateDialog = true;
    }
    handleUpdate() {
        const selectedOrgNode = this.updateForm.get('origanoSalaryUpdate')?.value;
        const dataupdate = {
            organizationId:
                selectedOrgNode?.data ?? this.editingSalaryComponent?.organizationId,
            componentName: this.updateForm.get('nameSalaryUpdate').value,
            componentCode: this.updateForm.get('codeSalaryUpdate').value,
            nature: this.updateForm.get('natureUpdate').value,
            characteristic: this.updateForm.get('characteristicUpdate').value,
            valueFormula: this.updateForm.get('valueSalaryUpdate').value,
            description: this.updateForm.get('descriptionSalaryUpdate').value,
            status: this.updateForm.get('status').value,
            calcType: this.editingSalaryComponent?.calcType,
            baseSource: this.editingSalaryComponent?.baseSource,
            fixedAmount: this.editingSalaryComponent?.fixedAmount,
            unitAmount: this.editingSalaryComponent?.unitAmount,
            ratePercent: this.editingSalaryComponent?.ratePercent,
            capAmount: this.editingSalaryComponent?.capAmount,
        };

        this.salaryService  
            .updateSalaryComponent(this.idupdate, dataupdate)
            .subscribe((res) => {
                if (res) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thông báo',
                        detail: ' Cập nhật thành công',
                    });
                    this.getFormulaSuggestions(this.idoraganization);
                    this.getAllEmployee(this.pageIndex, this.pageSize);
                    this.updateDialog = false;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Thông báo',
                        detail: ' Cập nhật thất bại',
                    });
                }
            });
    }
    handleResetUpdate() {
        this.updateForm.reset();
        this.updateDialog = false;
    }

    //  chuyển trạng thái của thành phần fluowng
    nameSalaryresetStatus: string;
    updatestatus: any;
    showdialogStatus(data: any) {
        this.updatestatus = data;
        this.nameSalaryresetStatus = data.componentName;
        this.booleanStatus = true;
    }
    closeDialogstatus() {
        (this.booleanStatus = false), (this.nameSalaryresetStatus = '');
    }
    hadleUpdateStatus() {
        const dataupdate = {
            organizationId: this.updatestatus?.organizationId,
            componentName: this.updatestatus?.componentName,
            componentCode: this.updatestatus?.componentCode,
            nature: this.updatestatus?.nature,
            characteristic: this.updatestatus?.characteristic,
            valueFormula: this.updatestatus?.valueFormula,
            description: this.updatestatus?.description,
            calcType: this.updatestatus?.calcType,
            baseSource: this.updatestatus?.baseSource,
            fixedAmount: this.updatestatus?.fixedAmount,
            unitAmount: this.updatestatus?.unitAmount,
            ratePercent: this.updatestatus?.ratePercent,
            capAmount: this.updatestatus?.capAmount,
            status:
                this.updatestatus?.status == this.salaryComponentsEnum.Tracking
                    ? this.salaryComponentsEnum.UnTracking
                    : this.salaryComponentsEnum.Tracking,
        };

        this.salaryService
            .updateSalaryComponent(this.updatestatus.id, dataupdate)
            .subscribe((res) => {
                if (res) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thông báo',
                        detail: ' Cập nhật thành công',
                    });
                    this.getAllEmployee(this.pageIndex, this.pageSize);
                    this.booleanStatus = false;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Thông báo',
                        detail: ' Cập nhật thất bại',
                    });
                }
            });
    }
    isNumber(value: any): boolean {
        return !isNaN(Number(value));
    }

    // search event autocomplate

    searchAutoComplete(event: AutoCompleteCompleteEvent) {
        const query = event.query?.toLowerCase().trim();

        if (!query) {
            this.getAllEmployee(this.pageIndex, this.pageSize, []);
            return;
        }

        const data = {
            pageIndex: 1,
            pageSize: 10000000,
            OrganizationId: this.idoraganization,
        };

        this.salaryService.getAllSalaryComponent(data).subscribe((res) => {
            this.listAllSalary = res.items;

            this.suggestions = this.listAllSalary
                .filter(
                    (item) =>
                        item.componentCode.toLowerCase().includes(query) ||
                        item.componentName.toLowerCase().includes(query)
                )
                .map((item) => ({
                    display: `${item.componentCode} - ${item.componentName}`,
                    value: item.componentCode,
                }));
        });
    }
    onSelectSuggestion(event: any) {
        const res = {
            Name: event.value.value,
        };
        this.getAllEmployee(this.pageIndex, this.pageSize, res);
    }
    onChangeHandler(event: any) {
        if (event) {
            this.getAllEmployee(this.pageIndex, this.pageSize, []);
        } else {
            this.getAllEmployee(this.pageIndex, this.pageSize, []);
        }
    }
    isStattusCharacter(id: number): boolean {
        if (id === 0) {
            return true;
        } else {
            return false;
        }
    }
    namedeletesalary:string;
    openDeleteDialog(data:any) {
        console.log(data)
        this.namedeletesalary = data.componentName
        this.updatestatus = data;
        this.showdialogdelete = true;
      }
      closeDeleteDialog(){
        this.showdialogdelete= false;
        this.namedeletesalary= ''
      }

      hadleDelete() {
        const id = this.updatestatus?.id;
        if (!id) return;
        this.salaryService.deleteSalaryComponent(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thông báo',
                    detail: ' Xóa thành công',
                });
                this.getAllEmployee(this.pageIndex, this.pageSize);
                this.showdialogdelete = false;
            },
            error: (error) => {
                const detail =
                    error?.error?.message ||
                    error?.error?.Message ||
                    'Xóa thất bại';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Thông báo',
                    detail,
                });
                this.showdialogdelete = false;
            },
        });
      }
}
