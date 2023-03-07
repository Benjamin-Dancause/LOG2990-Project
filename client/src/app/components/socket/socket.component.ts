import { Component } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
  selector: 'app-socket',
  templateUrl: './socket.component.html',
  styleUrls: ['./socket.component.scss']
})
export class SocketComponent {

  numClient: number;
  constructor(private scService: SocketClientService) { }

  onClickConnect() {
    this.scService.connect();
    this.scService.on<number>('clientNumber', (numClient) => {
      this.numClient = numClient;
    });
  }

}
