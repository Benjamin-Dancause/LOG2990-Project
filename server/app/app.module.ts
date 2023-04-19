import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as http from 'http';
import { BestTimesController } from './controllers/best-times/best-times.controller';
import { GameConfigController } from './controllers/game-config/game-config.controller';
import { GameHistoryController } from './controllers/game-history/game-history.controller';
import { GameManagerController } from './controllers/game-manager/game-manager.controller';
import { GameController } from './controllers/game/game.controller';
import { GamecardsController } from './controllers/gamecards/gamecards.controller';
import { StoreController } from './controllers/store/store.controller';
import { ClassicModeGateway } from './gateways/classic-mode/classic-mode.gateway';
import { CounterManagerService } from './services/counter-manager/counter-manager.service';
import { databaseService } from './services/database/database.service';
import { GameConfigService } from './services/game-config/game-config.service';
import { GameManager } from './services/game-manager/game-manager.service';
import { StoreService } from './services/store/store.service';
import { TimerManagerService } from './services/timer-manager/timer-manager.service';
import { WaitingRoomManagerService } from './services/waiting-room-manager/waiting-room-manager.service';

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
    ],
    controllers: [
        GamecardsController,
        GameManagerController,
        StoreController,
        GameController,
        GameConfigController,
        BestTimesController,
        GameHistoryController,
    ],

    providers: [
        ChatGateway,
        Logger,
        StoreService,
        GameManager,
        databaseService,
        http.Server,
        ClassicModeGateway,
        TimerManagerService,
        CounterManagerService,
        WaitingRoomManagerService,
        GameConfigService,
    ],
})
export class AppModule {}
