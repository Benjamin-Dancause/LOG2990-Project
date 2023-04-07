import { bestTimes } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { MongoClient } from 'mongodb';




@Injectable()
export class databaseService {
    private readonly mongoUrl: string = 'mongodb://localhost:27017';
    private readonly dbName: string = 'Projet2';
    private readonly client: MongoClient;
    private readonly collection: any;

    constructor() {
        this.client = new MongoClient(this.mongoUrl);
        this.collection = this.client.db(this.dbName).collection<bestTimes>('bestTimes')
        this.collection.drop();
        this.setup();
    }

    async setup(): Promise<void> {
        const gamesContent = await fs.readFile('assets/data/gamesData.json', 'utf-8').then((data) => JSON.parse(data));
        for (const game of gamesContent) {
            const bestTimes: bestTimes = { 'name': game.name, 'timesSolo': [600,610,620], 'timesMulti': [600,610,620], usersSolo: ['User1','User2','User3'], usersMulti: ['User4','User5','User6'] };

            await this.collection.insertOne(bestTimes);
        }
    }

    async createBestTimes(bestTime: bestTimes) {
        await this.collection.insertOne(bestTime);
    }

    async updateBestTimes(name: string, newBestTime: bestTimes) {
        await this.collection.findOneAndReplace({ 'name': name }, newBestTime);
    }

    async getBestTimesByName(name: string): Promise<bestTimes | null> {
        return await this.collection.findOne({ name: { $eq : name } });
      }

    async getBestTimes(): Promise<bestTimes[]> {
        return await this.collection.find({}).toArray();
    }


}
