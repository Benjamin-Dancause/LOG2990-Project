import { ApiProperty } from '@nestjs/swagger';

export class Gamecard {
    @ApiProperty()
    title: string;
    @ApiProperty()
    difficulty: string;
    @ApiProperty()
    originalImagePath: string;
    @ApiProperty()
    modifiableImagePath: string;
}
