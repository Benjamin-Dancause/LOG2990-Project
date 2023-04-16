import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { WaitingRoomLimitedPageComponent } from './waiting-room-limited-page.component';

describe('WaitingRoomLimitedPageComponent', () => {
    let component: WaitingRoomLimitedPageComponent;
    let fixture: ComponentFixture<WaitingRoomLimitedPageComponent>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockRouter: Router;

    beforeEach(() => {
        mockSocketService = jasmine.createSpyObj('SocketService', ['handleLobby', 'closeLobby']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            declarations: [WaitingRoomLimitedPageComponent],
            imports: [RouterTestingModule],
            providers: [
                { provide: SocketService, useValue: mockSocketService },
                { provide: Router, useValue: mockRouter },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingRoomLimitedPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    /*
    it('should set gameMaster, joiningPlayer, roomId and awaitingPlayer to true on lobby-created event', fakeAsync(() => {
        const gameInfo: CompleteGameInfo = {
            gameMaster: 'testId',
            joiningPlayer: 'testMaster',
            gameTitle: 'testJoiningPlayer',
            roomId: 'testRoomId',
        };
        mockSocketService.socket = jasmine.createSpyObj('Socket', ['on']);

        component.ngAfterViewInit();
        tick();

        expect(component.gameMaster).toBe(gameInfo.gameMaster);
        expect(sessionStorage.getItem('gameMaster')).toBe(gameInfo.gameMaster);
        expect(component.joiningPlayer).toBe(gameInfo.joiningPlayer);
        expect(sessionStorage.getItem('joiningPlayer')).toBe(gameInfo.joiningPlayer);
        expect(component.roomId).toBe(gameInfo.roomId);
        expect(sessionStorage.getItem('roomId')).toBe(gameInfo.roomId);
        expect(component.awaitingPlayer).toBeTrue();
    }));

    it('should call closeLobby and navigate to home on leaveLobby', () => {
        component.gameTitle = 'testGame';
        component.leaveLobby();
        expect(mockSocketService.closeLobby).toHaveBeenCalledWith('testGame');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
    */
});
