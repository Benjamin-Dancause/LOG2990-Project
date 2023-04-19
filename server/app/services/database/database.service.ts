/* eslint-disable @typescript-eslint/no-explicit-any */
import { bestTimes, gameHistoryInfo } from '@common/game-interfaces';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { promises as fs } from 'fs';
import { MongoClient } from 'mongodb';

@Injectable()
export class databaseService implements OnApplicationShutdown {
    private readonly mongoUrl: string = 'mongodb+srv://equipe210:differences210@2990-210.po0vcim.mongodb.net/?retryWrites=true&w=majority';
    private readonly dbName: string = 'Projet2';
    client: MongoClient;
    private readonly collectionBestTimes: any;
    private readonly collectionGameHistory: any;

    constructor() {
        this.client = new MongoClient(this.mongoUrl);
        this.collectionBestTimes = this.client.db(this.dbName).collection<bestTimes>('bestTimes');
        this.collectionGameHistory = this.client.db(this.dbName).collection('gameHistory');
        this.setup();
    }

    async setup(): Promise<void> {
        await this.collectionBestTimes.deleteMany({});
        await this.collectionGameHistory.deleteMany({});
        const gamesContent = await fs.readFile('assets/data/gamesData.json', 'utf-8').then((data) => JSON.parse(data));
        for (const game of gamesContent) {
            const bestTimes: bestTimes = {
                name: game.name,
                timesSolo: [600, 610, 620],
                timesMulti: [600, 610, 620],
                usersSolo: ['User1', 'User2', 'User3'],
                usersMulti: ['User4', 'User5', 'User6'],
            };

            await this.collectionBestTimes.insertOne(bestTimes);
        }
    }

    async createBestTimes(bestTime: bestTimes) {
        await this.collectionBestTimes.insertOne(bestTime);
    }

    async updateBestTimes(name: string, isSolo: boolean, user: string, newBestTime: number) {
        const time = await this.collectionBestTimes.findOne({ name });
        let index = -1;
        if (isSolo) {
            index = this.bubbleUp(time.timesSolo, newBestTime);
            time.usersSolo.push(user);
            if (index !== -1) {
                this.bubbleTo(time.usersSolo, time.usersSolo.length - 1, index);
            }
            time.usersSolo.pop();
        } else {
            index = this.bubbleUp(time.timesMulti, newBestTime);
            time.usersMulti.push(user);
            if (index !== -1) {
                this.bubbleTo(time.usersMulti, time.usersMulti.length - 1, index);
            }
            time.usersMulti.pop();

        }
        if (index !== -1) {
            await this.collectionBestTimes.findOneAndReplace({ name }, time);
        }
    }

    bubbleUp(array: number[], bubble: number): number {
        let bubbleIndex = array.length;
        array.push(bubble);
        for (let i = bubbleIndex - 1; i >= 0; i--) {
            if (array[i] > bubble) {
                this.swap(array, i, bubbleIndex);
                bubbleIndex = i;
            }
        }
        array.pop();
        if (bubbleIndex === array.length) {
            return -1;
        }
        return bubbleIndex;
    }

    bubbleTo(array: number[], originIndex: number, destinationIndex: number) {
        if (originIndex < destinationIndex) {
            for (let i = originIndex; i < destinationIndex; i++) {
                this.swap(array, i, i + 1);
            }
        } else {
            for (let i = originIndex; i > destinationIndex; i--) {
                this.swap(array, i, i - 1);
            }
        }
    }

    swap(array: number[], index1: number, index2: number): void {
        const buffer = array[index1];
        array[index1] = array[index2];
        array[index2] = buffer;
    }

    async getBestTimesByName(name: string, gameMode: string): Promise<number[]> {
        if (gameMode === 'solo') {
            const result = await this.collectionBestTimes.findOne({ name: { $eq: name } });
            return result.timesSolo;
        } else if (gameMode === '1v1') {
            const result = await this.collectionBestTimes.findOne({ name: { $eq: name } });
            return result.timesMulti;
        }
    }

    async getBestTimes(): Promise<bestTimes[]> {
        return await this.collectionBestTimes.find({}).toArray();
    }

    async deleteBestTimes(name: string): Promise<void> {
        await this.collectionBestTimes.deleteOne({ name: { $eq: name } });
    }

    async resetBestTimes(name: string): Promise<void> {
        await this.collectionBestTimes.findOneAndReplace(
            { name },
            {
                name,
                timesSolo: [600, 610, 620],
                timesMulti: [600, 610, 620],
                usersSolo: ['User1', 'User2', 'User3'],
                usersMulti: ['User4', 'User5', 'User6'],
            },
        );
    }

    async createGameHistory(gameHistory: gameHistoryInfo) {
        await this.collectionGameHistory.insertOne(gameHistory);
    }

    async getGameHistory(name: string): Promise<gameHistoryInfo[]> {
        return await this.collectionGameHistory.find({ gameTitle: { $eq: name } }).toArray();
    }

    async getAllGameHistory(): Promise<gameHistoryInfo[]> {
        return await this.collectionGameHistory.find({}).toArray();
    }

    async deleteAllGameHistory(): Promise<void> {
        await this.collectionGameHistory.deleteMany({});
    }

    async onApplicationShutdown(signal?: string): Promise<void> {
        await this.client.close();
    }
}
