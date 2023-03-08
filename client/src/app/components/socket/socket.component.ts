import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-socket',
  templateUrl: './socket.component.html',
  styleUrls: ['./socket.component.scss']
})
export class SocketComponent implements OnInit, OnDestroy {

  numClients = 0;
  numClients$: Observable<number>;
  private numClientsSub: Subscription;

  constructor(private scService: SocketClientService) { }

  ngOnInit(): void {
    this.numClients$ = this.scService.numClients;
    this.numClientsSub = this.numClients$.subscribe(
      (numClients: number) => {
        this.numClients = numClients;
      });
  }

  ngOnDestroy(): void {
    this.numClientsSub.unsubscribe();
    this.scService.disconnect();
  }

  onClickConnect() {
    this.scService.connect();
  }

}
