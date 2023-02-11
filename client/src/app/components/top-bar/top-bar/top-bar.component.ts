import { Component, Input } from '@angular/core';
import { CounterService } from '@app/services/counter.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  providers: [CounterService]
})

export class TopBarComponent{

  @Input() name: string;
  @Input() userName: string;
  
  

  constructor() {}


}
