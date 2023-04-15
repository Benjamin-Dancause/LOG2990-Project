import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ReplayService } from '@app/services/replay/replay.service';
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
    speedSettings: number[] = [1, 2, 4];
    replaySpeed: number = 1;
    replaySpeedIndex: number = 0;
    constructor(public replay: ReplayService) {}

    ngOnInit(): void {}

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
        this.replayEvent.emit();
    }
}
