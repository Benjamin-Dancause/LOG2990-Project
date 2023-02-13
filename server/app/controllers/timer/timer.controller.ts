import { Controller, Get, Post } from '@nestjs/common';

@Controller('timer')
export class TimerController {
    private time = 0;

    @Get()
    getTime() {
        this.time++;
        return{ time: this.time};
    }

    @Post('reset')
    resetTimer() {
        this.time = 0;
        return {time: this.time};
    }
}
