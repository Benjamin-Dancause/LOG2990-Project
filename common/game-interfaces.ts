export interface Lobby {
    gameMaster: string;
    gameTitle: string;
}

export interface GameInfo {
    gameMaster: string;
    joiningPlayer: string;
    gameTitle: string;
}

export interface CompleteGameInfo {
    gameMaster: string;
    joiningPlayer: string;
    gameTitle: string;
    roomId: string;
}

export interface OneVsOneGameplayInfo {
    gameTitle: string;
    roomId: string;
    player1: boolean;
}

export interface Coords {
    x: number;
    y: number;
}

export interface Data {
    name: string;
    images: string[];
    difficulty: boolean;
    count: number;
    differences: Coords[][];
}

export interface GameSelectionPageData {
    name: string;
    image: string;
    difficulty: boolean;
}

export interface GameplayData {
    name: string;
    images: string[];
    count: number;
    difficulty: boolean;
}

export interface GameDiffData {
    id: number;
    count: number;
    differences: Coords[][];
}

export interface DifferenceInterface {
    isDifference: boolean;
    differenceNumber: number;
    coords: Coords[];
}

export interface RoomGameData {
    name: string;
    count: number;
    differences: Coords[][];
    images: string[];
}

export interface BestTimes {
    name: string;
    usersSolo: string[];
    usersMulti: string[];
    timesSolo: number[];
    timesMulti: number[];
}

export interface PlayerTime {
    user: string;
    time: number;
    isSolo: boolean;
}

export interface GameHistoryInfo {
    gameTitle: string;
    winner: string;
    loser: string;
    surrender: boolean;
    time: { startTime: string; duration: number };
    isSolo: boolean;
    isLimitedTime: boolean;
}

export interface GameConstants {
    startTime: number;
    increment: number;
    penalty: number;
}
