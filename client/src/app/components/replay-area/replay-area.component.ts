import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-replay-area',
    templateUrl: './replay-area.component.html',
    styleUrls: ['./replay-area.component.scss'],
})
export class ReplayAreaComponent implements OnInit {
    isPlaying: boolean = false;
    speedSettings: number[] = [1, 2, 4];
    replaySpeed: number = 1;
    replaySpeedIndex: number = 0;
    constructor() {}

    ngOnInit(): void {}

    togglePlayPause(): void {
        this.isPlaying = !this.isPlaying;
    }
    changeReplaySpeed(): void {
        this.replaySpeedIndex = ++this.replaySpeedIndex % 3;
        this.replaySpeed = this.speedSettings[this.replaySpeedIndex];
    }
}
