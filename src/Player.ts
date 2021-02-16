import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import {HoleInterface} from ".";

export class Player{
    public user: MRE.User;
    public score: HoleInterface[];

    public constructor(user: MRE.User){
        this.user = user;
        this.score = [];
    }

    addPointToHole(holeNumber: number){
        this.score[holeNumber].score += 1
    }
}