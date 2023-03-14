import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { CounterService } from '@app/services/counter.service';
import { DrawService } from '@app/services/draw.service';
import { GameService } from '@app/services/game.service';
import { InputService } from '@app/services/input.service';
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

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
    providers: [CounterService, DrawService],
})
export class PlayAreaComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('gridCanvasLeft', { static: false }) private canvasLeft!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasRight', { static: false }) private canvasRight!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasLeftTop', { static: false }) private canvasLeftTop!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasRightTop', { static: false }) private canvasRightTop!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: true }) private canvas2!: ElementRef<HTMLCanvasElement>;
    errorSound = new Audio('../../assets/erreur.mp3');
    successSound = new Audio('../../assets/success.mp3');

    cheatMode = false;

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
    constructor(
        private counterService: CounterService,
        private communicationService: CommunicationService,
        private input: InputService,
        private game: GameService,
    ) {}

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    async initCanvases() {
        const img1 = new Image();
        img1.src = this.imageLeftStr;
        img1.setAttribute('crossOrigin', 'anonymous');
        img1.onload = () => {
            this.ctxLeft = this.canvasLeft.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.ctxLeft?.drawImage(img1, 0, 0);
        };
        const img2 = new Image();
        img2.src = this.imageRightStr;
        img2.setAttribute('crossOrigin', 'anonymous');
        img2.onload = () => {
            this.ctxRight = this.canvasRight.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.ctxRight?.drawImage(img2, 0, 0);
        };
        this.ctxLeftTop = this.canvasLeftTop.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.ctxRightTop = this.canvasRightTop.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    ngAfterViewInit(): void {
        this.gameName = (localStorage.getItem('gameTitle') as string) || '';
        this.communicationService.getGameByName(this.gameName).subscribe((game) => {
            this.imageLeftStr = this.serverURL + '/' + game.images[0];
            this.imageRightStr = this.serverURL + '/' + game.images[1];
            this.initCanvases();
        });

        this.mouseDownSubscription = this.input.mouseDown$.subscribe((event) => {
            const ctxs = [this.ctxLeft, this.ctxRight, this.ctxLeftTop, this.ctxRightTop] as CanvasRenderingContext2D[];
            this.game.checkClick(event, this.counterService, ctxs);
        });
    }

    ngOnInit(): void {
        document.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    ngOnDestroy(): void {
        this.mouseDownSubscription.unsubscribe();
        this.game.clearDifferenceArray();
        document.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 't') {
            this.cheatMode = !this.cheatMode;
            const context = this.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            context.font = '30px Arial';
            context.fillStyle = 'red';

            context.textBaseline = 'middle';
            context.clearRect(0, this.canvas2.nativeElement.height - 30, this.canvas2.nativeElement.width, 30);
            if (this.cheatMode) {
                context.fillText('Triche', this.canvas2.nativeElement.width / 2, this.canvas2.nativeElement.height - 15);
            }
        }
    }
}
