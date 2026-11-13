import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { ProfitAndLossComponent } from './profit-and-loss/profit-and-loss.component';
 import { TrialBalanceComponent } from './trial-balance/trial-balance.component'
import { BalanceSheetAdvComponent } from './balance-sheet-adv/balance-sheet-adv.component';
import { ProfitAndLossAdvComponent } from './profit-and-loss-adv/profit-and-loss-adv.component';

const routes: Routes = [
  {
    path: 'trialbalance',
    component: TrialBalanceComponent,
    data: { title: 'Trial Balance', titleI18n: 'Trial Balance' },
  },
  {
    path: 'profit-and-loss',
    component: ProfitAndLossAdvComponent,
    data: { title: 'Profit and Loss', titleI18n: 'Profit and Loss' },
  },
  {
    path: 'balance-sheet',
    component: BalanceSheetAdvComponent,
    data: { title: 'Balance Sheet', titleI18n: 'Balance Sheet' },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MisreportRoutingModule { }
