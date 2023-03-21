import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class InputService {
    private subscriptions: Subscription[] = [];
    private keyDownSubject = new Subject<string>();
    private keyUpSubject = new Subject<string>();
    private mouseDownSubject = new Subject<MouseEvent>();
    private mouseUpSubject = new Subject<MouseEvent>();

    public keyDown$ = this.keyDownSubject.asObservable();
    public keyUp$ = this.keyUpSubject.asObservable();
    public mouseDown$ = this.mouseDownSubject.asObservable();
    public mouseUp$ = this.mouseUpSubject.asObservable();

    constructor() {
        this.subscriptions.push(this.keyDown$.subscribe());
        this.subscriptions.push(this.keyUp$.subscribe());
        this.subscriptions.push(this.mouseDown$.subscribe());
        this.subscriptions.push(this.mouseUp$.subscribe());

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

    destroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
