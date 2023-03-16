import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ClickResponse } from '@app/classes/click-response';
import { Coords } from '@app/classes/coords';
import { Vec2 } from '@app/interfaces/vec2';
import { CommunicationService } from '@app/services/communication.service';
import { CounterService } from '@app/services/counter.service';
import { DifferenceService } from '@app/services/difference.service';
import { WaitingRoomService } from '@app/services/waiting-room.service';
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

const SMALLINTERVAL = 100;
const BIGTIMEOUT = 2000;
const SMALLTIMOUT = 1000;

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @ViewChild('gridCanvasLeft', { static: false }) private canvasLeft!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasRight', { static: false }) private canvasRight!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasRightTop', { static: false }) private canvasLeftTop!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasLeftTop', { static: false }) private canvasRightTop!: ElementRef<HTMLCanvasElement>;

    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';
    errorSound = new Audio('../../assets/erreur.mp3');
    successSound = new Audio('../../assets/success.mp3');
    difference: DifferenceService;

    private readonly serverURL: string = environment.serverUrl;
    private isClickDisabled = false;
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    private imageLeftStr: string = '';
    private imageRightStr: string = '';
    private ctxLeft: CanvasRenderingContext2D | null = null;
    private ctxRight: CanvasRenderingContext2D | null = null;
    private ctxLeftTop: CanvasRenderingContext2D | null = null;
    private ctxRightTop: CanvasRenderingContext2D | null = null;
    private differenceFound: number[] = [];
    private gameName: string = '';
    private roomId: string = '';
    private player1: boolean = false;
    constructor(
        private counterService: CounterService,
        private communicationService: CommunicationService,
        difference: DifferenceService,
        private waitingRoomService: WaitingRoomService,
    ) {
        this.gameName = sessionStorage.getItem('gameTitle') as string;

        console.log(this.gameName);
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }

    ngAfterViewInit(): void {
        this.waitingRoomService.socket.on('player-info', (gameplayInfo: OneVsOneGameplayInfo) => {
            this.roomId = gameplayInfo.roomId;
            this.player1 = gameplayInfo.player1;
            console.log('Game Title: ' + this.gameName + '\n' + 'RoomId: ' + this.roomId + '\n' + 'Player1 ?: ' + this.player1 + '\n');
            this.waitingRoomService.initOneVsOneComponents();
        });
        this.waitingRoomService.assignPlayerInfo(this.gameName);
        this.communicationService.getGameByName(this.gameName).subscribe((game) => {
            this.imageLeftStr = this.serverURL + '/' + game.images[0];
            this.imageRightStr = this.serverURL + '/' + game.images[1];
            this.initCanvases();
        });
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

    flashPixel(coords: Coords[]) {
        this.ctxRight = this.canvasRight.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const on = true;
        for (let i = 0; i < coords.length; i++) {
            setInterval(() => {
                if (this.ctxRight) {
                    this.ctxRight.fillStyle = on ? 'white' : 'black';
                    this.ctxRight.fillRect(coords[i].x, coords[i].y, 1, 1);
                    on !== on;
                }
            }, SMALLINTERVAL);
        }
    }

    updateImages(coords: Coords[]) {
        for (let i = 0; i < coords.length; i++) {
            const dataLeft = this.ctxLeft?.getImageData(coords[i].x, coords[i].y, 1, 1) as ImageData;
            const pixel = dataLeft.data;
            const imageData = new ImageData(pixel, 1, 1);
            this.ctxRight?.putImageData(imageData, coords[i].x, coords[i].y);
        }
    }
    // TODO : déplacer ceci dans un service de gestion de la souris!

    async mouseHitDetect(event: MouseEvent) {
        if (!this.isClickDisabled && event.button === MouseButton.Left) {
            const clickedCanvas = event.target as HTMLCanvasElement;
            const context = clickedCanvas.getContext('2d') as CanvasRenderingContext2D;

            this.mousePosition = { x: event.offsetX, y: event.offsetY };

            this.communicationService.sendPosition(this.gameName, this.mousePosition).subscribe((response: ClickResponse) => {
                console.log({ response });

                if (response.isDifference && !this.differenceFound.includes(response.differenceNumber)) {
                    this.differenceFound.push(response.differenceNumber);
                    context.fillStyle = 'green';
                    context.font = '20px Arial';
                    context.fillText('Trouvé', this.mousePosition.x, this.mousePosition.y);
                    this.successSound.currentTime = 0;
                    this.counterService.incrementCounter();
                    this.successSound.play();
                    // this.flashPixel(response.coords);
                    setTimeout(() => {
                        this.ctxLeftTop?.clearRect(0, 0, clickedCanvas.width, clickedCanvas.height);
                        this.ctxRightTop?.clearRect(0, 0, clickedCanvas.width, clickedCanvas.height);
                        this.updateImages(response.coords);
                    }, BIGTIMEOUT);
                } else {
                    context.fillStyle = 'red';
                    context.font = '20px Arial';
                    context.fillText('Erreur', this.mousePosition.x, this.mousePosition.y);
                    this.errorSound.currentTime = 0;
                    this.errorSound.play();
                    this.isClickDisabled = true;
                    setTimeout(() => {
                        context.clearRect(0, 0, clickedCanvas.width, clickedCanvas.height);
                        this.isClickDisabled = false;
                    }, SMALLTIMOUT);
                }
            });
        }
    }
}
