import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ChatService } from '@app/services/chat/chat.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { ReplayAreaComponent } from './replay-area.component';

describe('ReplayAreaComponent', () => {
    let component: ReplayAreaComponent;
    let fixture: ComponentFixture<ReplayAreaComponent>;
    let replayServiceSpy: jasmine.SpyObj<ReplayService>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let replaySpy: jasmine.SpyObj<ReplayService>;
    let chatSpy: jasmine.SpyObj<ChatService>;

    beforeEach(async () => {
        replaySpy = jasmine.createSpyObj('ReplayService', [
            'startReplayTimer',
            'pauseReplayTimer',
            'resetReplayTimer',
            'changeSpeed',
            'resetReplayData',
        ]);
        chatSpy = jasmine.createSpyObj('ChatService', ['deleteMessages']);

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
        replayServiceSpy.replaySpeed = 2;
        component.changeReplaySpeed();
        expect(component.replaySpeed).not.toBe(1);
        expect(replayServiceSpy.changeSpeed).toHaveBeenCalledWith(component.replaySpeedIndex);
    });

    it('should reset the replay timer', () => {
        component.resetReplay();
        expect(replayServiceSpy.resetReplayTimer).toHaveBeenCalled();
    });

    it('should delete chat messages', () => {
        component.resetReplay();
        expect(chatServiceSpy.deleteMessages).toHaveBeenCalled();
    });

    it('should start the replay timer', () => {
        component.resetReplay();
        expect(replayServiceSpy.startReplayTimer).toHaveBeenCalled();
    });

    it('should emit a replayEvent', () => {
        spyOn(component.replayEvent, 'emit');
        component.resetReplay();
        expect(component.replayEvent.emit).toHaveBeenCalled();
    });
});
