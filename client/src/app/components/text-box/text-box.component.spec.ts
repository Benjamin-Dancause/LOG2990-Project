import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextBoxComponent } from '@app/components/text-box/text-box.component';
import { GameService } from '@app/services/game/game.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Socket } from 'socket.io-client';

describe('TextBoxComponent', () => {
    let component: TextBoxComponent;
    let fixture: ComponentFixture<TextBoxComponent>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockSocket: jasmine.SpyObj<Socket>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockSessionStorage: any = {};

    beforeEach(async () => {
        mockGameService = jasmine.createSpyObj<GameService>(['errorMessage', 'successMessage']);
        mockSocketService = jasmine.createSpyObj<SocketService>(['sendPlayerMessage', 'sendPlayerError', 'sendPlayerSuccess']);
        mockGameService.errorMessage = new EventEmitter();
        mockGameService.successMessage = new EventEmitter();
        mockSocket = jasmine.createSpyObj<Socket>(['on', 'emit']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);
        await TestBed.configureTestingModule({
            declarations: [TextBoxComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: SocketService, useValue: mockSocketService },
                { provide: GameService, useValue: mockGameService },
            ],
        }).compileComponents();

        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });

        spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string): void => {
            mockSessionStorage[key] = value;
        });

        fixture = TestBed.createComponent(TextBoxComponent);
        mockSocketService.socket = mockSocket;
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set userName to name stored in sessionStorage', () => {
        mockSessionStorage['userName'] = 'playerTestName';

        component.ngOnInit();
        expect(component.userName).toBe('playerTestName');
    });

    it('should set opponentName to joiningPlayer name stored in sessionStorage if player is gameMaster', () => {
        component.userName = 'playerTestMaster';
        mockSessionStorage['gameMaster'] = 'playerTestMaster';
        mockSessionStorage['joiningPlayer'] = 'playerTestJoiner';

        component.setOpponentName();
        expect(component.opponentName).toBe('playerTestJoiner');
    });

    it('should set opponentName to gameMaster name stored in sessionStorage if player is joiningPlayer', () => {
        component.userName = 'playerTestJoiner';
        mockSessionStorage['gameMaster'] = 'playerTestMaster';
        mockSessionStorage['joiningPlayer'] = 'playerTestJoiner';

        component.setOpponentName();
        expect(component.opponentName).toBe('playerTestMaster');
    });

    it('should call addSelfMessage if name emitted by "incoming-player-message" is same as userName', () => {
        mockSessionStorage['userName'] = 'player1';
        component.userName = 'player1';
        component.gameMode = '1v1';
        const messageInfo = { name: 'player1', message: 'Hello World' };
        mockSocket.on.withArgs('incoming-player-message', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(messageInfo);
            return mockSocket;
        });
        const addSelfMessageSpy = spyOn(component, 'addSelfMessage');
        component.ngOnInit();
        mockGameService.successMessage.next('incoming-player-message');
        mockSocket.emit('incoming-player-message');
        expect(addSelfMessageSpy).toHaveBeenCalledWith(messageInfo.message);
    });

    it('should call writeQuitMessage() when gameMode is not solo and "player-quit-game" event is emitted', () => {
        component.gameMode = '1v1';
        mockSocket.on.withArgs('player-quit-game', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback();
            return mockSocket;
        });
        const writeQuitMessageSpy = spyOn(component, 'writeQuitMessage');
        component.ngOnInit();
        mockSocket.emit('player-quit-game');
        expect(writeQuitMessageSpy).toHaveBeenCalled();
    });

    it('should call writeErrorMessage() when gameMode is not solo and "player-error" event is emitted', () => {
        component.gameMode = '1v1';
        const name = 'player1';
        mockSocket.on.withArgs('player-error', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(name);
            return mockSocket;
        });
        const writeErrorMessageSpy = spyOn(component, 'writeErrorMessage');
        component.ngOnInit();
        mockSocket.emit('player-error');
        expect(writeErrorMessageSpy).toHaveBeenCalledWith('player1');
    });

    it('should call writeSuccessMessage() when gameMode is not solo and "player-success" event is emitted', () => {
        component.gameMode = '1v1';
        const name = 'player1';
        mockSocket.on.withArgs('player-success', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(name);
            return mockSocket;
        });
        const writeSuccessMessageSpy = spyOn(component, 'writeSuccessMessage');
        component.ngOnInit();
        mockSocket.emit('player-success');
        expect(writeSuccessMessageSpy).toHaveBeenCalledWith('player1');
    });

    it('should call socketService.sendPlayerError() with userName when gameService errorMessage event is emitted in 1v1 mode', () => {
        component.gameMode = '1v1';
        component.ngOnInit();
        mockGameService.errorMessage.next('error-message');
        expect(mockSocketService.sendPlayerError).toHaveBeenCalledWith(component.userName);
    });

    it('should call socketService.sendPlayerSuccess() with userName when gameService successMessage event is emitted in 1v1 mode', () => {
        mockSessionStorage['userName'] = 'player1';
        component.gameMode = '1v1';
        component.ngOnInit();
        mockGameService.successMessage.next('success-message');
        expect(mockSocketService.sendPlayerSuccess).toHaveBeenCalledWith(component.userName);
    });

    it('should call writeErrorMessage() with userName when gameService errorMessage event is emitted in solo mode', () => {
        mockSessionStorage['userName'] = 'player1';
        component.gameMode = 'solo';
        const writeErrorMessageSpy = spyOn(component, 'writeErrorMessage');
        component.ngOnInit();
        mockGameService.errorMessage.next('error-message');
        expect(writeErrorMessageSpy).toHaveBeenCalledWith(component.userName);
    });

    it('should call writeSuccessMessage() with userName when gameService successMessage event is emitted in solo mode', () => {
        mockSessionStorage['userName'] = 'player1';
        component.gameMode = 'solo';
        const writeSuccessMessageSpy = spyOn(component, 'writeSuccessMessage');
        component.ngOnInit();
        mockGameService.successMessage.next('success-message');
        expect(writeSuccessMessageSpy).toHaveBeenCalledWith(component.userName);
    });

    it('should socketService.sendPlayerMessage with userName and messageText when sendMessage is called', () => {
        component.messageText = 'test message';
        component.sendMessage();
        expect(mockSocketService.sendPlayerMessage).toHaveBeenCalled();
    });

    it('should add a system message to the messages array and call scrollMessageArea when addSystemMessage is called', () => {
        const text = 'System message';
        component.messages = [];
        component.addSystemMessage(text);

        expect(component.messages.length).toBe(1);
        expect(component.messages[0].type).toBe('system');
        expect(component.messages[0].text).toBe(text);

        const scrollMessageAreaSpy = spyOn(component, 'scrollMessageArea');

        component.addSystemMessage(text);
        expect(scrollMessageAreaSpy).toHaveBeenCalled();
    });

    it('should add an opponent message to the messages array and call scrollMessageArea when addOpponentMessage is called', () => {
        const text = 'Opponent message';
        component.messages = [];
        component.addOpponentMessage(text);

        expect(component.messages.length).toBe(1);
        expect(component.messages[0].type).toBe('opponent');
        expect(component.messages[0].text).toBe(text);

        const scrollMessageAreaSpy = spyOn(component, 'scrollMessageArea');

        component.addOpponentMessage(text);
        expect(scrollMessageAreaSpy).toHaveBeenCalled();
    });

    it('should add our message to the messages array and call scrollMessageArea when addSelfMessage is called', () => {
        const text = 'our message';
        component.messages = [];
        component.addSelfMessage(text);

        expect(component.messages.length).toBe(1);
        expect(component.messages[0].type).toBe('self');
        expect(component.messages[0].text).toBe(text);

        const scrollMessageAreaSpy = spyOn(component, 'scrollMessageArea');

        component.addSelfMessage(text);
        expect(scrollMessageAreaSpy).toHaveBeenCalled();
    });

    it('should create a system message and call addSystemMessage when writeQuitMessage is called', () => {
        const addSystemMessageSpy = spyOn(component, 'addSystemMessage');
        component.opponentName = 'player1';
        component.writeQuitMessage();
        const timestamp = component.getTimestamp();
        const expectedMessage = `${timestamp} - player1 à quitté la partie.`;
        expect(addSystemMessageSpy).toHaveBeenCalledWith(expectedMessage);
    });

    it('should create a system message with name and call addSystemMessage when writeErrorMessage is called and gameMode is 1v1', () => {
        const addSystemMessageSpy = spyOn(component, 'addSystemMessage');
        component.gameMode = '1v1';
        component.opponentName = 'player1';
        const name = 'player1';
        component.writeErrorMessage(name);
        const timestamp = component.getTimestamp();
        const expectedMessage = `${timestamp} - Erreur par player1`;
        expect(addSystemMessageSpy).toHaveBeenCalledWith(expectedMessage);
    });

    it('should create a system message with name and call addSystemMessage when writeSuccessMessage is called and gameMode is 1v1', () => {
        const addSystemMessageSpy = spyOn(component, 'addSystemMessage');
        component.gameMode = '1v1';
        component.opponentName = 'player1';
        const name = 'player1';
        component.writeSuccessMessage(name);
        const timestamp = component.getTimestamp();
        const expectedMessage = `${timestamp} - Différence trouvée par player1`;
        expect(addSystemMessageSpy).toHaveBeenCalledWith(expectedMessage);
    });
});
