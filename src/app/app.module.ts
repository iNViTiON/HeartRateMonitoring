import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LetModule } from '@rx-angular/template/let';
import { PushModule } from '@rx-angular/template/push';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [AppRoutingModule, BrowserModule, LetModule, PushModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
