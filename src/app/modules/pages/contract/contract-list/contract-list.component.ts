import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { ContractService } from 'src/app/core/services/contract.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CompanyInfoService } from 'src/app/core/services/company-info.service';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import html2pdf from 'html2pdf.js';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { from, of } from 'rxjs';
import { catchError, concatMap, map, toArray } from 'rxjs/operators';

@Component({
    selector: 'app-contract-list',
    templateUrl: './contract-list.component.html',
    styleUrl: './contract-list.component.scss',
})
export class ContractListComponent implements OnInit {
    messages: any[] = [];
    contracts!: any;
    employeeSearchName: string = '';
    selectedContract: any;
    items: MenuItem[] | undefined;
    pageSize: number = 10;
    unitOptions: any[] = [];
    pageIndex: number = 1;
    totalRecords: number = 0;
    currentPageReport: string = '';
    keyWord: string = '';
    treeData: TreeNode[] = [];
    selectedNode: any;
    isTerminateDialogVisible: boolean = false;
    updateExpiryDate = 'no';
    expiryDate: Date | null = null;
    selectedContractId: number | null = null;
    effectiveDate: Date | null = null;
    selectedContractStatus: any = null;
    selectedCompany: any = {};
    contractDelete!: any;
    showDiaLogDelete: boolean = false;
    selectedContractIds: number[] = [];
    selectAllCurrentPage: boolean = false;
    isBulkDeleteDialog: boolean = false;
    permissionConstant = PermissionConstant;
    displayDialog: boolean = false;
    displayPreview: boolean = false;
    contractPreviewHtml: string = '';
    allColumns = [
        { field: 'signingDate', header: 'Ngày ký HĐ' },
        { field: 'code', header: 'Số hợp đồng' },
        { field: 'nameEmployee', header: 'Họ và Tên NLĐ' },
        { field: 'position', header: 'Vị trí công việc' },
        { field: 'unit', header: 'Đơn vị' },
        { field: 'contractType', header: 'Loại hợp đồng' },
        { field: 'contractDuration', header: 'Thời hạn HĐ' },
        { field: 'effectiveDate', header: 'Ngày có hiệu lực' },
        { field: 'expiryDate', header: 'Ngày hết' },
        { field: 'action', header: 'Thao tác' },
    ];
    selectedColumns: any[] = [...this.allColumns];
    contractOption = [
        { name: 'Tất cả hợp đồng', value: null },
        { name: 'Hợp đồng đang có hiệu lực', value: false },
        { name: 'Hợp đồng hết hiệu lực', value: true },
    ];

    constructor(
        private contractService: ContractService,
        private organizationService: OrganizationService,
        private companyService: CompanyInfoService,
        private http: HttpClient,
        public permisionHelper: HasPermissionHelper
    ) { }

    ngOnInit() {
        this.items = [
            { label: 'Thông tin nhân sự' },
            { label: 'Hợp đồng' },
        ];

        this.getOrganizations();
        this.getPagingContract();
        this.getCompanyData(1);
    }

    onEdit(contract: any) {
        console.log('Sửa hợp đồng:', contract);
    }

    onDuplicate(contract: any) {
        console.log('Nhân bản hợp đồng:', contract);
    }

    onSendEmail(contract: any) {
        console.log('Gửi email:', contract);
    }

    onCreateDocument(contract: any) {
        console.log('Tạo văn bản:', contract);
    }

    onPrint(contract: any) {
        console.log('In hợp đồng:', contract);
    }

    onDelete(contract: any) {
        console.log('Xóa hợp đồng:', contract);
    }

    getPagingContract(): void {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
            nameEmployee: this.employeeSearchName?.trim() || '',
            unitId: this.selectedNode?.data?.id,
            ExpiredStatus:
                this.selectedContractStatus !== null
                    ? this.selectedContractStatus
                    : undefined,
        };

        this.contractService.getPagingAllContract(request).subscribe(
            (response: any) => {
                this.contracts = response.items;
                this.resetSelection();
                console.log('contractData', this.contracts);
                this.totalRecords = response.totalRecords;
                this.updateCurrentPageReport();
            },
            (error: any) => {
                console.error(error);
            }
        );
    }

    exportContract(): void {
        const request: any = {
            nameEmployee: this.employeeSearchName?.trim() || '',
            unitId: this.selectedNode?.data?.id,
            ExpiredStatus:
                this.selectedContractStatus !== null
                    ? this.selectedContractStatus
                    : undefined,
        };
        this.contractService.exportContract(request).subscribe({
            next: (response: any) => {
                const contracts =
                    Array.isArray(response) ? response : response?.items || [];
                this.exportToExcel(contracts);
            },
            error: (error: any) => {
                console.error(error);
                this.messages = [
                    {
                        severity: 'error',
                        summary: 'Lỗi',
                        detail: 'Có lỗi xảy ra khi xuất file Excel',
                        life: 3000,
                    },
                ];
            },
        });
    }

    private exportToExcel(contracts: any[]): void {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh sách hợp đồng');

        const headers = [
            'Ngày ký HĐ',
            'Số hợp đồng',
            'Họ và Tên NLĐ',
            'Vị trí công việc',
            'Đơn vị',
            'Loại hợp đồng',
            'Thời hạn HĐ',
            'Ngày có hiệu lực',
            'Ngày hết',
        ];

        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true, size: 12 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };
        headerRow.alignment = {
            vertical: 'middle',
            horizontal: 'center',
        };

        const formatDate = (date: any): string => {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleDateString('vi-VN');
        };

        contracts.forEach((contract: any) => {
            const row = worksheet.addRow([
                formatDate(contract.signingDate),
                contract.code ?? 'N/A',
                contract.nameEmployee ?? '',
                contract.position ?? '',
                contract.unit?.organizationName ?? '',
                contract.contractType?.name ?? contract.contractTypeName ?? '',
                contract.contractDuration?.duration ?? '',
                formatDate(contract.effectiveDate),
                formatDate(contract.expiryDate),
            ]);
            row.alignment = { vertical: 'middle', horizontal: 'left' };
        });

        const colWidths = [14, 18, 25, 22, 25, 22, 15, 16, 14];
        worksheet.columns.forEach((column, index) => {
            column.width = colWidths[index] ?? 15;
        });

        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });

        workbook.xlsx.writeBuffer().then((data) => {
            const blob = new Blob([data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const fileName = `Danh_sach_hop_dong_${new Date().getTime()}.xlsx`;
            saveAs(blob, fileName);
            this.messages = [
                {
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Xuất file Excel thành công',
                    life: 3000,
                },
            ];
        });
    }

    onTerminate(contract: any) {
        this.selectedContractId = contract.id;
        this.effectiveDate = new Date(contract.effectiveDate);
        this.isTerminateDialogVisible = true;
    }

    onCancelTerminate() {
        this.isTerminateDialogVisible = false;
        this.updateExpiryDate = 'no';
        this.expiryDate = null;
    }

    onExpiryDateSelect() {
        if (
            this.expiryDate &&
            this.effectiveDate &&
            this.expiryDate <= this.effectiveDate
        ) {
            this.messages = [
                {
                    severity: 'warn',
                    summary: '',
                    detail: 'Ngày hết hạn phải lớn hơn ngày có hiệu lực.',
                    life: 3000,
                },
            ];
            this.expiryDate = null;
        }
    }
    onConfirmTerminate() {
        if (this.updateExpiryDate === 'no') {
            this.isTerminateDialogVisible = false;
            this.updateExpiryDate = 'no';
            this.expiryDate = null;
            return;
        }
        if (
            this.updateExpiryDate === 'yes' &&
            (!this.expiryDate || this.expiryDate <= this.effectiveDate!)
        ) {
            this.messages = [
                {
                    severity: 'warn',
                    summary: '',
                    detail: 'Ngày hết hạn phải lớn hơn ngày có hiệu lực.',
                    life: 3000,
                },
            ];
            return;
        }
        const localDate = new Date(this.expiryDate!); // Tạo đối tượng Date từ ngày chọn
        const offset = localDate.getTimezoneOffset() * 60000; // Sự chênh lệch múi giờ (tính bằng mili giây)
        const localDateString = new Date(
            localDate.getTime() - offset
        ).toISOString(); // Điều chỉnh ngày giờ

        const body = {
            expiryDate: localDateString, // Gửi ngày đã điều chỉnh theo múi giờ địa phương
            expiredStatus: true,
        };

        this.http
            .put(
                `/contract/update-expired-status?id=${this.selectedContractId}`,
                body
            )
            .subscribe({
                next: () => {
                    this.messages = [
                        {
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Chấm dứt hợp đồng thành công',
                            life: 3000,
                        },
                    ];
                    this.isTerminateDialogVisible = false;
                    this.getPagingContract();
                },
                error: () => {
                    this.messages = [
                        {
                            severity: 'error',
                            summary: 'Thất bại',
                            detail: 'Có lỗi xảy ra.',
                            life: 3000,
                        },
                    ];
                },
            });
    }

    onSearchEmployee(): void {
        this.pageIndex = 1;
        this.getPagingContract();
    }

    getOrganizations(): void {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.organizationService.getPagingAll(request).subscribe((response) => {
            if (response.status) {
                this.treeData = this.transformToTreeNode(response.data.items);
            }
        });
    }

    transformToTreeNode(data: any[]): TreeNode[] {
        return data.map((item) => ({
            label: item.organizationName,
            data: item,
            children: item.organizationChildren
                ? this.transformToTreeNode(item.organizationChildren)
                : [],
            expanded: false,
        }));
    }

    onPageChange(event: any): void {
        this.pageSize = event.rows;
        this.pageIndex = event.page + 1;
        this.getPagingContract();
    }

    private getCurrentPageContractIds(): number[] {
        if (!Array.isArray(this.contracts)) {
            return [];
        }

        return this.contracts
            .map((contract: any) => contract?.id)
            .filter((id: any) => id !== null && id !== undefined);
    }

    private resetSelection(): void {
        this.selectedContractIds = [];
        this.selectAllCurrentPage = false;
    }

    private updateSelectAllState(): void {
        const currentPageIds = this.getCurrentPageContractIds();
        this.selectAllCurrentPage =
            currentPageIds.length > 0 &&
            currentPageIds.every((id) => this.selectedContractIds.includes(id));
    }

    isContractSelected(contractId: number): boolean {
        return this.selectedContractIds.includes(contractId);
    }

    onToggleSelectAll(checked: boolean): void {
        const currentPageIds = this.getCurrentPageContractIds();

        if (checked) {
            this.selectedContractIds = [...currentPageIds];
            this.selectAllCurrentPage = true;
            return;
        }

        this.resetSelection();
    }

    onToggleContractSelection(contract: any, checked: boolean): void {
        if (!contract?.id) {
            return;
        }

        if (checked) {
            if (!this.selectedContractIds.includes(contract.id)) {
                this.selectedContractIds = [
                    ...this.selectedContractIds,
                    contract.id,
                ];
            }
        } else {
            this.selectedContractIds = this.selectedContractIds.filter(
                (id) => id !== contract.id
            );
        }

        this.updateSelectAllState();
    }

    openDeleteSelectedDialog(): void {
        if (this.selectedContractIds.length === 0) {
            this.messages = [
                {
                    severity: 'warn',
                    summary: 'Cảnh báo',
                    detail: 'Vui lòng chọn ít nhất một hợp đồng để xóa.',
                    life: 3000,
                },
            ];
            return;
        }

        this.isBulkDeleteDialog = true;
        this.showDiaLogDelete = true;
    }

    private deleteSelectedContracts(): void {
        const selectedIds = [...this.selectedContractIds];

        from(selectedIds)
            .pipe(
                concatMap((id) =>
                    this.contractService.deleteContract(id).pipe(
                        map(() => ({ id, success: true })),
                        catchError(() => of({ id, success: false }))
                    )
                ),
                toArray()
            )
            .subscribe((results) => {
                const successCount = results.filter((r) => r.success).length;
                const failCount = results.length - successCount;

                if (failCount === 0) {
                    this.messages = [
                        {
                            severity: 'success',
                            summary: 'Thành công',
                            detail: `Đã xóa ${successCount} hợp đồng`,
                            life: 3000,
                        },
                    ];
                } else {
                    this.messages = [
                        {
                            severity: 'warn',
                            summary: 'Hoàn tất một phần',
                            detail: `Đã xóa ${successCount} hợp đồng, ${failCount} hợp đồng xóa thất bại`,
                            life: 4000,
                        },
                    ];
                }

                this.closeDiaLogDelete();
                this.getPagingContract();
            });
    }

    goToPreviousPage(): void {
        if (this.pageIndex > 1) {
            this.pageIndex--;
        }
    }

    goToNextPage(): void {
        const lastPage = Math.ceil(this.totalRecords / this.pageSize);
        if (this.pageIndex < lastPage) {
            this.pageIndex++;
        }
    }
    updateCurrentPageReport(): void {
        const startRecord = (this.pageIndex - 1) * this.pageSize + 1;
        const endRecord = Math.min(
            this.pageIndex * this.pageSize,
            this.totalRecords
        );
        if (this.totalRecords === 0) {
            this.currentPageReport = `<strong>0</strong> - <strong>${endRecord}</strong> trong <strong>${this.totalRecords}</strong> bản ghi`;
        }
        if (this.totalRecords > 0) {
            this.currentPageReport = `<strong>${startRecord}</strong> - <strong>${endRecord}</strong> trong <strong>${this.totalRecords}</strong> bản ghi`;
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

    getCompanyData(id: number): void {
        this.companyService.getCompanyById(id).subscribe((response) => {
            if (response.status) {
                const data = response.data;
                this.selectedCompany = data;
            }
        });
    }

    showDialog() {
        this.displayDialog = true;
    }

    generatePDF(contract: any) {
        const contractNumberElement = document.querySelector(
            '.image-contract p:nth-child(3)'
        );
        if (contractNumberElement) {
            contractNumberElement.textContent = `Số ${contract.id}/2024`;
        }

        // Chuyển đổi ngày ký hợp đồng
        const signingDate = new Date(contract.signingDate);
        const formattedDate = `${signingDate.getDate()} tháng ${signingDate.getMonth() + 1
            } năm ${signingDate.getFullYear()}`;

        // Cập nhật ngày trong hợp đồng
        const dateElement = document.querySelector(
            '.contract-container .signDate'
        );
        if (dateElement) {
            dateElement.textContent = `Hôm nay, ngày ${formattedDate}, tại Công ty Cổ phần Công nghệ và Truyền thông SMO, chúng tôi gồm:`;
        }

        const signingDates = new Date(contract.signingDate);
        const formattedDates = `${signingDates.getDate()}/${signingDates.getMonth() + 1
            }/${signingDates.getFullYear()}`;

        const signingDateElement = document.querySelector(
            '.contract-container .tab-worker .signingDate'
        );
        if (signingDateElement) {
            signingDateElement.textContent = `${formattedDates} – Ký lần thứ …`;
        }

        const effectiveDate = new Date(contract.effectiveDate);
        const formattedEffectiveDate = `${effectiveDate.getDate()}/${effectiveDate.getMonth() + 1
            }/${effectiveDate.getFullYear()}`;

        const effectiveDateElement = document.querySelector(
            '.contract-container .tab-worker .effectiveDate'
        );
        if (effectiveDateElement) {
            effectiveDateElement.textContent = `${formattedEffectiveDate}`;
        }

        const expiryDate = new Date(contract.expiryDate);
        const formattedExpiryDate = `${expiryDate.getDate()}/${expiryDate.getMonth() + 1
            }/${expiryDate.getFullYear()}`;

        const expiryDateElement = document.querySelector(
            '.contract-container .tab-worker .expiryDate'
        );
        if (expiryDateElement) {
            expiryDateElement.textContent = `${formattedExpiryDate}`;
        }

        const addressElement = document.querySelector(
            '.contract-container .legalRepresentative'
        );
        if (addressElement) {
            const legalAddress =
                this.selectedCompany?.address || 'Không xác định';
            addressElement.textContent = `Địa chỉ: ${legalAddress}`;
        }

        const representativeElement = document.querySelector(
            '.contract-container .legalRepresentative'
        );
        if (representativeElement) {
            const legalRepresentative =
                this.selectedCompany?.legalRepresentative || 'Không xác định';
            representativeElement.textContent = `Đại diện: (Ông) ${legalRepresentative}`;
        }

        const titleElement = document.querySelector(
            '.contract-container .legalRepresentativeTitle'
        );
        if (titleElement) {
            const legalRepresentativeTitle =
                this.selectedCompany?.legalRepresentativeTitle ||
                'Không xác định';
            titleElement.textContent = `Chức vụ: ${legalRepresentativeTitle}`;
        }

        const nameEmployeeElement = document.querySelector(
            '.contract-container .tab-worker .lastFirtName'
        );
        if (nameEmployeeElement) {
            const legalLastNameEmployee =
                contract.employee?.lastName || 'Không xác định';
            const legalFirtNameEmployee =
                contract.employee?.firstName || 'Không xác định';
            nameEmployeeElement.textContent = `${legalLastNameEmployee} ${legalFirtNameEmployee}`;
        }

        const dateOfBirth = new Date(contract.employee?.dateOfBirth);
        const formattedDateOfBirth = `${dateOfBirth.getDate()}/${dateOfBirth.getMonth() + 1
            }/${dateOfBirth.getFullYear()}`;

        const dateOfBirthElement = document.querySelector(
            '.contract-container .tab-worker .dateOfBirth'
        );
        if (dateOfBirthElement) {
            dateOfBirthElement.textContent = `${formattedDateOfBirth}`;
        }

        const addresEmployeeElement = document.querySelector(
            '.contract-container .tab-worker .addresEmployee'
        );
        if (addresEmployeeElement) {
            const legaladdressEmployee =
            contract.employee?.profileInfo?.bornLocation || 'Không xác định';
            addresEmployeeElement.textContent = `Tại: ${legaladdressEmployee}`;
        }

        const contractTypeNameElement = document.querySelector(
            '.contract-container .tab-worker .contractTypeName'
        );
        if (contractTypeNameElement) {
            const legalcontractTypeName =
                contract.contractTypeName || 'Không xác định';
            contractTypeNameElement.textContent = `Loại hợp đồng: ${legalcontractTypeName}`;
        }

        const organizationNameElement = document.querySelector(
            '.contract-container .section1 .organizationName'
        );
        if (organizationNameElement) {
            const legalorganizationName =
                contract.unit?.organizationName || 'Không xác định';
            organizationNameElement.textContent = `+ Phòng: ${legalorganizationName}`;
        }

        const positionNameElement = document.querySelector(
            '.contract-container .section1 .positionName'
        );
        if (positionNameElement) {
            const legalpositionName =
                contract.employee?.staffPosition?.positionName ||
                'Không xác định';
            positionNameElement.textContent = `- Bộ phận công tác: ${legalpositionName}`;
        }

        const salaryAmountElement = document.querySelector(
            '.contract-container .tab-worker .salaryAmount'
        );
        if (salaryAmountElement) {
            const legalsalaryAmount = contract.salaryAmount || 0;
            const formattedsalaryAmount =
                legalsalaryAmount.toLocaleString('vi-VN');
            salaryAmountElement.textContent = `${formattedsalaryAmount} đồng/tháng`;
        }

        const salaryTotalAllowance = document.querySelector(
            '.contract-container .tab-worker .totalAllowance'
        );
        if (salaryTotalAllowance) {
            const totalAllowance = contract.totalAllowance || 0;
            const formattedAllowance = totalAllowance.toLocaleString('vi-VN');
            salaryTotalAllowance.textContent = `${formattedAllowance} đồng/tháng`;
        }

        const employeeElement = document.querySelector(
            '.worker-employee .employe'
        ) as HTMLElement | null;
        if (employeeElement) {
            if (contract.signStatus === 1) {
                employeeElement.textContent = contract.nameEmployee;
            } else if (contract.signStatus === 0) {
                employeeElement.textContent = '';
            }
        }

        const employerElement = document.querySelector(
            '.worker-employer .employer'
        ) as HTMLElement | null;
        if (employerElement) {
            if (contract.signStatus === 1) {
                employerElement.textContent =
                    contract.employee?.legalRepresentativeTitle ?? '';
            } else if (contract.signStatus === 0) {
                employerElement.textContent = '';
            }
        }

        const professionElement = document.querySelector(
            '.contract-container .tab-worker .profession'
        );

        if (professionElement) {
            const jobTitle = contract.position || "";

            professionElement.textContent = jobTitle;
        }

        const genderElement = document.querySelector(
            '.contract-container .tab-worker .gender'
        );

        if (genderElement) {
            const Title = contract.employee?.sex === 1 ? "Nam" : contract.employee?.sex === 0 ? "Nữ" : "";
            genderElement.textContent = `Giới tính: ${Title}`;
        }

        const residenceAddressElement = document.querySelector(
            '.contract-container .tab-worker .residenceAddress'
        );

        if (residenceAddressElement) {
            residenceAddressElement.textContent = contract.employee?.profileInfo?.originalLocation || '';
        }

        const permanentAddressElement = document.querySelector(
            '.contract-container .tab-worker .currentAddresss'
        );

        if (permanentAddressElement) {
            permanentAddressElement.textContent = contract.employee?.profileInfo?.bornLocation || '';
        }

        const paperNumberElement = document.querySelector(
            '.contract-container .tab-worker .paperNumber'
        );

        if (paperNumberElement) {
            paperNumberElement.textContent = contract.employee?.profileInfo?.paperNumber || '';
        }

        const paperProvideDateElement = document.querySelector(
            '.contract-container .tab-worker .paperProvideDate'
        );

        if (paperProvideDateElement && contract.employee?.profileInfo?.paperProvideDate) {
            const date = new Date(contract.employee.profileInfo.paperProvideDate);

            date.setHours(date.getHours() + 7);

            paperProvideDateElement.textContent = 'Cấp ngày: ' + date.toLocaleDateString('vi-VN');
        }

        const paperProvideLocationElement = document.querySelector(
            '.contract-container .tab-worker .paperProvideLocation'
        );

        if (paperProvideLocationElement) {
            const location = contract.employee?.profileInfo?.paperProvideLocation;
            paperProvideLocationElement.textContent = location ? `Tại: ${location}` : 'Tại:';
        }

        const staffTitleElement = document.querySelector(
            '.contract-container .section1 .staffTitle'
        );
        if (staffTitleElement) {
            const staffTitleName =
                contract.employee?.staffTitle?.staffTitleName ||
                'Không xác định';
                staffTitleElement.textContent = `+ Chức danh chuyên môn (vị trí công tác): ${staffTitleName}`;
        }

        this.createPDF(contract);
    }

    createPDF(contract: any) {
        const element = document.getElementById('contract-content');

        if (!element) {
            console.error('Element not found');
            return;
        }

        const clonedElement = element.cloneNode(true) as HTMLElement;
        clonedElement.style.display = 'block';

        const options = {
            margin: [2, -45, 2, -45],
            filename: `HD_${contract.nameEmployee + contract.codeEmployee}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        html2pdf().set(options).from(clonedElement).save();
    }

    generateViewPDF(contract: any) {
        const contractNumberElement = document.querySelector(
            '.image-contract p:nth-child(3)'
        );
        if (contractNumberElement) {
            contractNumberElement.textContent = `Số ${contract.id}/2024`;
        }

        // Chuyển đổi ngày ký hợp đồng
        const signingDate = new Date(contract.signingDate);
        const formattedDate = `${signingDate.getDate()} tháng ${signingDate.getMonth() + 1
            } năm ${signingDate.getFullYear()}`;

        // Cập nhật ngày trong hợp đồng
        const dateElement = document.querySelector(
            '.contract-container .signDate'
        );
        if (dateElement) {
            dateElement.textContent = `Hôm nay, ngày ${formattedDate}, tại Công ty Cổ phần Công nghệ và Truyền thông SMO, chúng tôi gồm:`;
        }

        const signingDates = new Date(contract.signingDate);
        const formattedDates = `${signingDates.getDate()}/${signingDates.getMonth() + 1
            }/${signingDates.getFullYear()}`;

        const signingDateElement = document.querySelector(
            '.contract-container .tab-worker .signingDate'
        );
        if (signingDateElement) {
            signingDateElement.textContent = `${formattedDates} – Ký lần thứ …`;
        }

        const effectiveDate = new Date(contract.effectiveDate);
        const formattedEffectiveDate = `${effectiveDate.getDate()}/${effectiveDate.getMonth() + 1
            }/${effectiveDate.getFullYear()}`;

        const effectiveDateElement = document.querySelector(
            '.contract-container .tab-worker .effectiveDate'
        );
        if (effectiveDateElement) {
            effectiveDateElement.textContent = `${formattedEffectiveDate}`;
        }

        const expiryDate = new Date(contract.expiryDate);
        const formattedExpiryDate = `${expiryDate.getDate()}/${expiryDate.getMonth() + 1
            }/${expiryDate.getFullYear()}`;

        const expiryDateElement = document.querySelector(
            '.contract-container .tab-worker .expiryDate'
        );
        if (expiryDateElement) {
            expiryDateElement.textContent = `${formattedExpiryDate}`;
        }

        const addressElement = document.querySelector(
            '.contract-container .legalRepresentative'
        );
        if (addressElement) {
            const legalAddress =
                this.selectedCompany?.address || 'Không xác định';
            addressElement.textContent = `Địa chỉ: ${legalAddress}`;
        }

        const representativeElement = document.querySelector(
            '.contract-container .legalRepresentative'
        );
        if (representativeElement) {
            const legalRepresentative =
                this.selectedCompany?.legalRepresentative || 'Không xác định';
            representativeElement.textContent = `Đại diện: (Ông) ${legalRepresentative}`;
        }

        const titleElement = document.querySelector(
            '.contract-container .legalRepresentativeTitle'
        );
        if (titleElement) {
            const legalRepresentativeTitle =
                this.selectedCompany?.legalRepresentativeTitle ||
                'Không xác định';
            titleElement.textContent = `Chức vụ: ${legalRepresentativeTitle}`;
        }

        const nameEmployeeElement = document.querySelector(
            '.contract-container .tab-worker .lastFirtName'
        );
        if (nameEmployeeElement) {
            const legalLastNameEmployee =
                contract.employee?.lastName || 'Không xác định';
            const legalFirtNameEmployee =
                contract.employee?.firstName || 'Không xác định';
            nameEmployeeElement.textContent = `${legalLastNameEmployee} ${legalFirtNameEmployee}`;
        }

        const dateOfBirth = new Date(contract.employee?.dateOfBirth);
        const formattedDateOfBirth = `${dateOfBirth.getDate()}/${dateOfBirth.getMonth() + 1
            }/${dateOfBirth.getFullYear()}`;

        const dateOfBirthElement = document.querySelector(
            '.contract-container .tab-worker .dateOfBirth'
        );
        if (dateOfBirthElement) {
            dateOfBirthElement.textContent = `${formattedDateOfBirth}`;
        }

        const addresEmployeeElement = document.querySelector(
            '.contract-container .tab-worker .addresEmployee'
        );
        if (addresEmployeeElement) {
            const legaladdressEmployee =
            contract.employee?.profileInfo?.bornLocation || 'Không xác định';
            addresEmployeeElement.textContent = `Tại: ${legaladdressEmployee}`;
        }

        const contractTypeNameElement = document.querySelector(
            '.contract-container .tab-worker .contractTypeName'
        );
        if (contractTypeNameElement) {
            const legalcontractTypeName =
                contract.contractTypeName || 'Không xác định';
            contractTypeNameElement.textContent = `Loại hợp đồng: ${legalcontractTypeName}`;
        }

        const organizationNameElement = document.querySelector(
            '.contract-container .section1 .organizationName'
        );
        if (organizationNameElement) {
            const legalorganizationName =
                contract.unit?.organizationName || 'Không xác định';
            organizationNameElement.textContent = `+ Phòng: ${legalorganizationName}`;
        }

        const positionNameElement = document.querySelector(
            '.contract-container .section1 .positionName'
        );
        if (positionNameElement) {
            const legalpositionName =
                contract.employee?.staffPosition?.positionName ||
                'Không xác định';
            positionNameElement.textContent = `- Bộ phận công tác: ${legalpositionName}`;
        }

        const salaryAmountElement = document.querySelector(
            '.contract-container .tab-worker .salaryAmount'
        );
        if (salaryAmountElement) {
            const legalsalaryAmount = contract.salaryAmount || 0;
            const formattedsalaryAmount =
                legalsalaryAmount.toLocaleString('vi-VN');
            salaryAmountElement.textContent = `${formattedsalaryAmount} đồng/tháng`;
        }

        const salaryTotalAllowance = document.querySelector(
            '.contract-container .tab-worker .totalAllowance'
        );
        if (salaryTotalAllowance) {
            const totalAllowance = contract.totalAllowance || 0;
            const formattedAllowance = totalAllowance.toLocaleString('vi-VN');
            salaryTotalAllowance.textContent = `${formattedAllowance} đồng/tháng`;
        }

        const employeeElement = document.querySelector(
            '.worker-employee .employe'
        ) as HTMLElement | null;
        if (employeeElement) {
            if (contract.signStatus === 1) {
                employeeElement.textContent = contract.nameEmployee;
            } else if (contract.signStatus === 0) {
                employeeElement.textContent = '';
            }
        }

        const employerElement = document.querySelector(
            '.worker-employer .employer'
        ) as HTMLElement | null;
        if (employerElement) {
            if (contract.signStatus === 1) {
                employerElement.textContent =
                    contract.employee?.legalRepresentativeTitle ?? '';
            } else if (contract.signStatus === 0) {
                employerElement.textContent = '';
            }
        }

        const professionElement = document.querySelector(
            '.contract-container .tab-worker .profession'
        );

        if (professionElement) {
            const jobTitle = contract.position || "";

            professionElement.textContent = jobTitle;
        }

        const genderElement = document.querySelector(
            '.contract-container .tab-worker .gender'
        );

        if (genderElement) {
            const Title = contract.employee?.sex === 1 ? "Nam" : contract.employee?.sex === 0 ? "Nữ" : "";
            genderElement.textContent = `Giới tính: ${Title}`;
        }

        const residenceAddressElement = document.querySelector(
            '.contract-container .tab-worker .residenceAddress'
        );

        if (residenceAddressElement) {
            residenceAddressElement.textContent = contract.employee?.profileInfo?.originalLocation || '';
        }

        const permanentAddressElement = document.querySelector(
            '.contract-container .tab-worker .currentAddresss'
        );

        if (permanentAddressElement) {
            permanentAddressElement.textContent = contract.employee?.profileInfo?.bornLocation || '';
        }

        const paperNumberElement = document.querySelector(
            '.contract-container .tab-worker .paperNumber'
        );

        if (paperNumberElement) {
            paperNumberElement.textContent = contract.employee?.profileInfo?.paperNumber || '';
        }

        const paperProvideDateElement = document.querySelector(
            '.contract-container .tab-worker .paperProvideDate'
        );

        if (paperProvideDateElement && contract.employee?.profileInfo?.paperProvideDate) {
            const date = new Date(contract.employee.profileInfo.paperProvideDate);

            date.setHours(date.getHours() + 7);

            paperProvideDateElement.textContent = 'Cấp ngày: ' + date.toLocaleDateString('vi-VN');
        }

        const paperProvideLocationElement = document.querySelector(
            '.contract-container .tab-worker .paperProvideLocation'
        );

        if (paperProvideLocationElement) {
            const location = contract.employee?.profileInfo?.paperProvideLocation;
            paperProvideLocationElement.textContent = location ? `Tại: ${location}` : '';
        }

        const staffTitleElement = document.querySelector(
            '.contract-container .section1 .staffTitle'
        );
        if (staffTitleElement) {
            const staffTitleName =
                contract.employee?.staffTitle?.staffTitleName ||
                'Không xác định';
                staffTitleElement.textContent = `+ Chức danh chuyên môn (vị trí công tác): ${staffTitleName}`;
        }

        this.createviewPDF(contract);
    }

    createviewPDF(contract: any) {
        const element = document.getElementById('contract-content');

        if (!element) {
            console.error('Element not found');
            return;
        }

        // Mở cửa sổ ngay trong lúc user click để tránh trình duyệt chặn popup
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            console.error('Popup bị chặn. Vui lòng cho phép popup cho trang này.');
            return;
        }

        const clonedElement = element.cloneNode(true) as HTMLElement;
        clonedElement.style.display = 'block';

        const options = {
            margin: [15, -45, 15, -45],
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        html2pdf()
            .set(options)
            .from(clonedElement)
            .toPdf()
            .get('pdf')
            .then((pdf) => {
                const blob = pdf.output('blob');
                const url = URL.createObjectURL(blob);
                printWindow.location.href = url;
            })
            .catch((err) => {
                console.error('Lỗi tạo PDF:', err);
                printWindow.close();
            });
    }


    openDiaLogDelete(contract: any): void {
        this.isBulkDeleteDialog = false;
        this.contractDelete = contract;
        this.showDiaLogDelete = true;
    }

    closeDiaLogDelete(): void {
        this.showDiaLogDelete = false;
        this.isBulkDeleteDialog = false;
        this.contractDelete = null;
    }

    ClickDelete(): void {
        if (this.isBulkDeleteDialog) {
            this.deleteSelectedContracts();
            return;
        }

        if (this.contractDelete) {
            const contractId = this.contractDelete.id;
            this.contractService.deleteContract(contractId).subscribe({
                next: () => {
                    this.messages = [
                        {
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Xóa thành công',
                            life: 3000,
                        },
                    ];
                    this.closeDiaLogDelete();
                    this.resetSelection();
                    this.getPagingContract();
                },
                error: (err) => {
                    console.error(err);
                    this.messages = [
                        {
                            severity: 'error',
                            summary: 'Thất bại',
                            detail: 'Có lỗi xảy ra',
                            life: 3000,
                        },
                    ];
                },
            });
        }
    }
    onContractStatusChange(event: any) {
        console.log('Hợp đồng được chọn:', event.value);
        this.selectedContractStatus = event.value.value; // Cập nhật giá trị
    }

    openContractPreview(contract: any) {
        const signingDate = new Date(contract.signingDate);
        const formattedDate = `${signingDate.getDate()} tháng ${signingDate.getMonth() + 1} năm ${signingDate.getFullYear()}`;

        const signingDates = new Date(contract.signingDate);
        const formattedDates = `${signingDates.getDate()}/${signingDates.getMonth() + 1}/${signingDates.getFullYear()}`;


        const legalLastNameEmployee =
            contract.employee?.lastName || 'Không xác định';
        const legalFirtNameEmployee =
            contract.employee?.firstName || 'Không xác định';

        const dateOfBirth = new Date(contract.employee?.dateOfBirth);
        const formattedDateOfBirth = `${dateOfBirth.getDate()}/${dateOfBirth.getMonth() + 1
            }/${dateOfBirth.getFullYear()}`;

        const legaladdressEmployee =
        contract.employee?.address || 'Không xác định';

        const effectiveDate = new Date(contract.effectiveDate);
        const formattedEffectiveDate = `${effectiveDate.getDate()}/${effectiveDate.getMonth() + 1
            }/${effectiveDate.getFullYear()}`;

        const expiryDate = new Date(contract.expiryDate);
        const formattedExpiryDate = `${expiryDate.getDate()}/${expiryDate.getMonth() + 1
            }/${expiryDate.getFullYear()}`;

        const legalsalaryAmount = contract.salaryAmount || 0;
        const formattedsalaryAmount =
            legalsalaryAmount.toLocaleString('vi-VN');

        const totalAllowance = contract.totalAllowance || 0;
        const formattedAllowance = totalAllowance.toLocaleString('vi-VN');

        const employeeElement1 = contract.signStatus === 1 ? contract.nameEmployee : '';
        const employeeElement2 = contract.signStatus === 1 ? contract.employee?.legalRepresentativeTitle : '';
        // if (contract.signStatus === 1) {
        //     const employee = employeeElement1; // Hiển thị tên nhân viên
        // } else if (contract.signStatus === 0) {
        //     const employee = ''; // Để trống

        // if (contract.signStatus === 1) {
        //     const employeer = employeeElement2; // Hiển thị tên nhân viên
        // } else if (contract.signStatus === 0) {
        //     const employeer = ''; // Để trống
        // }


        const contractHtml = `
            <html>
            <head>
                <title>Xem trước hợp đồng</title>
                <style>
                   .card {
                            border-radius: 5px;
                            border: none !important;
                            padding: 0 !important;
                        }


                        .menu-items {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                        }

                        .menu-btn {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        background: none;
                        border: none;
                        color: inherit;
                        cursor: pointer;
                        padding: 0.5rem;
                        text-align: left;
                        width: 100%;
                        }

                        .menu-btn:hover {
                        background-color: #f4f4f4;
                        }

                        ::ng-deep .p-treeselect {
                        width: 100%;
                        }

                        .disabled-calendar {
                        pointer-events: none; /* Ngăn mọi sự kiện chuột */
                        opacity: 0.6; /* Tăng trực quan */
                        }


                        #contract-content {
                        font-family: "Times New Roman", Times, serif;
                        padding-top: 30px; /* Thêm khoảng cách trên */
                        padding-bottom: 30px; /* Thêm khoảng cách dưới */
                        }

                        .contract {
                        font-family: "Times New Roman", Times, serif;
                        margin: 20px auto;
                        padding: 20px;
                        width: 60%;
                        line-height: 1.8;
                        }

                        .header {
                        font-family: "Times New Roman", Times, serif;
                        text-align: center;
                        font-size: 20px;
                        font-weight: bold;
                        text-transform: uppercase;
                        }

                        .sub-header {
                        font-family: "Times New Roman", Times, serif;
                        text-align: center;
                        font-size: 18px;
                        font-weight: 600;
                        margin-bottom: 10px;
                        }

                        .contract-container {
                        font-family: "Times New Roman", Times, serif;
                        }

                        .contract-number {
                        text-align: center;
                        margin: 55px 20px;
                        }

                        .title {
                        font-family: "Times New Roman", Times, serif;
                        text-align: center;
                        font-size: 22px;
                        font-weight: bold;
                        margin: 20px 0;
                        }

                        .section1 {
                        // text-indent: 50px;
                        font-size: 1.2rem;
                        line-height: 30px;
                        }

                        .intro1 {
                        font-style: italic;
                        font-size: 1.2rem;
                        }

                        .section-title {
                        font-size: 18px;
                        font-weight: bold;
                        margin-top: 20px;
                        margin-bottom: 10px;
                        }

                        p {
                        margin: 5px 0;
                        }

                        .footer {
                        display: flex;
                        justify-content: space-around;
                        text-align: center;
                        margin-top: 40px;
                        font-size: 16px;
                        }


                        table {
                        width: 100%;
                        border-collapse: collapse;
                        border: 1px solid black;
                        font-size: 16px;
                        }

                        td {
                        border: 1px solid black;
                        padding: 8px;
                        vertical-align: top;
                        }

                        td[colspan="2"] {
                        width: 50%;
                        }

                        .label {
                        width: 20%;
                        white-space: nowrap;
                        }

                        .small-cell {
                        width: 25%;
                        }

                        .tab-worker .label {
                        font-size: 1.2rem;
                        font-weight: bold;
                        }

                </style>
            </head>
            <body>
                 <div class="contract">
                    <div style="display: flex; justify-content: space-around">
                        <div class="image-contract">
                            <img
                                style="margin: 0 30px"
                                src="${window.location.origin}/assets/image/logospin.png"
                                width="40"
                                height="40"
                                alt="logo"
                            />
                            <p style="font-size: 20px; font-weight: 600; color: #476ea9">
                                SMO MEDIA
                            </p>
                            <p class="contract-id" style="margin: 40px 20px">Số ${contract.id}/2024</p>
                        </div>
                        <div class="title-contract">
                            <h1 class="header">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</h1>
                            <p class="sub-header">Độc lập – Tự do – Hạnh phúc</p>
                            <p class="contract-number">——————o0o——————</p>
                        </div>
                    </div>

                    <h2 class="title">HỢP ĐỒNG LAO ĐỘNG</h2>
                    <div class="contract-container">
                        <p class="intro1">- Căn cứ Bộ luật Lao động 2019;</p>

                        <p class="section1 signDate">
                            Hôm nay, ${formattedDate}, tại Công ty Cổ phần Công nghệ và
                            Truyền thông SMO, chúng tôi gồm:
                        </p>
                        <h3 class="section-title">
                            <u style="padding-bottom: 10px">Bên A: Người sử dụng lao động</u>
                        </h3>
                        <p class="section1 address">
                            Công ty: Cổ phần Công nghệ và Truyền thông SMO – SMO MEDIA JSC<br />
                            Địa chỉ: Thôn Liêu Hạ, xã Tân Lập, huyện Yên Mỹ, tỉnh Hưng Yên<br />
                            Điện thoại: 094 817 83 86<br />
                            Mã số thuế: 0901064979<br />
                        </p>
                        <div style="display: flex">
                            <p class="section1 legalRepresentative">
                                Đại diện: (Ông) Đỗ Văn Tùng
                            </p>
                            <p
                                style="padding: 0 60px"
                                class="section1 legalRepresentativeTitle"
                            >
                                Chức vụ: Giám Đốc
                            </p>
                            <p class="section1">Quốc tịch: Việt Nam</p>
                        </div>

                        <h3 class="section-title"><u>Bên B: Người lao động</u></h3>
                        <table class="tab-worker">
                            <tr>
                                <td>Ông/bà:</td>
                                <td colspan="2">${legalLastNameEmployee} ${legalFirtNameEmployee}</td>
                                <td class="small-cell">Quốc tịch: Việt Nam</td>
                            </tr>
                            <tr>
                                <td>Ngày sinh:</td>
                                <td colspan="2">${formattedDateOfBirth}</td>
                                <td class="small-cell">Tại: ${legaladdressEmployee}</td>
                            </tr>
                            <tr>
                                <td class="label">Nghề nghiệp:</td>
                                <td colspan="2"></td>
                                <td class="label small-cell">Giới tính:</td>
                            </tr>
                            <tr>
                                <td class="label">Địa chỉ thường trú:</td>
                                <td colspan="3"></td>
                            </tr>
                            <tr>
                                <td class="label">Địa chỉ cư trú:</td>
                                <td colspan="3"></td>
                            </tr>
                            <tr>
                                <td class="label">Số CMND/CCCD:</td>
                                <td></td>
                                <td class="label">Cấp ngày:</td>
                                <td class="label small-cell">Tại:</td>
                            </tr>
                        </table>
                        <p class="intro1">
                            Cùng thỏa thuận ký kết hợp đồng lao động và cam kết làm đúng những
                            điều khoản sau đây:
                        </p>

                        <h3 class="section-title">
                            <u>Điều 1: </u>Công việc, địa điểm làm việc và thời hạn của hợp đồng
                        </h3>
                        <table class="tab-worker">
                            <tr>
                                <td style="width: 30%">
                                    Loại hợp đồng: ${contract.contractTypeName}
                                </td>
                                <td colspan="3" class="signingDate">${formattedDates} – Ký lần thứ …</td>
                            </tr>
                            <tr>
                                <td style="width: 30%">Từ ngày:</td>
                                <td style="width: 20%">${formattedEffectiveDate}</td>
                                <td>Đến ngày:</td>
                                <td>${formattedExpiryDate}</td>
                            </tr>
                        </table>
                        <p class="section1">
                            - Địa điểm làm việc: Công ty cổ phần Công nghệ và Truyền thông SMO –
                            SMO MEDIA JSC<br />
                            - Bộ phận công tác: ……………………………………………………………………………………<br />
                            <span class="section1"
                                >+ Phòng: ${ contract.unit?.organizationName }</span
                            >
                            <br />
                            <span class="section1"
                                >+ + Chức danh chuyên môn (vị trí công tác):
                                ${ contract.employee?.staffPosition?.positionName }</span
                            >
                            <br />
                            - Nhiệm vụ công việc như sau:<br />
                            + Thực hiện công việc theo đúng chức danh chuyên môn của mình dưới
                            sự quản lý, điều hành của Ban Giám đốc (và các cá nhân được bổ nhiệm
                            hoặc ủy quyền phụ trách).<br />
                            + Phối hợp cùng với các bộ phận, phòng ban khác trong Người sử dụng
                            lao động để phát huy tối đa hiệu quả công việc.<br />
                            + Hoàn thành những công việc khác tùy thuộc theo yêu cầu kinh doanh
                            của Người sử dụng lao động và theo quyết định của Ban Giám đốc (và
                            các cá nhân được bổ nhiệm hoặc ủy quyền phụ trách).<br />
                        </p>

                        <h3 class="section-title">
                            <u>Điều 2: </u>Lương, phụ cấp, các khoản bổ sung khác
                        </h3>
                        <table class="tab-worker">
                            <tr>
                                <td>Lương căn bản:</td>
                                <td>${formattedsalaryAmount} đồng/tháng</td>
                                <td>Phụ cấp:</td>
                                <td>${formattedAllowance} đồng/tháng</td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    Các khoản bổ sung khác: Tùy quy định cụ thể của Công ty
                                </td>
                            </tr>
                        </table>
                        <p class="section1">
                            - Hình thức trả lương: Tiền mặt hoặc chuyển khoản. <br />
                            - Thời hạn trả lương: Được trả lương vào ngày 10 của tháng. <br />
                            - Chế độ nâng bậc, nâng lương: Người lao động được xét nâng bậc,
                            nâng lương theo kết quả làm việc và theo quy định của Người sử dụng
                            lao động.
                        </p>

                        <h3 class="section-title">
                            <u>Điều 3: </u>Thời giờ làm việc, nghỉ ngơi, bảo hộ lao động, BHXH,
                            BHYT, BHTN
                        </h3>
                        <p class="section1">
                            - Thời giờ làm việc: 08 giờ/ngày, Nghỉ hàng tuần: ngày Chủ nhật.
                            <br />
                            - Từ ngày Thứ 2 đến ngày Thứ 6 hàng tuần (và ngày Thứ 7 cách tuần):
                            <br />
                            + Buổi sáng : 8h00 - 12h00. <br />
                            + Buổi chiều: 13h15 - 17h15. <br />
                            - Chế độ nghỉ ngơi các ngày lễ, tết, phép năm: <br />
                            + Người lao động được nghỉ lễ, tết theo luật định; các ngày nghỉ lễ
                            nếu trùng với ngày Chủ nhật thì sẽ được nghỉ bù vào ngày trước hoặc
                            ngày kế tiếp tùy theo tình hình cụ thể mà Ban lãnh đạo Công ty sẽ
                            chỉ đạo trực tiếp. <br />
                            + Người lao động đã ký HĐLĐ chính thức và có thâm niên công tác 12
                            tháng thì sẽ được nghỉ phép năm có hưởng lương (01 ngày phép/01
                            tháng, 12 ngày phép/01 năm); trường hợp có thâm niên làm việc dưới
                            12 tháng thì thời gian nghỉ hằng năm được tính theo tỷ lệ tương ứng
                            với số thời gian làm việc. <br />
                            - Thiết bị và công cụ làm việc sẽ được Công ty cấp phát tùy theo nhu
                            cầu của công việc. <br />
                            - Điều kiện an toàn và vệ sinh lao động tại nơi làm việc theo quy
                            định của pháp luật hiện hành. <br />
                            - Bảo hiểm xã hội, bảo hiểm y tế và bảo hiểm thất nghiệp: Theo quy
                            định của pháp luật.
                        </p>

                        <h3 class="section-title">
                            <u>Điều 4: </u>Đào tạo, bồi dưỡng, các quyền lợi và nghĩa vụ liên
                            quan của người lao động
                        </h3>
                        <p class="section1">
                            - Đào tạo, bồi dưỡng: Người lao động được đào tạo, bồi dưỡng, huấn
                            luyện tại nơi làm việc hoặc được gửi đi đào tạo theo quy định của
                            Công ty và yêu cầu công việc. <br />
                            - Khen thưởng: Người lao động được khuyến khích bằng vật chất và
                            tinh thần khi có thành tích trong công tác hoặc theo quy định của
                            Công ty. <br />
                            - Nghĩa vụ liên quan của người lao động: <br />
                            + Tuân thủ hợp đồng lao động. <br />
                            + Thực hiện công việc với sự tận tâm, tận lực và mẫn cán, đảm bảo
                            hoàn thành công việc với hiệu quả cao nhất theo sự phân công, điều
                            hành (bằng văn bản hoặc bằng miệng) của Ban Giám đốc (và các cá nhân
                            được Ban Giám đốc bổ nhiệm hoặc ủy quyền phụ trách). <br />
                            + Hoàn thành công việc được giao và sẵn sàng chấp nhận mọi sự điều
                            động khi có yêu cầu. <br />
                            + Nắm rõ và chấp hành nghiêm túc kỷ luật lao động, an toàn lao động,
                            vệ sinh lao động, phòng cháy chữa cháy, văn hóa Công ty, nội quy lao
                            động và các chủ trương, chính sách của Công ty. <br />
                            + Trong trường hợp được cử đi đào tạo thì nhân viên phải hoàn thành
                            khóa học đúng thời hạn, phải cam kết sẽ phục vụ lâu dài cho Công ty
                            sau khi kết thúc khoá học và được hưởng nguyên lương, các quyền lợi
                            khác được hưởng như người đi làm. <br />
                            Nếu sau khi kết thúc khóa đào tạo mà nhân viên không tiếp tục hợp
                            tác với Công ty thì nhân viên phải hoàn trả lại 100% phí đào tạo và
                            các khoản chế độ đã được nhận trong thời gian đào tạo.. <br />
                            + Bồi thường vi phạm vật chất: Theo quy định nội bộ của Công ty và
                            quy định của pháp luật hiện hành; <br />
                            + Có trách nhiệm đề xuất các giải pháp nâng cao hiệu quả công việc,
                            giảm thiểu các rủi ro. Khuyến khích các đóng góp này được thực hiện
                            bằng văn bản. <br />
                            + Thuế TNCN (nếu có): Do người lao động đóng. Công ty sẽ tạm khấu
                            trừ trước khi chi trả cho người lao động theo quy định.
                        </p>

                        <h3 class="section-title">
                            <u>Điều 5: </u>Nghĩa vụ và quyền lợi của Người sử dụng lao động
                        </h3>
                        <p class="section1">
                            <b><i>1. Nghĩa vụ:</i></b> <br />
                            - Thực hiện đầy đủ những điều kiện cần thiết đã cam kết trong HĐLĐ
                            để Người lao động đạt hiệu quả công việc cao. Bảo đảm việc làm cho
                            Người lao động theo HĐLĐ đã ký. <br />
                            - Thanh toán đầy đủ, đúng hạn các chế độ và quyền lợi cho người lao
                            động theo hợp đồng lao động, thỏa ước lao động tập thể (nếu có);
                            <br />
                            <b><i>2. Quyền lợi:</i></b> <br />
                            - Điều hành Người lao động hoàn thành công việc theo HĐLĐ (bố trí,
                            điều chuyển công việc cho Người lao động theo đúng chức năng chuyên
                            môn). <br />
                            - Có quyền chuyển tạm thời lao động, ngừng việc, thay đổi, tạm hoãn,
                            chấm dứt HĐLĐ và áp dụng các biện pháp kỷ luật theo quy định của
                            Pháp luật hiện hành và theo nội quy của Công ty trong thời gian HĐLĐ
                            còn giá trị. <br />
                            - Có quyền đòi bồi thường, khiếu nại với cơ quan liên đới để bảo vệ
                            quyền lợi của mình nếu Người lao động vi phạm Pháp luật hay các điều
                            khoản của HĐLĐ.
                        </p>

                        <h3 class="section-title"><u>Điều 6: </u>Những thỏa thuận khác</h3>
                        <p class="section1">
                            <b><i>1. Tài liệu/Thông tin bảo mật:</i></b> <br />
                            <b
                                ><i>● <span style="padding-left: 35px">Tài liệu:</span></i></b
                            >
                            <br />
                            1.1. Bí mật kinh doanh và tài sản trí tuệ: được hiểu là các thông
                            tin, tài liệu thể hiện hoặc lưu trữ dưới các dạng như: văn bản, file
                            máy tính, thư điện tử, hình ảnh, mã code, phần mềm tin học mà Công
                            ty có được và thuộc quyền sở hữu hợp pháp của mình. <br />
                            Bí mật kinh doanh và tài sản trí tuệ còn được hiểu và thực hiện theo
                            quy định hiện hành của pháp luật Việt Nam và thông lệ Quốc tế (trong
                            trường hợp pháp luật Việt Nam chưa có quy định). <br />
                            1.2. Thông tin bảo mật: là những thông tin thuộc Bí mật kinh doanh
                            và tài sản trí tuệ nêu tại Điều 1.1 mà Người lao động trong quá
                            trình làm việc tại Công ty biết được hoặc tiếp cận được. <br />
                            1.3. Phù hợp với các quy định ở trên, Công ty quy định những thông
                            tin, tài liệu sau đây là tài sản của Công ty, cần được bảo mật và
                            giữ gìn vì quyền và lợi ích hợp pháp của Công ty. <br />
                            <b
                                ><i
                                    >●
                                    <span style="padding-left: 35px"
                                        >Thông tin bảo mật:</span
                                    ></i
                                ></b
                            >
                            <br />
                            - Danh sách khách hàng, thông tin khách hàng. <br />
                            - Sổ sách tài chính kế toán, chứng từ ngân hàng. <br />
                            - Hệ thống các phần mềm cài đặt trên máy vi tính của Công ty. <br />
                            - Kế hoạch kinh doanh, Báo cáo hoạt động kinh doanh. <br />
                            - Các tài liệu về tình hình tài chính của công ty (vay, nợ, phải
                            thu). <br />
                            - Kế hoạch/ý tưởng kinh doanh. <br />
                            - Tài liệu mô tả, phân tích thiết kế hệ thống, phần mềm, tài liệu
                            hướng dẫn và các tài liệu được phổ biến nội bộ. <br />
                            - Khóa mã bản quyền các phần mềm sử dụng trong Công ty. <br />
                            <b><i>2. Cam kết của người lao động:</i></b> <br />
                            2.1. Người lao động có trách nhiệm và cam kết bảo mật tất cả những
                            tài liệu/thông tin bảo mật của Công ty - quy định và nêu tại Điều 1
                            Phụ lục này. <br />
                            2.2. Người lao động cam kết không tự ý sao chép, cung cấp, mua bán
                            hoặc sử dụng những thông tin/tài liệu bảo mật cho bất kỳ ai, vì bất
                            kỳ lý do và mục đích gì nếu không có sự đồng ý bằng văn bản của Công
                            ty. <br />
                            2.3. Người lao động cam kết không đưa thông tin lên mạng bằng cách
                            phát tán ảnh chụp màn hình phần mềm, một phần hoặc toàn màn hình
                            hoặc bất cứ hành vi nào tiềm ẩn nguy cơ rò rỉ thông tin thông qua
                            Internet. <br />
                            2.4. Trong trường hợp vi phạm cam kết này, ngoài việc phải chịu hình
                            thức xử lý, kỷ luật như quy định của pháp luật, Người lao động còn
                            phải bồi thường toàn bộ thiệt hại do hành vi vi phạm của mình gây ra
                            theo quy định của pháp luật. <br />
                            2.5. Trong trường hợp vi phạm cam kết này, mà vì lý do khách quan
                            Công ty chưa đánh giá được mức độ thiệt hại và sự ảnh hưởng đến
                            quyền lợi hợp pháp của Công ty thì tùy theo mức độ vi phạm, Người
                            lao động đồng ý sẽ bị xử lý kỷ luật lao động đến mức cao nhất là sa
                            thải (theo quy định trong Nội quy lao động) và phải có trách nhiệm
                            bồi thường toàn bộ thiệt hại do mình gây ra cho công ty theo quy
                            định của pháp luật.
                        </p>

                        <h3 class="section-title"><u>Điều 7: </u>Điều khoản thi hành</h3>
                        <p class="section1">
                            - Những vấn đề về lao động không ghi trong hợp đồng lao động này thì
                            áp dụng quy định của thỏa ước tập thể, trường hợp chưa có thỏa ước
                            thì áp dụng quy định của pháp luật lao động. <br />
                            - Hợp đồng này được lập thành 2 bản có giá trị pháp lý như nhau, mỗi
                            bên giữ 1 bản và có hiệu lực kể từ ngày ký. <br />
                            - Khi ký kết các phụ lục hợp đồng lao động thì nội dung của phụ lục
                            cũng có giá trị như các nội dung của bản hợp đồng này.
                        </p>

                        <h3 class="footer">
                            <div class="worker-employee">
                                <p style="font-weight: bold">NGƯỜI LAO ĐỘNG</p>
                                <p>(Ký, ghi rõ họ tên)</p>
                                <p class="employe">${employeeElement1}</p>
                            </div>
                            <div class="worker-employer">
                                <p style="font-weight: bold">NGƯỜI SỬ DỤNG LAO ĐỘNG</p>
                                <p>(Ký, ghi rõ họ tên)</p>
                                <p class="employer">${employeeElement2}</p>
                            </div>
                        </h3>
                    </div>
                </div>
            </body>
            </html>
        `;

        const newTab = window.open('', '_blank');
        newTab.document.write(contractHtml);
        newTab.document.close();
    }

}
