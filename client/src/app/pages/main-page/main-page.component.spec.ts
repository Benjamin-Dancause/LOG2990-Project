import { Location } from '@angular/common';
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageButtonComponent } from '@app/components/main-page-button/main-page-button.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost']);
        communicationServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        communicationServiceSpy.basicPost.and.returnValue(of(new HttpResponse<string>({ status: 201, statusText: 'Created' })));

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'game-selection', component: GamePageComponent }]), HttpClientModule, MatDialogModule],
            declarations: [MainPageComponent, MainPageButtonComponent],
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }, MatDialog],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate correctly when button is clicked', waitForAsync(
        inject([Location, Router], (location: Location) => {
            const button = fixture.debugElement.nativeElement.querySelector('#btn-Classique');
            button.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(location.path()).toEqual('/game-selection');
            });
        }),
    ));

    it("should have as title 'Le Jeu Des Différences'", () => {
        expect(typeof component.title).toEqual('string');
        expect(component.title).toEqual('Le Jeu Des Différences');
    });

    it('should open the dialog with correct game mode and title', () => {
        spyOn(component.dialog, 'open');
        component.gamemodeSelection();
        expect(component.dialog.open).toHaveBeenCalledWith(component.gamemodeSelectionTemplate, {
            width: '410px',
        });
        expect(sessionStorage.getItem('gameMode')).toEqual('tl');
        expect(sessionStorage.getItem('gameTitle')).toEqual('Temps Limité');
    });

    describe('saveUserName', () => {
        it('should save user name, game master and game mode in session storage and call initializeSocket', () => {
            component.userName = 'John Doe';
            component.saveUserName();
            expect(sessionStorage.getItem('userName')).toEqual('John Doe');
            expect(sessionStorage.getItem('gameMaster')).toEqual('John Doe');
            expect(sessionStorage.getItem('gameMode')).toEqual('tl');
        });
    });

    describe('saveUserNameDuo', () => {
        it('should save user name and game mode in session storage and call initializeSocket', () => {
            component.userName = 'Jane Doe';
            component.saveUserNameDuo();
            expect(sessionStorage.getItem('userName')).toEqual('Jane Doe');
            expect(sessionStorage.getItem('gameMode')).toEqual('tl');
        });
    });
});
