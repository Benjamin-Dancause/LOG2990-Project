import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Coords } from '@app/classes/coords';
import { GameplayData, GameSelectionPageData } from '@app/components/create-image/create-image.component';
import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface DifferenceInterface {
    isDifference: boolean;
    differenceNumber: number;
    coords: Coords[];
}
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

    /*getAvailableGames(): Observable<Gamecard[]> {
        return this.http.get<Gamecard[]>(`${this.baseUrl}/games/allGames`);
    }*/
    sendPosition(id: number, coords: Coords): Observable<DifferenceInterface> {
        return this.http.post<DifferenceInterface>(`${this.baseUrl}/gaming/find`, { id, coords }, { responseType: 'json' });
    }
    createGameByName(name: string): Observable<number> {
        return this.http.post<number>(`${this.baseUrl}/gaming/new`, { name }, { responseType: 'json' });
    }
    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
