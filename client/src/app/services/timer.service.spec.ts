import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;
    let httpClient: HttpClient;
    const baseUrl: string = environment.serverUrl;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [TimerService, HttpClient],
        });
        service = TestBed.inject(TimerService);
        httpClient = TestBed.inject(HttpClient);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getTime() should retrieve the time from the API', () => {
        /* const mockResponse = {data: {time: 1}};
    spyOn(httpClient, 'get').and.returnValue(of(mockResponse));

    let result: number;
    service.getTime().subscribe( (res) => {
      result = res;
      expect(httpClient.get).toHaveBeenCalledWith(`${baseUrl}/timer`);
      expect(result).toEqual(mockResponse.data.time);
    });*/
        // Test to fix later, need to find a better way to do this
    });

    it('should make a POST request to the API to reset the timer', () => {
        const mockResponse = { data: { time: 0 } };
        spyOn(httpClient, 'post').and.returnValue(of(mockResponse));

        service.resetTimer().subscribe((result) => {
            expect(httpClient.post).toHaveBeenCalledWith(`${baseUrl}/timer/reset`, {});
            expect(result).toEqual(mockResponse);
        });
    });
});
