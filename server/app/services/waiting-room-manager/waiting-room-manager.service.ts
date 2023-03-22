import { ClassicModeGateway } from '@app/gateways/timer/classic-mode.gateway';
import { GameInfo } from '@common/game-interfaces';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class WaitingRoomManagerService {
    private openLobbies = new Map<string, string>();
    private lobbyGameInfo = new Map<string, GameInfo>();
    constructor(@Inject(forwardRef(() => ClassicModeGateway)) private readonly classicModeGateway: ClassicModeGateway) {}

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
            gameMaster,
            joiningPlayer: 'none',
            gameTitle,
        };
        this.lobbyGameInfo.set(gameTitle, gameInfo);
    }

    completeGameInfo(gameTitle: string, joiningPlayer: string): GameInfo {
        if (this.lobbyGameInfo.get(gameTitle)) {
            const initialGameInfo: GameInfo = this.lobbyGameInfo.get(gameTitle);
            const completeGameInfo: GameInfo = {
                gameMaster: initialGameInfo.gameMaster,
                joiningPlayer,
                gameTitle: initialGameInfo.gameTitle,
            };
            return completeGameInfo;
        }
    }
    // Todo switch roomId for gameTitle
    deleteLobbyInfo(roomId: string) {
        this.openLobbies.delete(roomId);
        this.lobbyGameInfo.delete(roomId);
    }

    getGameplayInfo(gameTitle: string): GameInfo {
        const gameInfo: GameInfo = this.lobbyGameInfo.get(gameTitle);
        return gameInfo;
    }
}
