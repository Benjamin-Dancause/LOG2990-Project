import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

@Controller('counter')
export class CounterController {
    private counter = 0;

    @Get()
    @HttpCode(HttpStatus.OK)
    getCounter() {
        return this.counter;
    }

    @Post('increment')
    @HttpCode(HttpStatus.OK)
    incrementCounter(@Body() body: any) {
        this.counter++;
        return this.counter;
    }

    @Post('reset')
    @HttpCode(HttpStatus.RESET_CONTENT)
    resetCounter(@Body() body: any) {
        this.counter = 0;
        return this.counter;
    }
}
