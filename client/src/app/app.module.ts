import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { ButtonComponent } from './components/button/button.component';
import { CreateImageComponent } from './components/create-image/create-image.component';
import { HomeButtonComponent } from './components/home-button/home-button.component';
import { MainPageButtonComponent } from './components/main-page-button/main-page-button.component';
import { PreviousNextButtonComponent } from './components/previous-next-button/previous-next-button.component';
import { SettingsButtonComponent } from './components/settings-button/settings-button.component';
import { SliderComponent } from './components/slider/slider.component';
import { TopBarComponent } from './components/top-bar/top-bar/top-bar.component';
import { ConfigPageComponent } from './pages/config-page-component/config-page-component.component';
import { CreatePageComponent } from './pages/create-page/create-page.component';
import { GameSelectionPageComponent } from './pages/game-selection-page-component/game-selection-page-component.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,

        GamePageComponent,

        MainPageComponent,

        MaterialPageComponent,

        PlayAreaComponent,

        SidebarComponent,
        ButtonComponent,
        CreatePageComponent,
        CreateImageComponent,
        SliderComponent,
        GameSelectionPageComponent,
        GameCardComponent,
        MainPageButtonComponent,
        SettingsButtonComponent,
        HomeButtonComponent,
        PreviousNextButtonComponent,
        ConfigPageComponent,
        HomeButtonComponent,
        TopBarComponent,
        TimerComponent,
        HintButtonComponent,
        GiveUpButtonComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule],
})
export class AppModule {}
