import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Page } from 'src/app/core/enums/page.enum';
import { AuthService } from 'src/app/core/services/identity/auth.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	providers: [MessageService],
})
export class LoginComponent implements OnInit {

	//Core
	Page = Page;
	isSubmitting: boolean = false;

	//State
	loginForm: FormGroup;
	validationMessages = {
		email: [
			{ type: 'required', message: 'Tên đăng nhập không được để trống' },
		],
		password: [
			{ type: 'required', message: 'Mật khẩu không được để trống' },
		],
	};

	constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private messageService: MessageService) {
		this.loginForm = this.fb.group({
			email: ['', Validators.required],
			password: ['', [Validators.required, Validators.email]],
			rememberMe: [true, Validators.required],
			type: [1, [Validators.required, Validators.min(1), Validators.max(3)]]
		});
	}

	ngOnInit() {
	}

	public handleOnSubmitLogin() {
		const request: any = this.loginForm.value;
		this.isSubmitting = true;
		this.authService.login(request).subscribe(
			(res) => {
				this.isSubmitting = false;
				if (res.status) {
					this.messageService.add({
						severity: 'sucess',
						summary: 'Thành công',
						detail: res.message,
					});
					this.authService.setAuthTokenLocalStorage(res.data);
					this.authService.fetchUserCurrent().subscribe((data) => {
						this.authService.setUserCurrent(data.data);
					});
					this.router.navigate([Page.Dashboard]);
				}
				else {
					this.messageService.add({
						severity: 'warning',
						summary: 'Thất bại',
						detail: res.message,
					});
				}
			},
			(exception) => {
				this.isSubmitting = false;

				this.messageService.add({
					severity: 'error',
					summary: 'Lỗi',
					detail: 'Lỗi hệ thống',
				});
				console.log(exception?.error.Message);
			}
		);
	}

}
