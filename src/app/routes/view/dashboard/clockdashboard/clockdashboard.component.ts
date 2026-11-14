import { Component } from '@angular/core';

/**
 * Legacy dashboard entry point.
 *
 * Workgroups configured with `userDashboard = 'clockdashboard'` used to see
 * the clock face. They now share the same modern enterprise dashboard.
 */
@Component({
  selector: 'app-clockdashboard',
  templateUrl: './clockdashboard.component.html',
  styleUrls: ['./clockdashboard.component.scss'],
})
export class ClockdashboardComponent {}
