import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private readonly baseUrl: string = environment.serverUrl;

  constructor(private httpClient: HttpClient) { }

  getTime() {
    return this.httpClient.get(`${this.baseUrl}/timer`).pipe(
      map((response: any) => response.time),
      shareReplay(1)
    );
  }

  resetTimer() {
    return this.httpClient.post(`${this.baseUrl}/timer/reset`, {});
  }
}
