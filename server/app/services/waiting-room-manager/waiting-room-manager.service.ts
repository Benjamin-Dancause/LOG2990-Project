import { TimerGateway } from '@app/gateways/timer/timer.gateway';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

interface GameInfo {
    gameMaster: string;
    joiningPlayer: string;
    gameTitle: string;
}

@Injectable()
export class WaitingRoomManagerService {
    constructor(@Inject(forwardRef(() => TimerGateway)) private readonly timerGateway: TimerGateway) {}

    private openLobbies = new Map<string, string>();
    private lobbyGameInfo = new Map<string, GameInfo>();

    isOtherLobby(gameTitle: string): boolean {
        if (!this.openLobbies.get(gameTitle)) {
            return false;
        }
        return true;
    }

    createLobby(gameTitle: string, roomId: string): void {
        this.openLobbies.set(gameTitle, roomId);
    }

    joinLobby(gameTitle: string) {
        const roomId = this.openLobbies.get(gameTitle);
        this.openLobbies.delete(gameTitle);
        return roomId;
    }

    initializeGameInfo(gameTitle: string, gameMaster: string): void {
        const gameInfo: GameInfo = {
            gameMaster: gameMaster,
            joiningPlayer: 'none',
            gameTitle: gameTitle,
        };
        this.lobbyGameInfo.set(gameTitle, gameInfo);
    }

    completeGameInfo(gameTitle: string, joiningPlayer: string): GameInfo {
        if (this.lobbyGameInfo.get(gameTitle)) {
            const initialGameInfo: GameInfo = this.lobbyGameInfo.get(gameTitle);
            const completeGameInfo: GameInfo = {
                gameMaster: initialGameInfo.gameMaster,
                joiningPlayer: joiningPlayer,
                gameTitle: initialGameInfo.gameTitle,
            };
            return completeGameInfo;
        }
    }
    //Todo switch roomId for gameTitle
    deleteLobbyInfo(roomId: string) {
        this.openLobbies.delete(roomId);
        this.lobbyGameInfo.delete(roomId);
        console.log("INFO FOR LOBBY HAS BEEN WIPED : WAITING_ROOM_MANAGER");
    }

    getGameplayInfo(gameTitle: string): GameInfo {
        const gameInfo: GameInfo = this.lobbyGameInfo.get(gameTitle);
        return gameInfo;
    }
}
