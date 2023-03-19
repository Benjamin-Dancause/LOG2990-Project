import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { CounterService } from '@app/services/counter.service';
import { GameService } from '@app/services/game.service';
import { InputService } from '@app/services/input.service';
import { SocketService } from '@app/services/socket.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 640;
export const DEFAULT_HEIGHT = 480;

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
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
    @ViewChild('gridCanvasLeft', { static: false }) private canvasLeft!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasRight', { static: false }) private canvasRight!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasLeftTop', { static: false }) private canvasLeftTop!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasRightTop', { static: false }) private canvasRightTop!: ElementRef<HTMLCanvasElement>;

    errorSound = new Audio('../../assets/erreur.mp3');
    successSound = new Audio('../../assets/success.mp3');
    isCheatEnabled = false;

    private readonly serverURL: string = environment.serverUrl;
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    private imageLeftStr: string = '';
    private imageRightStr: string = '';
    private ctxLeft: CanvasRenderingContext2D | null = null;
    private ctxRight: CanvasRenderingContext2D | null = null;
    private ctxLeftTop: CanvasRenderingContext2D | null = null;
    private ctxRightTop: CanvasRenderingContext2D | null = null;
    private gameName: string = '';
    private mouseDownSubscription: Subscription;
    private keyDownSubscription: Subscription;
    private player1: boolean = true;

    constructor(
        private counterService: CounterService,
        private communicationService: CommunicationService,
        private input: InputService,
        private game: GameService,
        private socketService: SocketService,
    ) {
        this.gameName = sessionStorage.getItem('gameTitle') as string;
        this.game.setGameName();
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    async initCanvases() {
        const img1 = new Image();
        img1.setAttribute('crossOrigin', 'anonymous');
        img1.src = this.imageLeftStr;
        img1.onload = () => {
            this.ctxLeft = this.canvasLeft.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.ctxLeft?.drawImage(img1, 0, 0);
            this.game.getContexts(this.ctxLeft);
        };
        const img2 = new Image();
        img2.setAttribute('crossOrigin', 'anonymous');
        img2.src = this.imageRightStr;
        img2.onload = () => {
            this.ctxRight = this.canvasRight.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.ctxRight?.drawImage(img2, 0, 0);
            this.game.getContexts(this.ctxRight);
        };
        this.ctxLeftTop = this.canvasLeftTop.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.ctxRightTop = this.canvasRightTop.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.game.getContexts(this.ctxLeftTop);
        this.game.getContexts(this.ctxRightTop);
    }

    ngAfterViewInit(): void {
        this.socketService.socket.on('player-info', (gameplayInfo: OneVsOneGameplayInfo) => {
            //this.roomId = gameplayInfo.roomId;
            this.player1 = gameplayInfo.player1;
            this.socketService.initOneVsOneComponents(this.player1);
        });

        if ((sessionStorage.getItem('gameMode') as string) === '1v1') {
            this.socketService.assignPlayerInfo(this.gameName);
        }

        this.communicationService.getGameByName(this.gameName).subscribe((game) => {
            this.imageLeftStr = this.serverURL + '/' + game.images[0];
            this.imageRightStr = this.serverURL + '/' + game.images[1];
            this.initCanvases();
        });

        this.mouseDownSubscription = this.input.mouseDown$.subscribe((event) => {
            const ctxs = [this.ctxLeft, this.ctxRight, this.ctxLeftTop, this.ctxRightTop] as CanvasRenderingContext2D[];
            this.game.checkClick(event, this.counterService, ctxs);
        });

        this.keyDownSubscription = this.input.keyDown$.subscribe((event) => {
            if (event === 't') {
                this.isCheatEnabled = !this.isCheatEnabled;
                const ctxs = [this.ctxLeft, this.ctxRight, this.ctxLeftTop, this.ctxRightTop] as CanvasRenderingContext2D[];
                this.game.cheatMode(ctxs);
            }
        });
    }

    ngOnDestroy(): void {
        this.mouseDownSubscription.unsubscribe();
        this.keyDownSubscription.unsubscribe();
        this.game.clearContexts();
        this.game.clearDifferenceArray();
    }
}
