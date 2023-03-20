/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameCardService {
    readonly baseUrl: string = environment.serverUrl;

    constructor(private http: HttpClient) {}

    addPlayer(gameTitle: string, userName: string): Observable<any> {
        const url = `${this.baseUrl}/gameCards/${gameTitle}/players`;
        return this.http.post(url, { userName });
    }

    removePlayer(gameTitle: string, userName: string): Observable<any> {
        const url = `${this.baseUrl}/gameCards/${gameTitle}/players/${userName}`;
        return this.http.delete(url);
    }

    getPlayers(gameTitle: string): Observable<string[]> {
        const url = `${this.baseUrl}/gameCards/${gameTitle}/players`;
        return this.http.get<string[]>(url);
    }
}
