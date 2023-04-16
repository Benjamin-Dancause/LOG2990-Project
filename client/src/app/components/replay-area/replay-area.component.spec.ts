import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatService } from '@app/services/chat/chat.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { PlayAreaComponent } from '../play-area/play-area.component';
import { ReplayAreaComponent } from './replay-area.component';

describe('ReplayAreaComponent', () => {
    let component: ReplayAreaComponent;
    let fixture: ComponentFixture<ReplayAreaComponent>;
    let replayServiceSpy: jasmine.SpyObj<ReplayService>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;

    beforeEach(async () => {
        const replaySpy = jasmine.createSpyObj('ReplayService', ['startReplayTimer', 'pauseReplayTimer', 'resetReplayTimer', 'changeSpeed']);
        const chatSpy = jasmine.createSpyObj('ChatService', ['deleteMessages']);

        await TestBed.configureTestingModule({
            declarations: [ReplayAreaComponent, PlayAreaComponent],
            providers: [
                { provide: ReplayService, useValue: replaySpy },
                { provide: ChatService, useValue: chatSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ReplayAreaComponent);
        component = fixture.componentInstance;
        replayServiceSpy = TestBed.inject(ReplayService) as jasmine.SpyObj<ReplayService>;
        chatServiceSpy = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start replay timer on init', () => {
        expect(replayServiceSpy.startReplayTimer).toHaveBeenCalled();
    });

    it('should call deleteMessages on chat service on init', () => {
        expect(chatServiceSpy.deleteMessages).toHaveBeenCalled();
    });

    it('should toggle play/pause', () => {
        component.isPlaying = false;
        component.togglePlayPause();
        expect(component.isPlaying).toBe(true);
        expect(replayServiceSpy.pauseReplayTimer).toHaveBeenCalled();

        component.isPlaying = true;
        component.togglePlayPause();
        expect(component.isPlaying).toBe(false);
        expect(replayServiceSpy.startReplayTimer).toHaveBeenCalled();
    });

    it('should change replay speed', () => {
        component.replaySpeedIndex = 0;
        component.replaySpeed = 1;
        component.changeReplaySpeed();
        expect(component.replaySpeedIndex).not.toBe(1);
        expect(replayServiceSpy.changeSpeed).toHaveBeenCalledWith(component.replaySpeedIndex);
        // expect(component.replaySpeed).toBe(2);

        component.replaySpeedIndex = 2;
        component.replaySpeed = 4;
        component.changeReplaySpeed();
        expect(component.replaySpeedIndex).toBe(0);
        expect(replayServiceSpy.changeSpeed).toHaveBeenCalledWith(component.replaySpeedIndex);
        expect(component.replaySpeed).not.toBe(1);
    });
});
