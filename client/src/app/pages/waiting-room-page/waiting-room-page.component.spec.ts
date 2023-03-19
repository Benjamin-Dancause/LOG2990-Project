import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WaitingRoomService } from '@app/services/waiting-room.service';

import { WaitingRoomPageComponent } from './waiting-room-page.component';

fdescribe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let mockWaitingRoomService: jasmine.SpyObj<WaitingRoomService>;

    beforeEach(async () => {
        mockWaitingRoomService = jasmine.createSpyObj<WaitingRoomService>([
            'handleLobby',
            'rejectPlayer',
            'closeLobby',
            'leaveLobby',
            'startOneVsOneGame',
        ]);
        mockWaitingRoomService.socket = jasmine.createSpyObj(['on']);
        await TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            imports: [RouterTestingModule],
            providers: [{ provide: WaitingRoomService, useValue: mockWaitingRoomService }],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
