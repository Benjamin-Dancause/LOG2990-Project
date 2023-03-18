import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigPageComponent } from '@app/pages/config-page-component/config-page-component.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { GameOneVsOnePageComponent } from '@app/pages/game-one-vs-one-page/game-one-vs-one-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameSelectionPageComponent } from '@app/pages/game-selection-page-component/game-selection-page-component.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { WaitingRoomPageComponent } from '@app/pages/waiting-room-page/waiting-room-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'gameOneVsOne', component: GameOneVsOnePageComponent },
    { path: 'create', component: CreatePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'game-selection', component: GameSelectionPageComponent },
    { path: 'config', component: ConfigPageComponent },
    { path: 'waitingRoom', component: WaitingRoomPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
