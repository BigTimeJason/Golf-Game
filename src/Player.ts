import * as MRE from '@microsoft/mixed-reality-extension-sdk';

export class Player{
    public user: MRE.User;
    public scores: number[];
    public currLevel: number;

    public constructor(user: MRE.User){
        this.user = user;
        this.scores = [];
        this.currLevel = 0;
    }

    addPointToHole(holeNumber: number){
        if(this.scores.length <= holeNumber){
            this.scores.push(0);
        }
        this.scores[holeNumber] += 1
    }

    resetScores(){
        this.scores = [];
        this.currLevel = 0;
    }
}