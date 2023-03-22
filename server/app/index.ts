import { AppModule } from '@app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { join } from 'path';

const bootstrap = async () => {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.useWebSocketAdapter(new IoAdapter(app));
    app.use((_req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
    app.useStaticAssets(join(__dirname, '..', '..', '..', 'assets', 'images'), {
        prefix: '/api/assets/images/',
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    app.use(bodyParser.json({ limit: '5Mb' }));
    app.use(bodyParser.urlencoded({ limit: '5Mb', extended: true }));
    app.enableCors();
    const config = new DocumentBuilder()
        .setTitle('Cadriciel Serveur')
        .setDescription('Serveur du projet de base pour le cours de LOG2990')
        .setVersion('1.0.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    SwaggerModule.setup('', app, document);

    await app.listen(process.env.PORT);
};

bootstrap();
