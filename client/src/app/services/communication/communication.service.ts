import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClickResponse } from '@app/classes/click-response';
import { Coords } from '@app/classes/coords';
import { Gamecard } from '@app/classes/gamecard';
import { GameDiffData, GameSelectionPageData, GameplayData, bestTimes, gameHistoryInfo, playerTime } from '@common/game-interfaces';
import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    basicGet(): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}/example`).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    basicPost(message: Message): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/example/send`, message, { observe: 'response', responseType: 'text' });
    }
    imagesPost(request: object): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/games/images`, request, { observe: 'response', responseType: 'text' });
    }
    getGameNames(): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/games/names`).pipe(catchError(this.handleError<string[]>('getGameNames')));
    }

    getAllGames(): Observable<GameSelectionPageData[]> {
        return this.http
            .get<GameSelectionPageData[]>(`${this.baseUrl}/games/all`)
            .pipe(catchError(this.handleError<GameSelectionPageData[]>('getAll')));
    }

    getGameByName(name: string): Observable<GameplayData> {
        return this.http.post<GameplayData>(`${this.baseUrl}/games/gameByName`, { name }, { responseType: 'json' });
    }

    getAvailableGames(): Observable<Gamecard[]> {
        return this.http.get<Gamecard[]>(`${this.baseUrl}/games/all`);
    }
    sendPosition(name: string, coords: Coords): Observable<ClickResponse> {
        return this.http.post<ClickResponse>(`${this.baseUrl}/gaming/find`, { name, coords }, { responseType: 'json' });
    }
    getDiffAmount(name: string): Observable<number> {
        return this.http.post<number>(`${this.baseUrl}/gaming/diffAmount`, { name }, { responseType: 'json' });
    }

    getAllDiffs(name: string): Observable<GameDiffData> {
        return this.http.post<GameDiffData>(`${this.baseUrl}/gaming/findAll`, { name }, { responseType: 'json' });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deleteGame(name: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/games/${name}`);
    }
    getGameAvailability(name: string): Observable<boolean> {
        const url = `${this.baseUrl}/games/${name}`;
        return this.http.get<boolean>(url);
    }

    getAllBestTimes(): Observable<bestTimes[]> {
        return this.http.get<bestTimes[]>(`${this.baseUrl}/best-times/all`, { responseType: 'json' });
    }

    getBestTimesForGame(gameTitle: string, gameMode: string): Observable<bestTimes[]> {
        return this.http.get<bestTimes[]>(`${this.baseUrl}/best-times/${gameTitle}/${gameMode}`, { responseType: 'json' });
    }

    updateBestTimes(name: string, playerTime: playerTime) {
        this.http.request('POST', `${this.baseUrl}/best-times/${name}`, { body: playerTime }).subscribe();
    }

    resetBestTimes(name: string) {
        this.http.request('POST', `${this.baseUrl}/best-times/reset/${name}`).subscribe();
    }

    resetAllBestTimes() {
        this.http.request('POST', `${this.baseUrl}/best-times/reset`).subscribe();
    }

    getGameHistory(name: string): Observable<gameHistoryInfo[]> {
        return this.http.get<gameHistoryInfo[]>(`${this.baseUrl}/history/${name}`, { responseType: 'json' });
    }

    getGameAllHistory(): Observable<gameHistoryInfo[]> {
        return this.http.get<gameHistoryInfo[]>(`${this.baseUrl}/history/all`, { responseType: 'json' });
    }

    deleteGameHistory() {
        this.http.request('DELETE', `${this.baseUrl}/history`).subscribe();
    }

    updateGameHistory(gameHistoryInfo: gameHistoryInfo) {
        this.http.request('PUT', `${this.baseUrl}/history`, { body: gameHistoryInfo }).subscribe();
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
