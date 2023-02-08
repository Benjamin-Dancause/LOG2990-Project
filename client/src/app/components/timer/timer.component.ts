import { Component, OnInit } from '@angular/core';
import { TimerService } from '@app/services/timer.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
  min = 0;
  sec = 0;
  minutes = '00';
  seconds = '00';

  constructor(private timerService: TimerService) { }

  ngOnInit(): void {
    this.timerService.time.subscribe(time => {
      this.min = Math.floor(time / 60);
      this.sec = time % 60;
      this.minutes = this.pad(this.min);
      this.seconds = this.pad(this.sec);
    });
  }

  pad(value: number) {
    return value.toString().padStart(2, '0');
  }

}
