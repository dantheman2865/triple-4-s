import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BluetoothConnectionPageRoutingModule } from './bluetooth-connection-routing.module';

import { BluetoothConnectionPage } from './bluetooth-connection.page';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BluetoothConnectionPageRoutingModule
  ],
  declarations: [BluetoothConnectionPage],
  providers: [
    BLE,
    AndroidPermissions
  ]
})
export class BluetoothConnectionPageModule {}
