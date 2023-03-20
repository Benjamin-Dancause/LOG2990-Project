import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';

import { InputService } from './input.service';

fdescribe('InputService', () => {
    let service: InputService;
    let canvas: HTMLCanvasElement;

    beforeEach(() => {
        canvas = CanvasTestHelper.createCanvas(1, 1);
        TestBed.configureTestingModule({});
        service = TestBed.inject(InputService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('should use the keyDownSubject on keydown', () => {
    // });
    // it('should use the keyUpSubject on keyup', () => {});
    // it('should use the mouseDownSubject on mouse down', () => {});
    // it('should use the mouseUpSubject on mouse up', () => {});
    it('should emit key down events', (done) => {
        const testKey = 'a';

        service.keyDown$.subscribe((key) => {
            expect(key).toEqual(testKey);
            done();
        });

        const keyDownEvent = new KeyboardEvent('keydown', { key: testKey });
        document.dispatchEvent(keyDownEvent);
    });

    it('should emit key up events', (done) => {
        const testKey = 'a';

        service.keyUp$.subscribe((key) => {
            expect(key).toEqual(testKey);
            done();
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

        service.mouseDown$.subscribe((event) => {
            expect(event).toEqual(testEvent);
            done();
        });

        document.dispatchEvent(testEvent);
    });

    it('should emit mouse up events', (done) => {
        const testEvent = new MouseEvent('mouseup');

        service.mouseUp$.subscribe((event) => {
            expect(event).toEqual(testEvent);
            done();
        });

        document.dispatchEvent(testEvent);
    });
});
