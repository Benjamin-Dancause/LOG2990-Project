import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ClickResponse } from '@app/classes/click-response';
import { Vec2 } from '@app/interfaces/vec2';
import { CommunicationService } from '@app/services/communication.service';
import { CounterService } from '@app/services/counter.service';
import { DrawService } from '@app/services/draw.service';

const RECTANGLE_X = 100;
const RECTANGLE_Y = 100;
const RECTANGLE_WIDTH = 100;
const RECTANGLE_HEIGHT = 100;

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
export class PlayAreaComponent implements AfterViewInit {
    @ViewChild('gridCanvas', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;

    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';
    errorSound = new Audio('../../assets/erreur.mp3');
    successSound = new Audio('../../assets/success.mp3');

    private isClickDisabled = false;
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    private rectangleX = RECTANGLE_X;
    private rectangleY = RECTANGLE_Y;
    private rectangleWidth = RECTANGLE_WIDTH;
    private rectangleHeight = RECTANGLE_HEIGHT;
    private differenceFound : number[] = [];
    constructor(private readonly drawService: DrawService, private counterService: CounterService, private communicationService : CommunicationService) {}

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
        // this.drawService.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        // this.drawService.drawGrid();
        // this.drawService.drawWord('Différence');
        // this.drawDarkRectangle();
        // this.canvas.nativeElement.focus();
        if (this.canvas && this.canvas.nativeElement) {
            this.drawService.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.drawDarkRectangle();
            this.canvas.nativeElement.focus();
        }
    }

    drawDarkRectangle() {
        this.drawService.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.drawService.context.fillRect(this.rectangleX, this.rectangleY, this.rectangleWidth, this.rectangleHeight);
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!

    mouseHitDetect(event: MouseEvent) {
        if (!this.isClickDisabled && event.button === MouseButton.Left) {
            const clickedCanvas = event.target as HTMLCanvasElement;
            const context = clickedCanvas.getContext('2d') as CanvasRenderingContext2D;

            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            
            this.communicationService.sendPosition(0, this.mousePosition).subscribe((response : ClickResponse) => {
                if (response.success && !this.differenceFound.includes(response.differenceNumber)) {
                    this.differenceFound.push(response.differenceNumber);
                    context.fillStyle = 'green';
                    context.font = '20px Arial';
                    context.fillText('Trouvé', this.mousePosition.x, this.mousePosition.y);
                    this.successSound.currentTime = 0;
                    this.counterService.incrementCounter().subscribe();
                    this.successSound.play();
                    setTimeout(() => {
                        context.clearRect(0, 0, clickedCanvas.width, clickedCanvas.height);
                        this.drawService.context.clearRect(this.rectangleX, this.rectangleY, this.rectangleWidth, this.rectangleHeight);
                        this.drawDarkRectangle();
                    }, 1000);
                } else {
                    context.fillStyle = 'red';
                    context.font = '20px Arial';
                    context.fillText('Erreur', this.mousePosition.x, this.mousePosition.y);
                    this.errorSound.currentTime = 0;
                    this.errorSound.play();
                    this.isClickDisabled = true;
                    setTimeout(() => {
                        context.clearRect(0, 0, clickedCanvas.width, clickedCanvas.height);
                        this.drawService.context.clearRect(this.rectangleX, this.rectangleY, this.rectangleWidth, this.rectangleHeight);
                        this.drawDarkRectangle();
                        this.isClickDisabled = false;
                    }, 1000);
                }
            });
        }
    }
}
