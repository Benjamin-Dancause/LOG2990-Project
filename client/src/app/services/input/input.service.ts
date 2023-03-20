import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class InputService {
    private keyDownSubject = new Subject<string>();
    private keyUpSubject = new Subject<string>();
    private mouseDownSubject = new Subject<MouseEvent>();
    private mouseUpSubject = new Subject<MouseEvent>();

    public keyDown$ = this.keyDownSubject.asObservable();
    public keyUp$ = this.keyUpSubject.asObservable();
    public mouseDown$ = this.mouseDownSubject.asObservable();
    public mouseUp$ = this.mouseUpSubject.asObservable();

    constructor() {
        document.addEventListener('keydown', (event) => {
            this.keyDownSubject.next(event.key);
        });

        document.addEventListener('keyup', (event) => {
            this.keyUpSubject.next(event.key);
        });

        document.addEventListener('mousedown', (event) => {
            if (event.button === 0 && event.target instanceof HTMLCanvasElement) {
                this.mouseDownSubject.next(event);
            }
        });

        document.addEventListener('mouseup', (event) => {
            this.mouseUpSubject.next(event);
        });
    }
}
