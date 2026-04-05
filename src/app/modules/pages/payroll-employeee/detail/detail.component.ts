import { PayrollDetailService } from 'src/app/core/services/payroll-detail.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PayrollInquiryService } from 'src/app/core/services/payroll-inquiry.service';
import { MessageService } from 'primeng/api';
import { InquiryStatus } from 'src/app/core/enums/payroll-inquiry.enum';
import { PayrollConfirmationStatus } from 'src/app/core/enums/payroll.enum';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.css'],
})
export class DetailComponent implements OnInit {
    updateReasonVisible: boolean = false;
    isSavingReason: boolean = false;
    id!: string; // Tham số `id`
    employeeid!: string; // Tham số `employeeid`
    totalReceiptSalary: number = 0;
    totalSalary: number = 0;
    payrollDetailEmployees: any;
    InquiryStatusEnum: typeof InquiryStatus = InquiryStatus;
    PayrollConfirmationStatusEnum: typeof PayrollConfirmationStatus =
        PayrollConfirmationStatus;
    constructor(
        private route: ActivatedRoute,
        private payrollDetailService: PayrollDetailService,
        private payrollInquiryService: PayrollInquiryService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        // Lấy các tham số từ URL
        this.route.paramMap.subscribe((params) => {
            this.id = params.get('id') || ''; // Lấy `id`
            this.employeeid = params.get('employeeid') || ''; // Lấy `employeeid`
            this.loadPayrollDetailEmployee({
                payrollId: this.id,
                employeeId: this.employeeid,
            });
        });
    }
    loadPayrollDetailEmployee(request: any): void {
        this.payrollDetailService.getPaging(request).subscribe((item: any) => {
            this.payrollDetailEmployees = item.items;
            console.log(
                ' this.payrollDetailEmployees',
                this.payrollDetailEmployees
            );
            this.totalReceiptSalary = this.payrollDetailEmployees.reduce(
                (acc, item) => acc + (item.totalReceivedSalary || 0),
                0
            );
            this.totalSalary = this.payrollDetailEmployees.reduce(
                (acc, item) => acc + (item.totalSalary || 0),
                0
            );
        });
    }
    get totalDeduction(): number {
        if (
            !this.payrollDetailEmployees ||
            this.payrollDetailEmployees.length !== 2
        ) {
            return 0;
        }
        return this.payrollDetailEmployees.reduce(
            (acc, item) => acc + (item.totalDeduction || 0),
            0
        );
    }
    get totalAllowance(): number {
        if (
            !this.payrollDetailEmployees ||
            this.payrollDetailEmployees.length !== 2
        ) {
            return 0;
        }
        return this.payrollDetailEmployees.reduce(
            (acc, item) => acc + (item.totalAllowance || 0),
            0
        );
    }

    handleConfirmPayrollEmployee(): void {
        if (
            !this.payrollDetailEmployees ||
            this.payrollDetailEmployees.length === 0
        ) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Lỗi',
                detail: 'Không có bảng lương nào để xác nhận!',
            });
            return;
        }
        // Tạo danh sách các request
        const confirmRequests = this.payrollDetailEmployees.map(
            (item) => item.id
        );
        // Gửi request xác nhận danh sách bảng lương cùng lúc
        this.payrollDetailService
            .confirmPayrollDetail({ payrollDetailIds: confirmRequests })
            .subscribe({
                next: (results: any) => {
                    console.log(results);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Xác nhận tất cả bảng lương thành công!',
                    });

                    // Tải lại danh sách sau khi cập nhật thành công
                    this.loadPayrollDetailEmployee({
                        payrollId: this.id,
                        employeeId: this.employeeid,
                    });
                },
                error: (error) => {
                    console.error('Lỗi khi xác nhận bảng lương:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Lỗi',
                        detail: 'Có lỗi xảy ra khi xác nhận bảng lương!',
                    });
                },
            });
    }

    // handleKhauTru(): number {
    //     if (
    //         !this.payrollDetailEmployees.deductions ||
    //         this.payrollDetailEmployees.deductions.length === 0
    //     ) {
    //         return 0;
    //     }

    //     const totalKhauTru = this.payrollDetailEmployees.deductions
    //         .filter((deduction) => !deduction.isDeleted) // Bỏ qua các khoản đã bị xóa
    //         .reduce((sum, deduction) => sum + (deduction.value || 0), 0); // Tính tổng
    //     return totalKhauTru;
    // }
    reasonResponse: string = '';
    get canSaveReason(): boolean {
        return !!this.reasonResponse?.trim() && !this.isSavingReason;
    }

    openReasonDialog(): void {
        this.reasonResponse = '';
        this.updateReasonVisible = true;
    }

    closeReasonDialog(): void {
        this.updateReasonVisible = false;
        this.reasonResponse = '';
    }

    saveReason(): void {
        const payrollDetailId =
            this.payrollDetailEmployees?.[0]?.payrollDetailId ??
            this.payrollDetailEmployees?.[0]?.id;
        const content = this.reasonResponse?.trim();

        if (!payrollDetailId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Lỗi',
                detail: 'Không tìm thấy bảng lương để gửi thắc mắc!',
            });
            return;
        }

        if (!content) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Thiếu thông tin',
                detail: 'Vui lòng nhập nội dung thắc mắc!',
            });
            return;
        }

        const request = {
            payrollDetailId,
            content,
            status: this.InquiryStatusEnum.Pending,
        };

        this.isSavingReason = true;
        this.payrollInquiryService
            .create(request)
            .pipe(
                finalize(() => {
                    this.isSavingReason = false;
                })
            )
            .subscribe({
                next: (res) => {
                    console.log(res);
                    if (res?.status === true) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Gửi thắc mắc thành công',
                        });
                        this.closeReasonDialog();
                        return;
                    }

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Thất bại',
                        detail: 'Đã có lỗi xảy ra',
                    });
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Lỗi',
                        detail: 'Không thể gửi thắc mắc. Vui lòng thử lại!',
                    });
                },
            });
    }
}
