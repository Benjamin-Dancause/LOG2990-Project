import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameCardService: jasmine.SpyObj<GameCardService>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockSessionStorage: any = {};
    let mockSocket: jasmine.SpyObj<Socket>;

    beforeEach(async () => {
        mockSocketService = jasmine.createSpyObj<SocketService>(['soloGame']);
        gameCardService = jasmine.createSpyObj<GameCardService>(['removePlayer']);

        mockSocket = jasmine.createSpyObj<Socket>(['on', 'emit']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);

        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            imports: [HttpClientModule, MatDialogModule],
            providers: [
                { provide: SocketService, useValue: mockSocketService },
                { provide: GameCardService, useValue: gameCardService },
            ],
        }).compileComponents();

        mockSessionStorage = {};

        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        mockSocketService.socket = mockSocket;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set showPopup to false when returnToMainMenu is called', () => {
        component.gameTitle = 'test1';
        component.userName = 'player';
        gameCardService.removePlayer.and.returnValue(of(null));

        component.returnToMainMenu();
        expect(component.gameCardService.removePlayer).toHaveBeenCalledWith('test1', 'player');
    });

    it('should set showPopup to false', () => {
        component.showPopup = true;
        gameCardService.removePlayer.and.returnValue(of(null));

        component.returnToMainMenu();
        expect(component.showPopup).toBeFalse();
    });

    it('should set showPopup to true when socket emits "send-victorious-player"', () => {
        const player1 = true;
        mockSocket.on.withArgs('send-victorious-player', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(player1);
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('send-victorious-player', player1);
        expect(component.showPopup).toBeTrue();
    });
});
