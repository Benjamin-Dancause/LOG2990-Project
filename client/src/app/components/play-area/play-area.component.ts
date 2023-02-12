import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
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
})
export class PlayAreaComponent implements AfterViewInit {
    @ViewChild('gridCanvas', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;

    canvas2: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';

    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    private rectangleX = RECTANGLE_X;
    private rectangleY = RECTANGLE_Y;
    private rectangleWidth = RECTANGLE_WIDTH;
    private rectangleHeight = RECTANGLE_HEIGHT;
    constructor(private readonly drawService: DrawService) {}

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
        this.drawService.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        // this.drawService.drawGrid();
        // this.drawService.drawWord('Différence');
        this.drawDarkRectangle();
        this.canvas.nativeElement.focus();
    }

    drawDarkRectangle() {
        this.drawService.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.drawService.context.fillRect(this.rectangleX, this.rectangleY, this.rectangleWidth, this.rectangleHeight);
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            const clickedCanvas = event.target as HTMLCanvasElement;
            const context = clickedCanvas.getContext('2d') as CanvasRenderingContext2D;

            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            if (
                this.mousePosition.x >= this.rectangleX &&
                this.mousePosition.x <= this.rectangleX + this.rectangleWidth &&
                this.mousePosition.y >= this.rectangleY &&
                this.mousePosition.y <= this.rectangleY + this.rectangleHeight
            ) {
                context.fillStyle = 'green';
                context.font = '20px Arial';
                context.fillText('Trouvé', this.mousePosition.x, this.mousePosition.y);
                setTimeout(() => {
                    context.clearRect(this.mousePosition.x, this.mousePosition.y - 20, 100, 20);
                    this.drawService.context.clearRect(this.rectangleX, this.rectangleY, this.rectangleWidth, this.rectangleHeight);
                    this.drawDarkRectangle();
                }, 1500);
            } else {
                context.fillStyle = 'red';
                context.font = '20px Arial';
                context.fillText('Erreur', this.mousePosition.x, this.mousePosition.y);
                setTimeout(() => {
                    context.clearRect(this.mousePosition.x, this.mousePosition.y - 20, 100, 20);
                    this.drawService.context.clearRect(this.rectangleX, this.rectangleY, this.rectangleWidth, this.rectangleHeight);
                    this.drawDarkRectangle();
                }, 1500);
            }
        }
    }
}
