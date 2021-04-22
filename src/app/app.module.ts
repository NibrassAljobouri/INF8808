import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenuComponent } from './menu/menu.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from "@angular/material/radio";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { Viz1Component } from './viz1/viz1.component';
import { Viz2Component } from './viz2/viz2.component';
import { Graph1Component } from './graph1/graph1.component';
import { PreprocessingService } from './services/preprocessing.service';

@NgModule({
    declarations: [
        AppComponent,
        MenuComponent,
        Viz1Component,
        Viz2Component,
        Graph1Component
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatTabsModule,
        MatToolbarModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatRadioModule
    ],
    providers: [PreprocessingService],
    bootstrap: [AppComponent]
})
export class AppModule { }
