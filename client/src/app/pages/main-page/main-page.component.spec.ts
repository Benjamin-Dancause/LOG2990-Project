import { Location } from '@angular/common';
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageButtonComponent } from '@app/components/main-page-button/main-page-button.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationService } from '@app/services/communication.service';
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
            imports: [RouterTestingModule.withRoutes([{ path: 'game-selection', component: GamePageComponent }]), HttpClientModule],
            declarations: [MainPageComponent, MainPageButtonComponent],
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }],
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

    it('should navigate to /game-selection when Classique is clicked', waitForAsync(
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
        expect(component.title).toEqual('Le Jeu Des Différences');
    });
});
