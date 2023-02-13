import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CounterService {
    _counter = 0;
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private http: HttpClient) {}

    getCounter() {
        return this.http.get<number>(`${this.baseUrl}/counter`);
    }

    incrementCounter() {
        return this.http.post<number>(`${this.baseUrl}/counter/increment`, {});
    }

    resetCounter() {
        return this.http.post<number>(`${this.baseUrl}/counter/reset`, {});
    }
}
