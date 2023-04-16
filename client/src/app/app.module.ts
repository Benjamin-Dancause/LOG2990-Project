import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TextBoxComponent } from '@app/components/text-box/text-box.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ButtonComponent } from './components/button/button.component';
import { CounterComponent } from './components/counter/counter.component';
import { CreateImageComponent } from './components/create-image/create-image.component';
import { DrawingToolsComponent } from './components/drawing-tools/drawing-tools.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { GiveUpButtonComponent } from './components/give-up-button/give-up-button.component';
import { HintsComponent } from './components/hints/hints.component';
import { HistoryDialogComponent } from './components/history-dialog/history-dialog.component';
import { HomeButtonComponent } from './components/home-button/home-button.component';
import { MainPageButtonComponent } from './components/main-page-button/main-page-button.component';
import { PreviousNextButtonComponent } from './components/previous-next-button/previous-next-button.component';
import { SettingsButtonComponent } from './components/settings-button/settings-button.component';
import { SliderComponent } from './components/slider/slider.component';
import { TimerComponent } from './components/timer/timer.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { ConfigPageComponent } from './pages/config-page-component/config-page-component.component';
import { CreatePageComponent } from './pages/create-page/create-page.component';
import { GameOneVsOnePageComponent } from './pages/game-one-vs-one-page/game-one-vs-one-page.component';
import { GameSelectionPageComponent } from './pages/game-selection-page-component/game-selection-page-component.component';
import { LimitedTimePageComponent } from './pages/limited-time-page/limited-time-page.component';
import { WaitingRoomLimitedPageComponent } from './pages/waiting-room-limited-page/waiting-room-limited-page.component';
import { WaitingRoomPageComponent } from './pages/waiting-room-page/waiting-room-page.component';

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
        GiveUpButtonComponent,
        CounterComponent,
        GameOneVsOnePageComponent,
        DrawingComponent,
        DrawingToolsComponent,
        TextBoxComponent,
        WaitingRoomPageComponent,
        WaitingRoomLimitedPageComponent,
        LimitedTimePageComponent,
        HintsComponent,
        HistoryDialogComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, CommonModule],
})
export class AppModule {}
