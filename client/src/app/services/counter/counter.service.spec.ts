import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, Subscription } from 'rxjs';
import { CommunicationService } from '../communication/communication.service';
import { SocketService } from '../socket/socket.service';
import { CounterService } from './counter.service';



fdescribe('CounterService', () => {
    let service: CounterService;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockCommunicationService: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        const communicationSpy = jasmine.createSpyObj('CommuncationService', ['getDiffAmount']);
        mockSocketService = jasmine.createSpyObj('SocketService', ['incrementCounter', 'resetCounter', 'sendVictoriousPlayer'])

        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [CounterService, 
                        {provide: CommunicationService, useValue: communicationSpy}],
        });
        service = TestBed.inject(CounterService);
        mockCommunicationService = TestBed.inject(CommunicationService) as jasmine.SpyObj<CommunicationService>;
        mockSocketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        
    });

    afterEach(() => {
        if(service.allDiffsSubscription && service.allDiffsSubscription instanceof Subscription) {
            service.allDiffsSubscription.unsubscribe();
        }
    })

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set the win condition to total differences in solo mode', () => {
        const totalDiff = 10;
        mockCommunicationService.getDiffAmount.and.returnValue(of(totalDiff));
        service.setWinCondition('solo', 'title');
        expect(service.winCondition).toEqual(totalDiff);
    });

    it('should set the win condition to half the differences in 1vs1 mode', () => {
        const totalDiff = 9;
        mockCommunicationService.getDiffAmount.and.returnValue(of(totalDiff));
        service.setWinCondition('1v1', 'title');
        expect(service.winCondition).toEqual(Math.ceil(totalDiff / 2));
    });

    it('should increment the counter correctly when incrementCounter() is called', () => {
        const player1 = true;
        service.incrementCounter(player1);
        expect(mockSocketService.incrementCounter).toHaveBeenCalledWith(true);
    });

    it('should reset the counter when resetCounter() is called', () => {
        const player1 = true;
        service.resetCounter(player1);
        expect(service.counter).toEqual(0);
        expect(service.counter2).toEqual(0);
        expect(mockSocketService.resetCounter).toHaveBeenCalledWith(true);
    });

    it('should send the correct victorious player when sendVictoriousPlayer() is called', () => {
        service.counter = 7;
        service.incrementCounter(true);
        expect(mockSocketService.sendVictoriousPlayer).toHaveBeenCalledWith(true);
    });
});
