import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Message, TextBoxComponent } from '@app/components/text-box/text-box.component';
import { ChatService } from '@app/services/chat/chat.service';
import { CounterService } from '@app/services/counter/counter.service';
import { GameService } from '@app/services/game/game.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Socket } from 'socket.io-client';

describe('TextBoxComponent', () => {
    let component: TextBoxComponent;
    let fixture: ComponentFixture<TextBoxComponent>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockChatService: jasmine.SpyObj<ChatService>;
    let mockReplayService: jasmine.SpyObj<ReplayService>;
    let mockSocket: jasmine.SpyObj<Socket>;
    let mockCounterService: jasmine.SpyObj<CounterService>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockSessionStorage: any = {};

    beforeEach(async () => {
        mockGameService = jasmine.createSpyObj<GameService>(['errorMessage', 'successMessage', 'hintMessage']);
        mockCounterService = jasmine.createSpyObj<CounterService>(['recordMessage']);
        mockSocketService = jasmine.createSpyObj<SocketService>(['sendPlayerMessage', 'sendPlayerError', 'sendPlayerSuccess', 'sendNewRecord']);
        mockReplayService = jasmine.createSpyObj<ReplayService>(['addAction']);
        mockReplayService.addAction.and.callFake((time: number, action: string, payload?: any) => {});
        mockChatService = jasmine.createSpyObj<ChatService>(['deleteMessages']);
        mockChatService.deleteMessages.and.callFake;
        mockChatService.messages = [];
        mockGameService.errorMessage = new EventEmitter();
        mockGameService.successMessage = new EventEmitter();
        mockGameService.hintMessage = new EventEmitter();
        mockCounterService.recordMessage = new EventEmitter();
        mockCounterService.counter = 0;
        mockCounterService.counter2 = 0;
        mockSocket = jasmine.createSpyObj('Socket', ['on', 'emit', 'off']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);
        mockSocket.off.and.returnValue(mockSocket);
        await TestBed.configureTestingModule({
            declarations: [TextBoxComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: SocketService, useValue: mockSocketService },
                { provide: GameService, useValue: mockGameService },
                { provide: ChatService, useValue: mockChatService },
                { provide: CounterService, useValue: mockCounterService },
                { provide: ReplayService, useValue: mockReplayService },
            ],
        }).compileComponents();

        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });

        spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string): void => {
            mockSessionStorage[key] = value;
        });

        mockSessionStorage['userName'] = 'playerTestName';

        fixture = TestBed.createComponent(TextBoxComponent);
        mockSocketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        mockChatService = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
        mockCounterService = TestBed.inject(CounterService) as jasmine.SpyObj<CounterService>;
        mockReplayService = TestBed.inject(ReplayService) as jasmine.SpyObj<ReplayService>;
        component = fixture.componentInstance;
        mockSocketService.socket = mockSocket;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set userName to name stored in sessionStorage', () => {
        component.ngOnInit();
        expect(component.userName).toBe('playerTestName');
    });

    it('should set userName to name stored in sessionStorage', () => {
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

    it('should call addOpponentMessage if name emitted by "incoming-player-message" is different than userName', () => {
        mockSessionStorage['userName'] = 'player2';
        component.userName = 'player2';
        component.gameMode = '1v1';
        const messageInfo = { name: 'player1', message: 'Hello World' };
        mockSocket.on.withArgs('incoming-player-message', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(messageInfo);
            return mockSocket;
        });
        const addOpponentMessageSpy = spyOn(component, 'addOpponentMessage');
        component.ngOnInit();
        mockSocket.emit('incoming-player-message');
        expect(addOpponentMessageSpy).toHaveBeenCalledWith(messageInfo.message);
    });

    it('should call writeQuitMessage() when gameMode is not solo and "player-quit-game" event is emitted', () => {
        component.gameMode = '1v1';
        mockSessionStorage['joiningPlayer'] = 'testJoinPlayer';
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
        mockSessionStorage['joiningPlayer'] = 'testJoinPlayer';
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
        mockSessionStorage['joiningPlayer'] = 'testJoinPlayer';
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
        mockSessionStorage['joiningPlayer'] = 'testJoinPlayer';
        component.ngOnInit();
        mockGameService.errorMessage.next('error-message');
        expect(mockSocketService.sendPlayerError).toHaveBeenCalledWith(component.userName);
    });

    it('should call socketService.sendPlayerSuccess() with userName when gameService successMessage event is emitted in 1v1 mode', () => {
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['joiningPlayer'] = 'testJoinPlayer';
        component.gameMode = '1v1';
        component.ngOnInit();
        mockGameService.successMessage.next('success-message');
        expect(mockSocketService.sendPlayerSuccess).toHaveBeenCalledWith(component.userName);
    });

    it('should call writeErrorMessage() with userName when gameService errorMessage event is emitted in solo mode', () => {
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['joiningPlayer'] = 'testJoinPlayer';
        component.gameMode = 'solo';
        const writeErrorMessageSpy = spyOn(component, 'writeErrorMessage');
        component.ngOnInit();
        mockGameService.errorMessage.next('error-message');
        expect(writeErrorMessageSpy).toHaveBeenCalledWith(component.userName);
    });

    it('should socketService.sendPlayerMessage with userName and messageText when sendMessage is called', () => {
        component.messageText = 'test message';
        component.sendMessage();
        expect(mockSocketService.sendPlayerMessage).toHaveBeenCalled();
    });

    it('should not socketService.sendPlayerMessage with userName and messageText when sendMessage is called with empty string', () => {
        component.messageText = '';
        component.sendMessage();
        expect(mockSocketService.sendPlayerMessage).toHaveBeenCalledTimes(0);
    });

    it('should call writeNewRecordMessage with right parameters when new-record event is emitted in solo', () => {
        component.gameMode = 'solo';
        const newRecordInfo = { name: 'player1', position: '1ere', title: 'game 1', mode: '1v1' };
        mockSessionStorage['joiningPlayer'] = 'testJoinPlayer';
        mockSocket.on.withArgs('new-record', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(newRecordInfo);
            return mockSocket;
        });
        const writeNewRecordMessageSpy = spyOn(component, 'writeNewRecordMessage').and.callFake(
            (name: string, position: string, title: string, mode: string) => {},
        );
        component.ngOnInit();
        mockSocket.emit('new-record');
        expect(writeNewRecordMessageSpy).toHaveBeenCalledWith(newRecordInfo.name, newRecordInfo.position, newRecordInfo.title, newRecordInfo.mode);
    });

    it('should call writeNewRecordMessage with right parameters when new-record event is emitted in 1v1', () => {
        component.gameMode = '1v1';
        const newRecordInfo = { name: 'player1', position: '1ere', title: 'game 1', mode: '1v1' };
        mockSessionStorage['joiningPlayer'] = 'testJoinPlayer';
        mockSocket.on.withArgs('new-record', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(newRecordInfo);
            return mockSocket;
        });
        const writeNewRecordMessageSpy = spyOn(component, 'writeNewRecordMessage').and.callFake(
            (name: string, position: string, title: string, mode: string) => {},
        );
        component.ngOnInit();
        mockSocket.emit('new-record');
        expect(writeNewRecordMessageSpy).toHaveBeenCalledWith(newRecordInfo.name, newRecordInfo.position, newRecordInfo.title, newRecordInfo.mode);
    });

    it('should call socketService.sendNewRecord() with userName if we get a new record in solo', () => {
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['joiningPlayer'] = 'testJoinPlayer';
        component.gameMode = 'solo';
        component.gameTitle = 'game1';
        component.userName = 'player1';
        mockCounterService.counter = 5;
        mockCounterService.counter2 = 2;
        mockSocketService.sendNewRecord.and.callFake((name: string, position: string, gameTitle: string, gameMode: string) => {});

        component.ngOnInit();
        mockCounterService.recordMessage.next('1ère');
        expect(mockSocketService.sendNewRecord).toHaveBeenCalledWith(component.userName, '1ère', component.gameTitle, component.gameMode);
    });

    it('should call socketService.sendNewRecord() with userName if we win and get a new record in 1v1', () => {
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['joiningPlayer'] = 'testJoinPlayer';
        component.gameMode = '1v1';
        component.gameTitle = 'game1';
        component.userName = 'player1';
        mockCounterService.counter = 5;
        mockCounterService.counter2 = 2;
        mockSocketService.sendNewRecord.and.callFake((name: string, position: string, gameTitle: string, gameMode: string) => {});

        component.ngOnInit();
        mockCounterService.recordMessage.next('1ère');
        expect(mockSocketService.sendNewRecord).toHaveBeenCalledWith(component.userName, '1ère', component.gameTitle, component.gameMode);
    });

    it('should call socketService.sendNewRecord() with opponentName if opponent wins and gets a new record in 1v1', () => {
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['joiningPlayer'] = 'testJoinPlayer';
        component.gameMode = '1v1';
        component.gameTitle = 'game1';
        component.opponentName = 'player2';
        mockCounterService.counter = 2;
        mockCounterService.counter2 = 5;
        mockSocketService.sendNewRecord.and.callFake((name: string, position: string, gameTitle: string, gameMode: string) => {});

        component.ngOnInit();
        mockCounterService.recordMessage.next('1ère');
        expect(mockSocketService.sendNewRecord).toHaveBeenCalledWith(component.opponentName, '1ère', component.gameTitle, component.gameMode);
    });

    it('should call writeSuccessMessage with userName when successMessage event is emitted and not in 1v1 mode', () => {
        mockSessionStorage['userName'] = 'player1';
        component.gameMode = 'solo';
        const writeSuccessMessageSpy = spyOn(component, 'writeSuccessMessage').and.callFake((name: string) => {});

        component.ngOnInit();
        mockGameService.successMessage.next('success-message');
        expect(writeSuccessMessageSpy).toHaveBeenCalledWith(component.userName);
    });

    it('should call writeHintMessage with userName when successMessage event is emitted', () => {
        mockSessionStorage['userName'] = 'player1';
        component.gameMode = 'solo';
        const writeHintMessageSpy = spyOn(component, 'writeHintMessage').and.callFake(() => {});

        component.ngOnInit();
        mockGameService.hintMessage.next('hint-message');
        expect(writeHintMessageSpy).toHaveBeenCalled();
    });

    it('should push Message, add replayAction and scrollMessageArea when addOpponentMessage is called', () => {
        const text = 'Hello';
        mockChatService.messages = [];
        component.gameMode = '1v1';
        mockGameService.time = 3;
        spyOn(component, 'getTimestamp').and.returnValue('123');

        const message: Message = {
            type: 'opponent',
            timestamp: '123',
            text: 'Hello',
        };
        const scrollMessageAreaSpy = spyOn(component, 'scrollMessageArea').and.callFake(() => {});

        component.addOpponentMessage(text);
        expect(mockChatService.messages.length).toEqual(1);
        expect(mockReplayService.addAction).toHaveBeenCalledWith(mockGameService.time, 'message', message);
        expect(scrollMessageAreaSpy).toHaveBeenCalled();
    });

    it('should push Message, add replayAction and scrollMessageArea when addSelfMessage is called', () => {
        const text = 'Hello';
        mockChatService.messages = [];
        component.gameMode = '1v1';
        mockGameService.time = 3;
        spyOn(component, 'getTimestamp').and.returnValue('123');

        const message: Message = {
            type: 'self',
            timestamp: '',
            text: 'Hello',
        };
        const scrollMessageAreaSpy = spyOn(component, 'scrollMessageArea').and.callFake(() => {});

        component.addSelfMessage(text);
        expect(mockChatService.messages.length).toEqual(1);
        expect(mockReplayService.addAction).toHaveBeenCalledWith(mockGameService.time, 'message', message);
        expect(scrollMessageAreaSpy).toHaveBeenCalled();
    });

    it('should call addSystem message with correct message when writeQuitMessage is called', () => {
        mockChatService.messages = [];
        component.gameMode = '1v1';
        component.opponentName = 'player2';
        mockGameService.time = 3;
        spyOn(component, 'getTimestamp').and.returnValue('123');

        const systemMessage = `123 - player2 a quitté la partie.`;
        const addSystemMessageSpy = spyOn(component, 'addSystemMessage').and.callFake((systemMessage: string) => {});

        component.writeQuitMessage();
        expect(addSystemMessageSpy).toHaveBeenCalledWith(systemMessage);
    });

    it('should call addSystem message with correct message when writeErrorMessage is called in 1v1', () => {
        mockChatService.messages = [];
        component.gameMode = '1v1';
        const name = 'player2';
        mockGameService.time = 3;
        spyOn(component, 'getTimestamp').and.returnValue('123');

        const systemMessage = `123 - Erreur par player2`;
        const addSystemMessageSpy = spyOn(component, 'addSystemMessage').and.callFake((systemMessage: string) => {});

        component.writeErrorMessage(name);
        expect(addSystemMessageSpy).toHaveBeenCalledWith(systemMessage);
    });

    it('should call addSystem message with correct message when writeErrorMessage is called in solo', () => {
        mockChatService.messages = [];
        component.gameMode = 'solo';
        const name = 'player2';
        spyOn(component, 'getTimestamp').and.returnValue('123');

        const systemMessage = `123 - Erreur`;
        const addSystemMessageSpy = spyOn(component, 'addSystemMessage').and.callFake((systemMessage: string) => {});

        component.writeErrorMessage(name);
        expect(addSystemMessageSpy).toHaveBeenCalledWith(systemMessage);
    });

    it('should call addSystem message with correct message when writeSuccessMessage is called in 1v1', () => {
        mockChatService.messages = [];
        component.gameMode = '1v1';
        const name = 'player2';
        spyOn(component, 'getTimestamp').and.returnValue('123');

        const systemMessage = `123 - Différence trouvée par player2`;
        const addSystemMessageSpy = spyOn(component, 'addSystemMessage').and.callFake((systemMessage: string) => {});

        component.writeSuccessMessage(name);
        expect(addSystemMessageSpy).toHaveBeenCalledWith(systemMessage);
    });

    it('should call addSystem message with correct message when writeSuccessMessage is called in solo', () => {
        mockChatService.messages = [];
        component.gameMode = 'solo';
        const name = 'player2';
        spyOn(component, 'getTimestamp').and.returnValue('123');

        const systemMessage = `123 - Différence trouvée`;
        const addSystemMessageSpy = spyOn(component, 'addSystemMessage').and.callFake((systemMessage: string) => {});

        component.writeSuccessMessage(name);
        expect(addSystemMessageSpy).toHaveBeenCalledWith(systemMessage);
    });

    it('should call addSystem message with correct message when writeHintMessage is called', () => {
        mockChatService.messages = [];
        component.gameMode = 'solo';
        spyOn(component, 'getTimestamp').and.returnValue('123');

        const systemMessage = `123 -  Indice utilisé`;
        const addSystemMessageSpy = spyOn(component, 'addSystemMessage').and.callFake((systemMessage: string) => {});

        component.writeHintMessage();
        expect(addSystemMessageSpy).toHaveBeenCalledWith(systemMessage);
    });

    it('should call addSystem message with correct message when writeNewRecordMessage is called', () => {
        mockChatService.messages = [];
        const name = 'player1';
        const position = '1ère';
        const title = 'Game1';
        const mode = 'solo';
        component.gameMode = 'solo';
        spyOn(component, 'getTimestamp').and.returnValue('123');

        const systemMessage = `123 - player1 obtient la 1ère place dans les meilleurs temps du jeu Game1 en solo`;
        const addSystemMessageSpy = spyOn(component, 'addSystemMessage').and.callFake((systemMessage: string) => {});

        component.writeNewRecordMessage(name, position, title, mode);
        expect(addSystemMessageSpy).toHaveBeenCalledWith(systemMessage);
    });
});
