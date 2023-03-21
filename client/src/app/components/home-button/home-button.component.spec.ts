import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketService } from '@app/services/socket/socket.service';

import { HomeButtonComponent } from './home-button.component';

describe('HomeButtonComponent', () => {
    let component: HomeButtonComponent;
    let fixture: ComponentFixture<HomeButtonComponent>;
    let socketService: jasmine.SpyObj<SocketService>;

    beforeEach(async () => {
        socketService = jasmine.createSpyObj('socketService', ['disconnectSocket']);
        socketService.disconnectSocket.and.callFake( () => {});

        await TestBed.configureTestingModule({
            declarations: [HomeButtonComponent],
        }).compileComponents();

        socketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        fixture = TestBed.createComponent(HomeButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should disconnect socket when disconnectSocket is called', () => {
        spyOn(component.socketService, 'disconnectSocket');
        component.disconnectSocket();
        expect(component.socketService.disconnectSocket).toHaveBeenCalled();
    });
});
