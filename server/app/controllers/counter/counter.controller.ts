import { Body, Controller, Post } from '@nestjs/common';

@Controller('counter')
export class CounterController {
    private counter = 0;

    @Post()
    incrementCounter(@Body() body: any) {
        this.counter++;
        return this.counter;
    }

}
