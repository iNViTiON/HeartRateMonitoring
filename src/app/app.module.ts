import { PushModule } from "@rx-angular/template/push";
import { LetModule } from "@rx-angular/template/let";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ViewportPrioModule } from '@rx-angular/template';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    LetModule,
    PushModule,
    ViewportPrioModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
