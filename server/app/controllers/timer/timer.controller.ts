import { Controller, Get } from '@nestjs/common';

@Controller('timer')
export class TimerController {
    private time = 0;

    @Get()
    getTime() {
        this.time++;
        return{ time: this.time};
    }
}
