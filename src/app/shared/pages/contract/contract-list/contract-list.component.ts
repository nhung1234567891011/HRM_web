import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { ContractService } from 'src/app/core/services/contract.service';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CompanyInfoService } from 'src/app/core/services/company-info.service';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';

@Component({
    selector: 'app-contract-list',
    templateUrl: './contract-list.component.html',
    styleUrl: './contract-list.component.scss',
})
export class ContractListComponent implements OnInit {
    messages: any[] = [];
    contracts!: any;
    employees: any[] = [];
    filteredEmployees: any[] = [];
    selectedEmployee: any;
    selectedContract: any;
    items: MenuItem[] | undefined;
    pageSize: number = 30;
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
    permissionConstant = PermissionConstant;
    contractOption = [
        { name: 'Tất cả hợp đồng', value: null },
        { name: 'Hợp đồng đang có hiệu lực', value: false },
        { name: 'Hợp đồng hết hiệu lực', value: true },
    ];

    constructor(
        private contractService: ContractService,
        private employeesService: EmployeeService,
        private organizationService: OrganizationService,
        private companyService: CompanyInfoService,
        private http: HttpClient,
        public permisionHelper: HasPermissionHelper
    ) {}

    ngOnInit() {
        this.items = [
            { label: 'Thông tin nhân sự', routerLink: '/installation' },
            { label: 'Hợp đồng' },
        ];

        this.fetchEmployees();
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
            nameEmployee: this.selectedEmployee?.displayName || '',
            unitId: this.selectedNode?.data?.id,
            ExpiredStatus:
                this.selectedContractStatus !== null
                    ? this.selectedContractStatus
                    : undefined,
        };

        this.contractService.getPagingAllContract(request).subscribe(
            (response: any) => {
                this.contracts = response.items;
                console.log('contractData', this.contracts);
                this.totalRecords = response.totalRecords;
                this.updateCurrentPageReport();
            },
            (error: any) => {
                console.error(error);
            }
        );
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

    fetchEmployees() {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.employeesService.getEmployees(request).subscribe((data: any) => {
            this.employees = data.items.map((employee) => ({
                ...employee,
                displayName: `${employee.lastName} ${employee.firstName}`,
            }));
        });
    }

    searchEmployee(event: any) {
        const query = event.query.toLowerCase();
        this.filteredEmployees = this.employees.filter((employee) =>
            employee.displayName.toLowerCase().includes(query)
        );
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

    getCompanyData(id: number): void {
        this.companyService.getCompanyById(id).subscribe((response) => {
            if (response.status) {
                const data = response.data;
                this.selectedCompany = data;
            }
        });
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
        const formattedDate = `${signingDate.getDate()} tháng ${
            signingDate.getMonth() + 1
        } năm ${signingDate.getFullYear()}`;

        // Cập nhật ngày trong hợp đồng
        const dateElement = document.querySelector(
            '.contract-container .signDate'
        );
        if (dateElement) {
            dateElement.textContent = `Hôm nay, ngày ${formattedDate}, tại Công ty Cổ phần Công nghệ và Truyền thông SMO, chúng tôi gồm:`;
        }

        const signingDates = new Date(contract.signingDate);
        const formattedDates = `${signingDates.getDate()}/${
            signingDates.getMonth() + 1
        }/${signingDates.getFullYear()}`;

        const signingDateElement = document.querySelector(
            '.contract-container .tab-worker .signingDate'
        );
        if (signingDateElement) {
            signingDateElement.textContent = `${formattedDates} – Ký lần thứ …`;
        }

        const effectiveDate = new Date(contract.effectiveDate);
        const formattedEffectiveDate = `${effectiveDate.getDate()}/${
            effectiveDate.getMonth() + 1
        }/${effectiveDate.getFullYear()}`;

        const effectiveDateElement = document.querySelector(
            '.contract-container .tab-worker .effectiveDate'
        );
        if (effectiveDateElement) {
            effectiveDateElement.textContent = `${formattedEffectiveDate}`;
        }

        const expiryDate = new Date(contract.expiryDate);
        const formattedExpiryDate = `${expiryDate.getDate()}/${
            expiryDate.getMonth() + 1
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
        const formattedDateOfBirth = `${dateOfBirth.getDate()}/${
            dateOfBirth.getMonth() + 1
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
                contract.employee?.address || 'Không xác định';
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
            positionNameElement.textContent = `+ Chức danh chuyên môn (vị trí công tác): ${legalpositionName}`;
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
        );
        if (contract.signStatus === 1) {
            employeeElement.textContent = contract.nameEmployee; // Hiển thị tên nhân viên
        } else if (contract.signStatus === 0) {
            employeeElement.textContent = ''; // Để trống
        }

        const employerElement = document.querySelector(
            '.worker-employer .employer'
        );
        if (contract.signStatus === 1) {
            employerElement.textContent =
                contract.employee?.legalRepresentativeTitle; // Hiển thị tên nhân viên
        } else if (contract.signStatus === 0) {
            employerElement.textContent = ''; // Để trống
        }

        this.createPDF(contract);
    }

    createPDF(contract: any) {
        const element = document.getElementById('contract-content');
        if (element) {
            element.style.display = 'block';
            html2canvas(element).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 190;
                const pageHeight = pdf.internal.pageSize.height;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(
                        imgData,
                        'PNG',
                        10,
                        position,
                        imgWidth,
                        imgHeight
                    );
                    heightLeft -= pageHeight;
                }

                pdf.save(`contract_${contract.id}.pdf`);

                // Ẩn lại phần tử sau khi tạo PDF
                element.style.display = 'none';
            });
        } else {
            console.error('Element not found');
        }
    }

    openDiaLogDelete(contract: any): void {
        this.contractDelete = contract;
        this.showDiaLogDelete = true;
    }

    closeDiaLogDelete(): void {
        this.showDiaLogDelete = false;
        this.contractDelete = null;
    }

    ClickDelete(): void {
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
}
