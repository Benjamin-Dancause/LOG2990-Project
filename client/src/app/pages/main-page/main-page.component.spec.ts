import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageButtonComponent } from '@app/components/main-page-button/main-page-button.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationService } from '@app/services/communication.service';
import { of, throwError } from 'rxjs';
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
            imports: [RouterTestingModule, HttpClientModule],
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

    it("should have as title 'Nom_Jeu'", () => {
        expect(component.title).toEqual('Nom_Jeu');
    });

    it('should call basicGet when calling getMessagesFromServer', () => {
        component.getMessagesFromServer();
        expect(communicationServiceSpy.basicGet).toHaveBeenCalled();
    });

    it('should call basicPost when calling sendTimeToServer', () => {
        component.sendTimeToServer();
        expect(communicationServiceSpy.basicPost).toHaveBeenCalled();
    });

    it('should handle basicPost that returns a valid HTTP response', () => {
        component.sendTimeToServer();
        component.message.subscribe((res) => {
            expect(res).toContain('201 : Created');
        });
    });

    it('should handle basicPost that returns an invalid HTTP response', () => {
        communicationServiceSpy.basicPost.and.returnValue(throwError(() => new Error('test')));
        component.sendTimeToServer();
        component.message.subscribe({
            next: (res) => {
                expect(res).toContain('Le serveur ne répond pas');
            },
        });
    });
    /** 
     TODO: Verify that 3 buttons exist, 2 are able to redirect to correct page
           Also verify that image for logo exists
           Change that title for game matches correctly
           check that team number matches correctly
           
    
    **/
});
