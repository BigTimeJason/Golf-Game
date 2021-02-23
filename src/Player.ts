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

    scoreGoal(){
        this.currLevel += 1;
        if(this.scores.length <= this.currLevel){
            this.scores.push(0);
        }
    }

    resetScores(){
        this.scores = [];
        this.currLevel = 0;
    }

    resetCurrentScore(){
        this.scores[this.currLevel] = 0;
    }
}