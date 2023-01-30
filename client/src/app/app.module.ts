import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { GameDifficultyLevelComponent } from '@app/components/game-difficulty-level/game-difficulty-level.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { HomeButtonComponent } from './components/home-button/home-button.component';
import { MainPageButtonComponent } from './components/main-page-button/main-page-button.component';
import { TopBarComponent } from './components/top-bar/top-bar/top-bar.component';
import { GameSelectionPageComponent } from './pages/game-selection-page-component/game-selection-page-component.component';
import { TimerComponent } from './components/timer/timer.component';
import { HintButtonComponent } from './components/hint-button/hint-button.component';
import { GiveUpButtonComponent } from './components/give-up-button/give-up-button.component';

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
        GameSelectionPageComponent,
        GameCardComponent,
        MainPageButtonComponent,
        GameDifficultyLevelComponent,
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
