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
import * as http from 'http';
import { CounterController } from './controllers/counter/counter.controller';
import { GameManagerController } from './controllers/game-manager/game-manager.controller';
import { GamecardsController } from './controllers/gamecards/gamecards.controller';
import { StoreController } from './controllers/store/store.controller';
import { SocketManagerGateway } from './gateways/socket-manager/socket-manager.gateway';
import { TimerGateway } from './gateways/timer/timer.gateway';
import { GameManager } from './services/game-manager/game-manager.service';
import { SocketManagerService } from './services/socket-manager/socket-manager.service';
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
    controllers: [
        CourseController,
        DateController,
        ExampleController,
        GamecardsController,
        GameManagerController,
        StoreController,
        CounterController,
    ],
    providers: [
        ChatGateway,
        CourseService,
        DateService,
        ExampleService,
        Logger,
        StoreService,
        GameManager,
        SocketManagerService,
        http.Server,
        SocketManagerGateway,
        TimerGateway,
    ],
})
export class AppModule {}
