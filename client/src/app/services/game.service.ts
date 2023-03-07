import { Injectable } from '@angular/core';
import { ClickResponse } from '@app/classes/click-response';
import { Coords } from '@app/classes/coords';
import { MouseButton } from '@app/classes/mouse-button';
import { CommunicationService } from './communication.service';
import { CounterService } from './counter.service';

const BIGTIMEOUT = 2000;
const SMALLTIMOUT = 1000;
const SMALLINTERVAL = 100;
@Injectable({
    providedIn: 'root',
})

export class GameService {

    errorSound = new Audio('../../assets/erreur.mp3');
    successSound = new Audio('../../assets/success.mp3');
    private isClickDisabled = false;
    private differenceFound: number[] = [];
    private gameName: string = '';

    constructor(private communicationService: CommunicationService, private counterService: CounterService) {
        this.gameName = (localStorage.getItem('gameTitle') as string) || '';
    }


    flashPixel(coords: Coords[], ctxLeft: CanvasRenderingContext2D, ctxRight: CanvasRenderingContext2D) {
        const on = true;
        for (let i = 0; i < coords.length; i++) {
            setInterval(() => {
                if (ctxRight) {
                    ctxRight.fillStyle = on ? 'white' : 'black';
                    ctxRight.fillRect(coords[i].x, coords[i].y, 1, 1);
                    on !== on;
                }
            }, SMALLINTERVAL);
        }
    }
    
    updateImages(coords: Coords[], ctxLeft: CanvasRenderingContext2D, ctxRight: CanvasRenderingContext2D) {
        for (let i = 0; i < coords.length; i++) {
            const dataLeft = ctxLeft?.getImageData(coords[i].x, coords[i].y, 1, 1) as ImageData;
            const pixel = dataLeft.data;
            const imageData = new ImageData(pixel, 1, 1);
            ctxRight?.putImageData(imageData, coords[i].x, coords[i].y);
        }
    }

    async checkClick(event: MouseEvent, counter : CounterService, ctxLeft: CanvasRenderingContext2D, ctxRight: CanvasRenderingContext2D) {
        if (!this.isClickDisabled && event?.button === MouseButton.Left) {
            const clickedCanvas = event.target as HTMLCanvasElement;
            const context = clickedCanvas.getContext('2d') as CanvasRenderingContext2D;

            const mousePosition = { x: event.offsetX, y: event.offsetY };

            this.communicationService.sendPosition(this.gameName, mousePosition).subscribe((response: ClickResponse) => {
                if (response.isDifference && !this.differenceFound.includes(response.differenceNumber)) {
                    this.differenceFound.push(response.differenceNumber);
                    context.fillStyle = 'green';
                    context.font = '20px Arial';
                    context.fillText('Trouvé', mousePosition.x, mousePosition.y);
                    this.successSound.currentTime = 0;
                    this.counterService.incrementCounter().subscribe();
                    this.successSound.play();
                    // this.flashPixel(response.coords);
                    setTimeout(() => {
                        context?.clearRect(0, 0, clickedCanvas.width, clickedCanvas.height);
                        this.updateImages(response.coords, ctxLeft, ctxRight);
                    }, BIGTIMEOUT);
                } else {
                    context.fillStyle = 'red';
                    context.font = '20px Arial';
                    context.fillText('Erreur', mousePosition.x, mousePosition.y);
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
