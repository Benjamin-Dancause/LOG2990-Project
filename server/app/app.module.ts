import { CourseController } from '@app/controllers/course/course.controller';
import { DateController } from '@app/controllers/date/date.controller';
import { ExampleController } from '@app/controllers/example/example.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Course, courseSchema } from '@app/model/database/course';
import { CourseService } from '@app/services/course/course.service';
import { DateService } from '@app/services/date/date.service';
import { ExampleService } from '@app/services/example/example.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterController } from './controllers/counter/counter.controller';
import { GamecardsController } from './controllers/gamecards/gamecards.controller';
import { StoreController } from './controllers/store/store.controller';
import { TimerController } from './controllers/timer/timer.controller';
import { GameManager } from './services/game-manager/game-manager.service';
import { StoreService } from './services/store/store.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }]),
    ],
    controllers: [CourseController, DateController, ExampleController, GamecardsController, GameManager, StoreController, TimerController, CounterController],
    providers: [ChatGateway, CourseService, DateService, ExampleService, Logger, StoreService],
})
export class AppModule {}
