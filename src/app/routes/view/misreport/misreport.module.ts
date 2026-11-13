import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MisreportRoutingModule } from './misreport-routing.module';
import { BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { ProfitAndLossComponent } from './profit-and-loss/profit-and-loss.component';
import { TrialBalanceComponent } from './trial-balance/trial-balance.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BalanceSheetAdvComponent } from './balance-sheet-adv/balance-sheet-adv.component';
import { ProfitAndLossAdvComponent } from './profit-and-loss-adv/profit-and-loss-adv.component';
import { SplitButtonModule } from 'primeng';

@NgModule({
  declarations: [
    TrialBalanceComponent,
    ProfitAndLossComponent,
    BalanceSheetComponent,
    BalanceSheetAdvComponent,
    ProfitAndLossAdvComponent,
  ],
  imports: [
    CommonModule,
    MisreportRoutingModule,
    SplitButtonModule,
    SharedModule,
  ],
})
export class MisreportModule {}
