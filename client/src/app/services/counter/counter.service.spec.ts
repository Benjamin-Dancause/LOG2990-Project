import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
//import { environment } from 'src/environments/environment';

import { CounterService } from './counter.service';

describe('CounterService', () => {
    let service: CounterService;
    //let httpClient: HttpClient;
    //const baseUrl: string = environment.serverUrl;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [CounterService, HttpClient],
        });
        service = TestBed.inject(CounterService);
        //httpClient = TestBed.inject(HttpClient);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    /*
    it('should return counter value', () => {
        const mockResponse = 0;
        spyOn(httpClient, 'get').and.returnValue(of(mockResponse));

        service.getCounter().subscribe((result) => {
            expect(httpClient.get).toHaveBeenCalledWith(`${baseUrl}/counter`);
            expect(result).toEqual(mockResponse);
        });
    });

    it('should increment the counter and return it', () => {
        const mockResponse = 1;
        spyOn(httpClient, 'post').and.returnValue(of(mockResponse));

        service.incrementCounter().subscribe((result) => {
            expect(httpClient.post).toHaveBeenCalledWith(`${baseUrl}/counter/increment`, {});
            expect(result).toEqual(mockResponse);
        });
    });

    it('should make a POST request to the API to reset the counter', () => {
        const mockResponse = 0;
        spyOn(httpClient, 'post').and.returnValue(of(mockResponse));

        service.resetCounter().subscribe((result) => {
            expect(httpClient.post).toHaveBeenCalledWith(`${baseUrl}/counter/reset`, {});
            expect(result).toEqual(mockResponse);
        });
    });*/
});
