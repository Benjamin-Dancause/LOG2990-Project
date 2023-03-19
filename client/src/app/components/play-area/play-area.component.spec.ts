import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CommunicationService } from '@app/services/communication.service';
import { CounterService } from '@app/services/counter.service';
import { GameService } from '@app/services/game.service';
import { InputService } from '@app/services/input.service';
import { SocketService } from '@app/services/socket.service';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    // let mouseEvent: MouseEvent;
    let counterService: CounterService;
    let communicationService: CommunicationService;
    let inputService: InputService;
    let gameService: GameService;
    let waitingRoomSpy: SocketService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [HttpClientModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component = new PlayAreaComponent(counterService, communicationService, inputService, gameService, waitingRoomSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    /* eslint-disable @typescript-eslint/no-magic-numbers -- Add reason **/
    // it('mouseHitDetect should not change the mouse position if it is not a left click', () => {
    //     const expectedPosition: Vec2 = { x: 0, y: 0 };
    //     mouseEvent = {
    //         offsetX: expectedPosition.x + 10,
    //         offsetY: expectedPosition.y + 10,
    //         button: 1,
    //     } as MouseEvent;
    //     component.mouseHitDetect(mouseEvent);
    //     expect(component.mousePosition).not.toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
    //     expect(component.mousePosition).toEqual(expectedPosition);
    // });

    // it('buttonDetect should modify the buttonPressed variable', () => {
    //     const expectedKey = 'a';
    //     const buttonEvent = {
    //         key: expectedKey,
    //     } as KeyboardEvent;
    //     component.buttonDetect(buttonEvent);
    //     expect(component.buttonPressed).toEqual(expectedKey);
    // });
});
