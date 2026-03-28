import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TreeSelectModule } from 'primeng/treeselect';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { TreeTableModule } from 'primeng/treetable';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { OrganiStructListComponent } from './organi-struct-list.component';
import { OrganiStructListRoutingModule } from './organi-struct-list-routing.module';

@NgModule({
  declarations: [OrganiStructListComponent],
  imports: [
    OrganiStructListRoutingModule,
    SharedModule,
    TreeSelectModule,
    InputSwitchModule,
    MessagesModule,
    ToastModule,
    TreeTableModule,
    ButtonModule,
    TableModule,
    FormsModule
  ]

})
export class OrganiStructListModule { }
