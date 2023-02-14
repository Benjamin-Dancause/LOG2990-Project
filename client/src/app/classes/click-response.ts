import { Coords } from "./coords";


export class ClickResponse {

    success: boolean;
    differenceNumber: number;
    differenceCoords: Coords[];

    constructor(success: boolean, differenceNumber: number, differenceCoords: Coords[]) {
        this.success = success;
        this.differenceNumber = differenceNumber;
        this.differenceCoords = differenceCoords;
    }

}
