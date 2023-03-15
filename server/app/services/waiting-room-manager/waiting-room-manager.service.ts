import { TimerGateway } from '@app/gateways/timer/timer.gateway';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class WaitingRoomManagerService {
    constructor(@Inject(forwardRef(() => TimerGateway)) private readonly timerGateway: TimerGateway) {}

    private openLobbies = new Map<string, string>();

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
}
