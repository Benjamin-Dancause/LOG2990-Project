/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameConfigService {
    readonly baseUrl: string = environment.serverUrl;

    constructor(private http: HttpClient) {}

    getCountdownTime(): Observable<number> {
        const url = `${this.baseUrl}/gameConfig/constants/countdownTime`;
        return this.http.get<number>(url);
    }

    setCountdownTime(time: number): Observable<any> {
        const url = `${this.baseUrl}/gameConfig/constants/countdownTime`;
        return this.http.post(url, { time });
    }

    getPenaltyTime(): Observable<number> {
        const url = `${this.baseUrl}/gameConfig/constants/penaltyTime`;
        return this.http.get<number>(url);
    }

    setPenaltyTime(time: number): Observable<any> {
        const url = `${this.baseUrl}/gameConfig/constants/penaltyTime`;
        return this.http.post(url, { time });
    }

    getTimeGained(): Observable<number> {
        const url = `${this.baseUrl}/gameConfig/constants/timeGained`;
        return this.http.get<number>(url);
    }

    setTimeGained(time: number): Observable<any> {
        const url = `${this.baseUrl}/gameConfig/constants/timeGained`;
        return this.http.post(url, { time });
    }
}
