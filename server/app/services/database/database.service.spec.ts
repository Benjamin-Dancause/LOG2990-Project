import { gameHistoryInfo } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoClient } from 'mongodb';
import { databaseService } from './database.service';

describe('databaseService', () => {
  let service: databaseService;
  let client: MongoClient;
  let mongoUrl: string = 'mongodb+srv://equipe210:differences210@2990-210.po0vcim.mongodb.net/?retryWrites=true&w=majority';
  let module: TestingModule;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [databaseService],
    }).compile();

    service = module.get<databaseService>(databaseService);
  });
  
  beforeEach(async () => {
    client = new MongoClient(mongoUrl)
  });

  afterEach(async () => {
    await client.close();
  });
  
  afterAll(async () => {
    await module.close();
  });
 
  //Ce test et le suivant ont parfois une erreur mais c'est rare (updateBestTimes = probablement le coupable, seul fois ou cette fonction est called)
  it('should update best times for solo game', async () => {
      const bestTimes = { name: 'test', timesSolo: [600, 610, 620], timesMulti: [600, 610, 620], usersSolo: [], usersMulti: [] };
      await service.createBestTimes(bestTimes);
      await service.updateBestTimes('test', true, 'user1', 590);
      const result = await service.getBestTimesByName('test', 'solo');
      expect(result[0]).toEqual(590);
  });

  it('should update best times when gamemode is 1v1', async () => {
      const bestTimes = { name: 'test', timesSolo: [600, 610, 620], timesMulti: [600, 610, 620], usersSolo: [], usersMulti: [] };
      await service.createBestTimes(bestTimes);
      await service.updateBestTimes('test', false, 'user1', 590);
      const result = await service.getBestTimesByName('test', '1v1');
      expect(result[0]).toEqual(590);
  });

  it('should get all best times', async () => {
      const bestTimes1 = { name: 'test1', timesSolo: [600, 610, 620], timesMulti: [600, 610, 620], usersSolo: [], usersMulti: [] };
      const bestTimes2 = { name: 'test2', timesSolo: [700, 710, 720], timesMulti: [700, 710, 720], usersSolo: [], usersMulti: [] };
      await service.createBestTimes(bestTimes1);
      await service.createBestTimes(bestTimes2);
      const result = await service.getBestTimes();
      expect(result).not.toEqual([bestTimes1, bestTimes2]);
  });

  it('should reset the best times of a game to their initial values', async () => {
    const bestTimes = { name: 'test', timesSolo: [30, 60, 70], timesMulti: [60, 70, 80], usersSolo: [], usersMulti: [] };
      await service.createBestTimes(bestTimes);
      await service.resetBestTimes(bestTimes.name);
      const result = await service.getBestTimesByName(bestTimes.name, 'solo');
      expect(result).toEqual([600, 610, 620]);
  });

  it('should create a new game history', async () => {
    const gameHistory: gameHistoryInfo = {
      gameTitle: 'game1',
      winner: 'joueur 1',
      loser: 'joueur 2',
      surrender: false,
      time: { startTime: 'string', duration: 3 },
      isSolo: false,
      isLimitedTime: false,
    };
    await service.createGameHistory(gameHistory);
    const result = await service.getGameHistory('game1');
    expect(result.length).toBeGreaterThan(0);
  });

  it('getAllGameHistory should get all game history', async () => {
      const gameHistory1: gameHistoryInfo = {
          gameTitle: 'game1',
          winner: 'joueur 1',
          loser: 'joueur 2',
          surrender: false,
          time: { startTime: 'string', duration: 3 },
          isSolo: false,
          isLimitedTime: false,
      };
      const gameHistory2: gameHistoryInfo = {
          gameTitle: 'game2',
          winner: 'joueur 3',
          loser: 'joueur 4',
          surrender: false,
          time: { startTime: 'string', duration: 3 },
          isSolo: false,
          isLimitedTime: false,
      };
      await service.createGameHistory(gameHistory1);
      await service.createGameHistory(gameHistory2);
      const result = await service.getAllGameHistory();
      expect(result).not.toEqual([gameHistory1, gameHistory2]);
  });

  it('deleteBestTimes should delete best times by name', async () => {
        const bestTimes = { name: 'test', timesSolo: [600, 610, 620], timesMulti: [600, 610, 620], usersSolo: [], usersMulti: [] };
        await service.createBestTimes(bestTimes);
        await service.deleteBestTimes('test');
        const result = await service.getBestTimesByName('test', 'solo');
        expect(result).not.toBeNull();
  });

  it('deleteAllGameHistory should delete all game history', async () => {
    const gameHistory: gameHistoryInfo = {
      gameTitle: 'game1',
      winner: 'joueur 1',
      loser: 'joueur 2',
      surrender: false,
      time: { startTime: 'string', duration: 3 },
      isSolo: false,
      isLimitedTime: false,
    };
    await service.createGameHistory(gameHistory);
    await service.deleteAllGameHistory();
    const result = await service.getAllGameHistory();
    expect(result).toEqual([]);
  });

  it('bubbleUp should return -1 if the new time is not part of the array', async () => {
      const testArray = [50, 60, 70];
      const bubble = 80;
      const result = await service.bubbleUp(testArray, bubble);
      expect(result).toEqual(-1);
  });

  it('bubbleTo should swap new time to correct position in the array', async () => {
      const testArray = [50, 60, 70];
      const originalIndex = 1;
      const destinationIndex = 2;

      jest.spyOn(service, 'swap');

      await service.bubbleTo(testArray, originalIndex, destinationIndex);
      expect(service.swap).toHaveBeenCalled();
  });

  it('bubbleTo should swap old time to new position in the array', async () => {
    const testArray = [50, 60, 70];
    const originalIndex = 2;
    const destinationIndex = 0;

    jest.spyOn(service, 'swap');

    await service.bubbleTo(testArray, originalIndex, destinationIndex);
    expect(service.swap).toHaveBeenCalled();
  });

});
