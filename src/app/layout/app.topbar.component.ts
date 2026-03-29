import { NotifyTopbarService } from './../core/services/notify-topbar.service';
import { RemindWorkNotificationService } from 'src/app/core/signlrs/remind-work-notification.service';
import { GpsTimekeepingService } from './../core/services/gps-timekeeping.service';
import {
    Component,
    computed,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../core/services/identity/auth.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Page } from '../core/enums/page.enum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../core/services/identity/user.service';
import { ToastService } from '../core/services/global/toast.service';
import { markAllAsTouched } from '../core/helpers/validatorHelper';
import { CreateDepartmentComponent } from '../modules/pages/department/create-department/create-department.component';
import { CreateProjectComponent } from '../modules/pages/project/create-project/create-project.component';
import { DelegacyDialogComponent } from '../modules/pages/dialog/delegacy-dialog/delegacy-dialog.component';
import { EstablishComponent } from '../modules/pages/department/establish/establish.component';
import { DepartmentService } from '../core/services/department.service';
import { ListProjectByEmployeeComponent } from '../modules/pages/project/list-project-by-employee/list-project-by-employee.component';
import { EmployeeService } from '../core/services/employee.service';
import { ShiftWorkService } from '../core/services/shift-work.service';
import { NotificationService } from '../core/signlrs/notification.service';
import { NotificationType } from '../core/enums/notification-type.enum';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styleUrls: ['./app.topbar.component.css'],
    providers: [ConfirmationService],
})
export class AppTopBarComponent implements OnInit {
    items!: MenuItem[];
    workLocation = { latitude: 10.762622, longitude: 106.660172 };
    isDialogVisible: boolean = false;
    createJobVisible: boolean = false;
    notifies: any;
    checkInForm: FormGroup;
    displayDialog = false;
    checkInOutOptions = [
        { label: 'Chấm vào', value: 'checkIn' },
        { label: 'Chấm ra', value: 'checkOut' },
    ];
    shifts = [
        { label: 'Ca HC', value: 'Ca HC' },
        { label: 'Ca Đêm', value: 'Ca Đêm' },
    ];
    approvers = [{ label: 'Lê Thị Lệ', value: 'Lê Thị Lệ' }];
    showEmojiPicker = false;
    emojiList = ['😀', '😂', '😍', '😎', '🤔', '😭', '😡', '🥳', '😜', '😇'];
    upcomingBirthdayMessage: string = '';
    employees: any[] = [];
    showBirthdayList = false;
    employeess: any[] = [];
    represenSigning: any[] = [];
    units: any[] = [];
    shiftWorks: any[] = [];
    notifications: any = [];
    unreadCount: number = 0;
    openJobDialog() {
        this.createJobVisible = true;
    }

    tieredItems: MenuItem[] = [];
    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;
    @ViewChild('establish') establish!: ElementRef;
    items1: MenuItem[] | undefined;
    public userCurrent: any;
    showDropdown: boolean = false;
    showJobInfoDropdown: boolean = false;
    public baseImageUrl = environment.baseApiImageUrl;

    isCheckOut: boolean = true;
    isCheckIn: boolean = true;
    checkStatus: any;
    showMenu = false;
    pageSize: number = 30;
    pageIndex: number = 1;

    @ViewChild('userInfo') userInfo!: ElementRef;
    @ViewChild(CreateDepartmentComponent)
    createDepartmentComponent!: CreateDepartmentComponent;
    @ViewChild(CreateProjectComponent)
    createProjectComponent!: CreateProjectComponent;
    @ViewChild(DelegacyDialogComponent)
    delegacyDialogComponent!: DelegacyDialogComponent;
    @ViewChild(EstablishComponent) establishComponent!: EstablishComponent;
    @ViewChild(ListProjectByEmployeeComponent)
    listProjectByEmployeeComponent!: ListProjectByEmployeeComponent;

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
        private userService: UserService,
        private toastService: ToastService,
        private messageService: MessageService,
        private gpsTimekeepingService: GpsTimekeepingService,
        private confirmationService: ConfirmationService,
        private notification: NotificationService,
        private employeeService: EmployeeService,
        private notificationService: NotificationService,
        private departmentService: DepartmentService, // private notifyTopbarService: NotifyTopbarService,
        private shiftWorkService: ShiftWorkService // private notifyTopbarService: NotifyTopbarService, // private remindWorkNotificationService: RemindWorkNotificationService
    ) {
        this.authService.userCurrent.subscribe((user) => {
            this.userCurrent = user;
        });

        this.setPasswordForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            oldPassword: ['', [Validators.required]],
            newPassword: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(25),
                    Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]*$/),
                ],
            ],
            repeatNewPassword: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(25),
                    Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]*$/),
                ],
            ],
        });
    }

    ngOnInit() {
        this.items1 = [
            {
                label: 'Calendar',
                icon: 'pi pi-calendar',
                command: () => {},
            },
            {
                label: 'Profile',
                icon: 'pi pi-user',
                command: () => {},
            },
            {
                label: 'Settings',
                icon: 'pi pi-cog',
                routerLink: '/documentation',
            },
        ];
        this.setPasswordForm?.get('email')?.setValue(this.userCurrent?.email);
        this.checkInStatus();
        this.getDepartments();
        this.loadEmployeesWithBirthday();
        this.loadEmployees();
        this.getAllShiftWork();
        // this.notificationService.startConnection();
        // this.getNotification();

        this.notificationService
            .startConnection()
            .then(() => {
                this.getNotification();
                this.notificationService.notifications$.subscribe(
                    (notification) => {
                        if (!notification || typeof notification !== 'object') {
                            return;
                        }

                        const content = notification.content || 'Bạn có thông báo mới';
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Thông báo',
                            detail: content,
                        });
                        this.notifications.unshift(notification);
                        //this.getNotification();
                        this.unreadCount = this.notifications.filter(
                            (x) => x.isRead !== true
                        ).length;
                    }
                );
            })
            .catch((error) => {
                console.warn('Notification hub connection failed', error);
            });
        // this.remindWorkNotificationService.startConnection().then(() => {
        //     this.remindWorkNotificationService.subscriptionStatus$.subscribe(
        //         (data) => {
        //             if (data) {
        //                 console.log(data);
        //                 this.notifies.unshift({
        //                     workId: data.workId,
        //                     content: data.content,
        //                 });
        //             }
        //         }
        //     );

        //     this.remindWorkNotificationService.subscriptionRemindStatus$.subscribe(
        //         (data) => {
        //             if (data) {
        //                 console.log(data);
        //                 this.notifies.unshift({
        //                     workId: data.workId,
        //                     content: data.content,
        //                 });
        //             }
        //         }
        //     );
        // });
        // this.loadNotify();
        // this.remindWorkNotificationService
        //     .startConnection()
        //     .then(() => {
        //         // Đăng ký nhận tin nhắn sau khi kết nối thành công
        //         console.log(
        //             'SignalR connection established, registering for ReceiveMessage'
        //         );
        //         this.remindWorkNotificationService.ReceiveWorkNotification(
        //             (message: any) => {
        //                 console.log(message);
        //             }
        //         );
        //     })
        //     .catch((err) => {
        //         console.error('Error during SignalR connection:', err);
        //     });
    }
    getNotification() {
        let request = {
            pageIndex: 1,
            pageSize: 1000,
            employeeReceiveId: this.userCurrent?.employee?.id,
        };

        this.notificationService.getNotifications(request).subscribe((res) => {
            this.notifications = res.data.items;
            console.log('this.notification', this.notifications);
            this.unreadCount = this.notifications.filter(
                (x) => x.isRead !== true
            ).length;
            console.log('unread', this.unreadCount);
        });
    }
    handleNotificationClick(notification) {
        console.log('notification click', notification);
        switch (notification.notificationType) {
            case NotificationType.CheckInCheckout:
                this.router.navigate([notification.url]);
                break;
            case NotificationType.LeaveApplication:
                this.router.navigate([notification.url]);
                break;
            case NotificationType.TimesheetConfirmation:
                this.router.navigate([notification.url]);
                break;
            default:
                console.warn('Không có đường dẫn cho loại thông báo này.');
        }
        console.log(notification.id);
        if (notification.isRead == false) {
            this.notificationService
                .updateReadStatus({ id: notification.id })
                .subscribe((res) => {
                    this.getNotification();
                });
        }
    }
    toggleBirthdayList() {
        this.showBirthdayList = !this.showBirthdayList;
    }

    loadEmployeesWithBirthday() {
        this.employeeService.getEmployeesByBirthMonth().subscribe(
            (response) => {
                this.employees = response.items.sort((a: any, b: any) => {
                    return (
                        new Date(a.dateOfBirth).getDate() -
                        new Date(b.dateOfBirth).getDate()
                    );
                });
            },
            (error) => {
                console.error(
                    'Lỗi khi lấy danh sách nhân viên sinh nhật',
                    error
                );
            }
        );
    }

    loadEmployees(): void {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.employeeService.getEmployees(request).subscribe((data) => {
            this.employeess = data.items.map((employee: any) => ({
                id: employee.id,
                name: `${employee.lastName} ${employee.firstName}`,
                employeeCode: employee.employeeCode,
                organizationId: employee.organization.id || '',
                positionName: employee.staffPosition?.positionName,
            }));

            this.units = [
                ...new Set(
                    data.items
                        .map((employee: any) => ({
                            id: employee.organization.id || '',
                            name:
                                employee.organization.organizationName ||
                                'Không xác định',
                        }))
                        .filter((unit) => unit.id)
                ),
            ];

            this.represenSigning = data.items
                .filter((employee: any) => employee.workingStatus === 0)
                .map((employee: any) => ({
                    id: employee.id,
                    name: `${employee.lastName} ${employee.firstName}`,
                    employeeCode: employee.employeeCode,
                    organizationId: employee.organization.id || '',
                    positionName: employee.staffPosition?.positionName,
                }));
        });
    }

    getAllShiftWork(): void {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.shiftWorkService.getPaging(request).subscribe(
            (shiftWork: any) => {
                this.shiftWorks = shiftWork.data.items;
            },
            (error) => {
                console.error('Error fetching categories:', error);
            }
        );
    }

    // loadNotify() {
    //     this.notifyTopbarService
    //         .getPaging({
    //             employeeId: this.userCurrent?.employee?.id,
    //             pageIndex: 1,
    //             pageSize: 5,
    //             sortBy: 'desc',
    //         })
    //         .subscribe((item) => {
    //             this.notifies = item.data.items;
    //         });
    // }
    checkInStatus(): void {
        this.gpsTimekeepingService
            .checkInStatus({ employeeId: this.userCurrent?.employee?.id })
            .subscribe((res) => {
                this.checkStatus = res.data;
            });
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const searchContainer = document.querySelector('.dropdown-user-info');
        const boxContainer = document.querySelector('.user-info-header');

        if (
            searchContainer &&
            !searchContainer.contains(target) &&
            !boxContainer.contains(target)
        ) {
            this.showDropdown = false;
        }

        const searchJobInfoContainer =
            document.querySelector('.dropdown-job-info');
        const boxJobInfoContainer = document.querySelector('.user-job-header');
        if (
            searchJobInfoContainer &&
            !searchJobInfoContainer.contains(target) &&
            !boxJobInfoContainer.contains(target)
        ) {
            this.showJobInfoDropdown = !this.showJobInfoDropdown;
        }
    }

    showDialog() {
        this.displayDialog = true;
    }

    toggleEmojiPicker() {
        this.showEmojiPicker = !this.showEmojiPicker;
    }

    insertEmoji(emoji: string) {
        const textarea = document.getElementById(
            'descriptionBox'
        ) as HTMLTextAreaElement;
        textarea.value += emoji;
        this.showEmojiPicker = false; // Đóng popup sau khi chọn emoji
    }

    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
    }

    toggleJobInfoDropdown() {
        this.showJobInfoDropdown = !this.showJobInfoDropdown;
    }

    handleLogOut() {
        this.authService.logout().subscribe((res) => {
            if (res.status == true) {
                this.authService.setAuthTokenLocalStorage(null);
                localStorage.removeItem('cachedProducts');
                this.router.navigate([Page.AdminLogin]);
                window.location.reload(); //load lại trang tny
            }
        });
    }

    //info
    displayInfo: boolean = false;
    displayChangePassword: boolean = false;
    handleOpenInfoDialog() {
        this.showDropdown = false;
        this.displayInfo = true;
    }

    handleOpenChangePasswordDialog() {
        this.showDropdown = false;
        this.displayChangePassword = true;
    }

    //api

    setPasswordForm: FormGroup;

    isSubmitting: any = false;

    validationMessages = {
        email: [{ type: 'required', message: 'Email không được để trống' }],
        oldPassword: [
            { type: 'required', message: 'Mật khẩu không được để trống' },
        ],
        newPassword: [
            { type: 'required', message: 'Mật khẩu mới không được để trống' },
            { type: 'maxlength', message: 'Quá nhiều kí tự' },
            {
                type: 'minlength',
                message: 'Quá ít kí tự-Mật khẩu phải có ít nhất 8 kí tự',
            },
            {
                type: 'pattern',
                message:
                    'Mật khẩu phải bao gồm cả số và chữ, không chứa khoảng trắng hoặc ký tự đặc biệt',
            },
        ],
        repeatNewPassword: [
            {
                type: 'required',
                message: 'Mật khẩu nhập lại không được để trống',
            },
            { type: 'maxlength', message: 'Quá nhiều kí tự' },
            {
                type: 'minlength',
                message: 'Quá ít kí tự-Mật khẩu phải có ít nhất 8 kí tự',
            },
            {
                type: 'pattern',
                message:
                    'Mật khẩu phải bao gồm cả số và chữ, không chứa khoảng trắng hoặc ký tự đặc biệt',
            },
        ],
    };

    handleSaveNewPassword() {
        if (this.isSubmitting) {
            return;
        }
        if (this.setPasswordForm.valid) {
            this.isSubmitting = true;
            if (
                this.setPasswordForm.value.newPassword ==
                this.setPasswordForm.value.repeatNewPassword
            ) {
                const request = this.setPasswordForm.value;
                this.userService.changePassword(request).subscribe(
                    (res) => {
                        if (res.status) {
                            this.toastService.showSuccess(
                                'Thành công',
                                res.message
                            );
                            this.displayChangePassword = false;
                        } else {
                            this.toastService.showWarning('Lỗi', res.message);
                        }
                    },
                    (exception) => {
                        this.toastService.showError('Lỗi', 'Lỗi hệ thống');
                        this.displayChangePassword = false;
                    },
                    () => {
                        this.isSubmitting = false;
                    }
                );
            } else {
                this.toastService.showWarning(
                    'Cảnh báo',
                    'Mật khẩu nhập lại chưa khớp'
                );
                this.isSubmitting = false;
            }
        } else {
            markAllAsTouched(this.setPasswordForm);
            this.toastService.showWarning('Cảnh báo', 'Cần nhập đủ thông tin');
        }
    }
    // TimekeepingGpsLog;
    handleCheckInOut(action: string, event: any) {
        // Gọi API checkInStatus để lấy cấu hình mới nhất (cố định/không cố định, địa điểm...)
        // tránh trường hợp admin đổi vị trí nhưng frontend vẫn dùng cache cũ
        this.gpsTimekeepingService
            .checkInStatus({ employeeId: this.userCurrent?.employee?.id })
            .subscribe((res) => {
                const freshStatus = res.data;
                // 0 = Fix (Cố định): yêu cầu vị trí - kiểm tra GPS trong phạm vi địa điểm
                // 1 = NotFix (Không cố định): không yêu cầu vị trí - chấm ở bất cứ đâu
                const requiresLocation =
                    freshStatus?.timekeepingLocationOption === 0;
                const timekeepingLocationId =
                    freshStatus?.timekeepingLocationId ?? 0;

                const doConfirmAndCallApi = (
                    latitude?: number,
                    longitude?: number
                ) => {
                    const formData: any = {
                        timekeepingLocationId: timekeepingLocationId,
                        employeeId: this.userCurrent?.employee?.id,
                        // Enum TimekeepingGPSType: 0 = CheckIn, 1 = CheckOut
                        type: action === 'chamRa' ? 1 : 0,
                    };

                    // Chỉ gửi toạ độ khi đơn vị yêu cầu vị trí
                    if (requiresLocation) {
                        formData.latitude = latitude;
                        formData.longitude = longitude;
                    }

                    this.confirmationService.confirm({
                        target: event.target as EventTarget,
                        message: `Bạn có muốn chấm ${
                            action === 'chamRa' ? 'ra' : 'vào'
                        }?`,
                        header: 'Thông báo',
                        icon: 'pi pi-exclamation-triangle',
                        acceptIcon: 'none',
                        rejectIcon: 'none',
                        rejectButtonStyleClass: 'p-button-text',
                        acceptLabel: 'Xác nhận',
                        rejectLabel: 'Không',
                        accept: () => {
                            this.gpsTimekeepingService
                                .checkInOut(formData)
                                .subscribe((results) => {
                                    console.log(results);

                                    if (results.status) {
                                        // Cập nhật checkStatus local sau khi chấm thành công
                                        this.checkStatus = freshStatus;
                                        if (action === 'chamRa') {
                                            this.checkStatus.canCheckIn = true;
                                            this.checkStatus.canCheckOut =
                                                false;
                                        } else {
                                            this.checkStatus.canCheckIn =
                                                false;
                                            this.checkStatus.canCheckOut =
                                                true;
                                        }

                                        this.messageService.add({
                                            severity: 'success',
                                            summary: 'Thông báo',
                                            detail: results.message,
                                        });
                                    } else {
                                        this.messageService.add({
                                            severity: 'warn',
                                            summary: 'Thông báo',
                                            detail: results.message,
                                        });
                                    }
                                });
                        },
                        reject: () => {},
                    });
                };

                // Nếu không yêu cầu vị trí → không cần gọi geolocation
                if (!requiresLocation) {
                    doConfirmAndCallApi();
                    return;
                }

                // Chỉ khi timekeepingLocationOption = 0 (Fix/Cố định) mới dùng GPS
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const latitude = position.coords.latitude;
                            const longitude = position.coords.longitude;
                            doConfirmAndCallApi(latitude, longitude);
                        },
                        (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Thông báo',
                                detail:
                                    'Không thể lấy vị trí. Vui lòng bật GPS và thử lại.',
                            });
                        }
                    );
                } else {
                    alert(
                        'Trình duyệt của bạn không hỗ trợ Geolocation.'
                    );
                }
            });
    }

    checkProximity(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
        maxDistance = 0.5 // Đơn vị: kilomet
    ): boolean {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371; // Bán kính trái đất (kilomet)
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Khoảng cách tính bằng kilomet

        return distance <= maxDistance;
    }

    isDisabled(action: string): boolean {
        if (action === 'chamRa') {
            return !this.checkStatus?.canCheckOut;
        } else if (action === 'chamVao') {
            return !this.checkStatus?.canCheckIn;
        }
        return false;
    }

    //tny add
    getDepartments() {
        this.departmentService
            .getAllByEmployee({
                organizationId: this.userCurrent.organization.id,
                employeeId: this.userCurrent.employee?.id,
            })
            .subscribe((res) => {
                if (res && res.data) {
                    const mappedDepartments = res.data.map((department) => ({
                        label: department.name || 'Không tên',
                        value: department.id,
                        projects: department.projects
                            ? department.projects.map((project) => ({
                                  label: project.name || 'Không tên dự án',
                                  value: project.id,
                              }))
                            : [],
                    }));
                    this.departments = mappedDepartments;
                }
            });
    }

    selectedDepartment: any = null;
    departments = [
        {
            label: 'Chọn phòng ban',
            value: null,
            projects: [],
        },
        {
            label: 'Phòng Nhân sự',
            value: 1,
            projects: [
                { label: 'Tuyển dụng', value: 1 },
                { label: 'Đào tạo', value: 2 },
            ],
        },
        {
            label: 'Phòng Kế toán',
            value: 2,
            projects: [
                { label: 'Thuế', value: 3 },
                { label: 'Lương', value: 4 },
            ],
        },
        {
            label: 'Phòng IT',
            value: 3,
            projects: [
                { label: 'Phát triển sản phẩm', value: 5 },
                { label: 'Bảo trì hệ thống', value: 6 },
            ],
        },
    ];

    projects: any = [];
    selectedProject: any = null;

    handleRedirectProject(event: any) {
        if (event.value == null) {
            this.router.navigate([
                '/department/container-view-department',
                this.selectedDepartment,
            ]);
        } else {
            this.router.navigate([
                '/department/container-view-department',
                this.selectedDepartment,
                'project-in-department',
                event.value,
            ]);
        }
    }
}
