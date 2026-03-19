import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.css'],
})
export class DetailComponent implements OnInit {
    items: any;
    profile: any;
    constructor() {
        this.items = [
            { label: 'Thông tin nhân sự' },
            { label: 'Hồ sơ', routerLink: '/profile' },
            { label: 'Chi tiết' },
        ];
    }

    ngOnInit() {}
}
