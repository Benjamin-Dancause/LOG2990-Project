import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';

import { InputService } from './input.service';

describe('InputService', () => {
    let service: InputService;
    let canvas: HTMLCanvasElement;

    beforeEach(() => {
        service = new InputService();
        canvas = CanvasTestHelper.createCanvas(1, 1);
        TestBed.configureTestingModule({});
        service = TestBed.inject(InputService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit key down events', (done) => {
        const testKey = 'a';

        const subscription = service.keyDown$.subscribe((key) => {
            expect(key).toEqual(testKey);
            done();
            subscription.unsubscribe();
        });

        const keyDownEvent = new KeyboardEvent('keydown', { key: testKey });
        document.dispatchEvent(keyDownEvent);
    });

    it('should emit key up events', (done) => {
        const testKey = 'a';

        const subscription = service.keyUp$.subscribe((key) => {
            expect(key).toEqual(testKey);
            done();
            subscription.unsubscribe();
        });

        const keyUpEvent = new KeyboardEvent('keyup', { key: testKey });
        document.dispatchEvent(keyUpEvent);
    });

    it('should emit mouse down events', (done) => {
        const eventArgs: MouseEventInit = {
            clientX: 100,
            clientY: 200,
            bubbles: true,
            cancelable: true,
            view: window,
        };

        const testEvent = new MouseEvent('mousedown', eventArgs);
        Object.defineProperty(testEvent, 'target', { value: canvas });

        const subscription = service.mouseDown$.subscribe((event) => {
            expect(event).toEqual(testEvent);
            done();
            subscription.unsubscribe();
        });

        document.dispatchEvent(testEvent);
    });

    it('should emit mouse up events', (done) => {
        const testEvent = new MouseEvent('mouseup');

        const subscription = service.mouseUp$.subscribe((event) => {
            expect(event).toEqual(testEvent);
            done();
            subscription.unsubscribe();
        });

        document.dispatchEvent(testEvent);
    });
});
