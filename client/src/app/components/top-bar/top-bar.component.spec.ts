/* eslint-disable max-classes-per-file */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { Socket } from 'socket.io-client';
import { TopBarComponent } from './top-bar.component';
@Component({})
class MockTimerComponent {
    min = 0;
    sec = 0;
    minutes = '00';
    seconds = '00';
}
@Component({})
class MockCounterComponent {
    @Input() playerSide: boolean;
    count: number;
    player1: boolean;
}

describe('TopBarComponent', () => {
    let component: TopBarComponent;
    let fixture: ComponentFixture<TopBarComponent>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockSocket: jasmine.SpyObj<Socket>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockSessionStorage: any = {};

    beforeEach(async () => {
        mockSocketService = jasmine.createSpyObj('SocketService', ['connect']);
        mockSocket = jasmine.createSpyObj('Socket', ['on', 'emit', 'off']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);
        await TestBed.configureTestingModule({
            declarations: [TopBarComponent, MockTimerComponent, MockCounterComponent],
            imports: [HttpClientTestingModule],
            providers: [{ provide: SocketService, useValue: mockSocketService }],
        }).compileComponents();

        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });

        spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string): void => {
            mockSessionStorage[key] = value;
        });

        fixture = TestBed.createComponent(TopBarComponent);
        mockSocketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        mockSocketService.socket = mockSocket;
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have userName', () => {
        const stubUserName = 'stubUserName';
        mockSessionStorage['userName'] = stubUserName;

        component.ngOnInit();
        expect(sessionStorage.getItem).toHaveBeenCalled();
        expect(component.userName).toEqual(stubUserName);
    });

    it('should be empty if no userName has been saved', () => {
        const stubUserName = null;
        mockSessionStorage['userName'] = stubUserName;

        component.ngOnInit();
        expect(sessionStorage.getItem).toHaveBeenCalled();
        expect(component.userName).toEqual('');
    });

    it('should set userName to empty string if storedUserName is undefined or null', () => {
        mockSessionStorage['userName'] = 'player1';
        component.isCoop = true;
        component.ngAfterViewInit();

        // Manually emit the event
        mockSocket.on.calls.argsFor(0)[1]();
        fixture.detectChanges();

        expect(component.isCoop).toBeFalse();
    });

    it('should set userName to empty string if storedUserName is undefined or null', () => {
        mockSessionStorage['userName'] = undefined;
        component.ngOnInit();
        expect(component.userName).toEqual('');
    });

    it('should set opponent to joiningPlayer if player is gameMaster', () => {
        component.single = true;
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['gameMode'] = 'tl';
        mockSessionStorage['gameMaster'] = 'player1';
        mockSessionStorage['joiningPlayer'] = 'player2';
        component.ngOnInit();
        expect(component.opponent).toEqual('player2');
    });

    it('should set opponent to gameMaster if player is joiningPlayer', () => {
        component.single = true;
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['gameMode'] = 'tl';
        mockSessionStorage['gameMaster'] = 'player2';
        mockSessionStorage['joiningPlayer'] = 'player1';
        component.ngOnInit();
        expect(component.opponent).toEqual('player2');
    });

    it('should set opponent to empty joiningPlayer if userName is same as gameMaster', () => {
        component.single = false;
        mockSessionStorage['userName'] = 'test1';
        mockSessionStorage['gameMaster'] = 'test1';
        mockSessionStorage['joiningPlayer'] = 'test2';
        component.ngOnInit();
        expect(component.opponent).toEqual('test2');
    });
});
