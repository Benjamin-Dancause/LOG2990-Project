import { RoomService } from '@app/services/room/room.service';
import { Controller } from '@nestjs/common';

@Controller('games')
export class RoomController {
    constructor(private readonly roomService: RoomService) {}
}
