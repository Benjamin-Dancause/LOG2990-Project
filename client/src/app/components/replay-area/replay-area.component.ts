import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { TIME } from '@common/constants';
import { PlayAreaComponent } from '../play-area/play-area.component';

@Component({
    selector: 'app-replay-area',
    templateUrl: './replay-area.component.html',
    styleUrls: ['./replay-area.component.scss'],
})
export class ReplayAreaComponent implements OnInit {
    @ViewChild(PlayAreaComponent) playArea: PlayAreaComponent;
    @Output() replayEvent = new EventEmitter();
    isPlaying: boolean = false;
    speedSettings: number[] = [1, 2, TIME.FOUR_X_SPEED];
    replaySpeed: number = 1;
    replaySpeedIndex: number = 0;
    constructor(public replay: ReplayService, private chat: ChatService) {}

    ngOnInit(): void {
        this.replay.startReplayTimer();
        this.chat.deleteMessages();
    }

    togglePlayPause(): void {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.replay.pauseReplayTimer();
        } else {
            this.replay.startReplayTimer();
        }
    }
    changeReplaySpeed(): void {
        this.replaySpeedIndex = ++this.replaySpeedIndex % 3;
        this.replay.changeSpeed(this.replaySpeedIndex);
        this.replaySpeed = this.replay.replaySpeed;
    }

    resetReplay(): void {
        this.replay.resetReplayTimer();
        this.chat.deleteMessages();
        this.replay.startReplayTimer();
        this.replayEvent.emit();
    }
}
