import { Coords } from "@app/classes/coords";

export interface GameDiffData {
    id: number;
    count: number;
    differences: Coords[][];
}
