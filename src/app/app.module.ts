import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LetModule, PushModule, ViewportPrioModule } from '@rx-angular/template';

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
