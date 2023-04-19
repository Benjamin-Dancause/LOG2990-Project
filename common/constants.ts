export enum ERROR_MESSAGES {
    SCREEN_WIDTH = 640,
    SCREEN_HEIGHT = 480,
    DIFFCOUNT_MAX = 9,
    DIFFCOUNT_MIN = 3,
    DIFFERROR_MSG = 'Vous devez avoir entre 3 et 9 différences',
    FORMATERROR_MSG = 'Le format des images est invalide',
    NAMEERROR_MSG = 'Ce nom est déjà pris ou est vide',
}
export enum CANVAS {
    WIDTH = 640,
    HEIGHT = 480,
    CORNER = 0,
    BMP_MIN = 66,
    BMP_MAX = 77,
    BIT_DEPTH = 24,
    RESET = 0,
    LEFT = 0,
    RIGHT = 1,
    LASTPOSX = 150,
    LASTPOSY = 250,
}

export enum DRAWING {
    WHITE = '#ffffff',
    PEN = 'pen',
    ERASER = 'eraser',
    RECTANGLE = 'rectangle',
    PEN_TIP = 'round',
    ERASER_TIP = 'square',
    BASE_COLOR = '#000000',
    ERASER_COLOR = '#ffffff',
    SQUARED = 2,
    MIDDLE_OFFSET = 0.5,
    RADIUS = 5,
}

export enum DELAY {
    BIGTIMEOUT = 2000,
    SMALLTIMEOUT = 1000,
    HUGE_TIMEOUT = 5000,
    MINITIMEOUT = 200,
    SMALLESTTIMEOUT = 100,
}

export enum DIFFERENCE {
    DIFFICULT = 'Difficile',
    EASY = 'Facile',
    DIFFCOUNT_MAX = 9,
    DIFFCOUNT_MIN = 3,
    DIFFCOUNT = 4, 
}

export enum TIME {
    SMALL_ADD_TIME = 10,
    SMALL_PENALTY = 5,
    SMALL_TIME_GAINED = 5,
    COUNTDOWN_TIME = 30,
    MEDIUM_COUNTDOWN_TIME = 20,
    SMALL_COUNTDOWN_TIME = 10,
    BIG_DELAY = 250,
    SIXTY_SECONDS = 60,
    TEN_SECONDS = 10,
    TEN_MINUTES = 10,
    FOUR_X_SPEED = 4,
}

export enum BEST_TIME {
    WORST_SOLO_TIME = 300,
    SOLO_TIME = 400,
    BEST_SOLO_TIME = 500,
    WORST_MULTI_TIME = 500,
    MULTI_TIME = 600,
    BEST_MULTI_TIME = 700,
}