import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { FileUploadModule, ToastModule, TabViewModule, TableModule, SplitButtonModule, ChartModule, PanelModule, ProgressBarModule, SharedModule } from 'primeng';
import { DashboardComponent } from './dashboard.component';
import { CircleProgressComponent } from './circle-progress/circle-progress.component';
import { FormsModule } from '@angular/forms';
import { ClockdashboardComponent } from './clockdashboard/clockdashboard.component';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';


@NgModule({
  declarations: [
    DashboardComponent,
    CircleProgressComponent,
    ClockdashboardComponent,
    MainDashboardComponent
  ],
  imports: [
    CommonModule,

    DashboardRoutingModule,
    FileUploadModule,
    ToastModule,
    TabViewModule,
    TableModule,
    SplitButtonModule,
    ChartModule,
    PanelModule,
    ProgressBarModule,
    FormsModule,
    SharedModule
  ],
})
export class DashboardModule { }
