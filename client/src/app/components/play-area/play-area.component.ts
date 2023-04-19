import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CanvasReplayService } from '@app/services/canvas-replay/canvas-replay.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { CounterService } from '@app/services/counter/counter.service';
import { GameService } from '@app/services/game/game.service';
import { SocketService } from '@app/services/socket/socket.service';
import { CANVAS } from '@common/constants';
import { environment } from 'src/environments/environment';

interface OneVsOneGameplayInfo {
    gameTitle: string;
    roomId: string;
    player1: boolean;
}

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @ViewChild('gridCanvasLeft', { static: false }) canvasLeft!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasRight', { static: false }) canvasRight!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasLeftTop', { static: false }) canvasLeftTop!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasRightTop', { static: false }) canvasRightTop!: ElementRef<HTMLCanvasElement>;

    errorSound = new Audio('../../assets/erreur.mp3');
    successSound = new Audio('../../assets/success.mp3');
    isHintModeEnabled = false;
    isCheatEnabled = false;

    imageLeftStr: string = '';
    imageRightStr: string = '';
    ctxLeft: CanvasRenderingContext2D | null = null;
    ctxRight: CanvasRenderingContext2D | null = null;
    ctxLeftTop: CanvasRenderingContext2D | null = null;
    ctxRightTop: CanvasRenderingContext2D | null = null;
    gameName: string = '';
    public replay: boolean = false;
    player1: boolean = true;
    opponent: boolean = false;

    private readonly serverURL: string = environment.serverUrl;
    private canvasSize = { x: CANVAS.WIDTH, y: CANVAS.HEIGHT };

    private hintModeCount = 0;
    private hintModeTimeoutId: ReturnType<typeof setTimeout> | null = null;

    // eslint-disable-next-line max-params
    constructor(
        public counterService: CounterService,
        public communicationService: CommunicationService,
        public game: GameService,
        public socketService: SocketService,
        public canvasReplay: CanvasReplayService,
    ) {
        this.gameName = sessionStorage.getItem('gameTitle') as string;
        this.replay = false;
        this.game.setGameName();
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        if (event.target instanceof HTMLCanvasElement) {
            this.game.checkClick(event);
        }
    }
    @HostListener('document:keydown.t', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (event.target instanceof HTMLInputElement || this.replay) {
            return;
        }
        this.isCheatEnabled = !this.isCheatEnabled;
        const ctxs = [this.ctxLeft, this.ctxRight, this.ctxLeftTop, this.ctxRightTop] as CanvasRenderingContext2D[];
        this.game.cheatMode(ctxs);
    }

    @HostListener('document:keydown.i', ['$event'])
    onHintKeyDown(event: KeyboardEvent) {
        if (event.target instanceof HTMLInputElement || this.opponent || this.replay) {
            return;
        }

        if (this.hintModeTimeoutId !== null) {
            clearTimeout(this.hintModeTimeoutId);
        }

        switch (this.hintModeCount) {
            case 0: {
                const ctxs = [this.ctxLeft, this.ctxRight, this.ctxLeftTop, this.ctxRightTop] as CanvasRenderingContext2D[];
                this.game.hintMode1(ctxs);
                this.hintModeCount++;
                break;
            }
            case 1: {
                const ctxs = [this.ctxLeft, this.ctxRight, this.ctxLeftTop, this.ctxRightTop] as CanvasRenderingContext2D[];
                this.game.hintMode2(ctxs);
                this.hintModeCount++;
                break;
            }
            case 2: {
                const ctxs = [this.ctxLeft, this.ctxRight, this.ctxLeftTop, this.ctxRightTop] as CanvasRenderingContext2D[];
                this.game.hintMode3(ctxs);
                this.hintModeCount++;
                break;
            }
        }
    }

    async initCanvases() {
        this.game.clearContexts();
        const img1 = new Image();
        img1.setAttribute('crossOrigin', 'anonymous');
        img1.src = this.imageLeftStr;
        img1.onload = () => {
            this.ctxLeft = this.canvasLeft.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.ctxLeft?.drawImage(img1, 0, 0);
            this.game.getContexts(this.ctxLeft);
            this.canvasReplay.getContexts(this.ctxLeft);
        };
        const img2 = new Image();
        img2.setAttribute('crossOrigin', 'anonymous');
        img2.src = this.imageRightStr;
        img2.onload = () => {
            this.ctxRight = this.canvasRight.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.ctxRight?.drawImage(img2, 0, 0);
            this.game.getContexts(this.ctxRight);
            this.canvasReplay.getContexts(this.ctxRight);
        };
        this.ctxLeftTop = this.canvasLeftTop.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.ctxRightTop = this.canvasRightTop.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.game.getContexts(this.ctxLeftTop);
        this.game.getContexts(this.ctxRightTop);
        this.canvasReplay.getContexts(this.ctxLeftTop);
        this.canvasReplay.getContexts(this.ctxRightTop);
    }

    ngAfterViewInit(): void {
        this.socketService.socket.on('player-info', (gameplayInfo: OneVsOneGameplayInfo) => {
            const gameMode = sessionStorage.getItem('gameMode') as string;
            this.player1 = gameMode === 'tl' ? true : gameplayInfo.player1;
            this.socketService.initOneVsOneComponents(this.player1, gameMode);
        });

        this.socketService.socket.off('switch-images');
        this.socketService.socket.on('switch-images', (newImages: string[]) => {
            this.imageLeftStr = this.serverURL + '/' + newImages[0];
            this.imageRightStr = this.serverURL + '/' + newImages[1];
            this.initCanvases();
        });

        if ((sessionStorage.getItem('gameMode') as string) === '1v1') {
            this.socketService.assignPlayerInfo(this.gameName);
        }
        this.opponent = (sessionStorage.getItem('joiningPlayer') as string) ? true : false;
        this.game.timeUpdater();
    }

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnDestroy(): void {
        this.game.clearContexts();
        this.game.clearDifferenceArray();
        this.game.clearTime();
        this.canvasReplay.clearContexts();
        this.game.resetGameValues();
        this.socketService.disconnectSocket();
    }
}
