import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BluetoothConnectionPage } from './bluetooth-connection.page';

const routes: Routes = [
  {
    path: '',
    component: BluetoothConnectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BluetoothConnectionPageRoutingModule {}
