import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import {Player} from ".";

// Yes I know about I prefix on interfaces but my TS extension was being fussy

export interface ScoreboardInterface{
    players: Player[];
}

export interface HoleInterface{
    //holeName: string;
    score: number;
}

// class Scoreboard{
//     public boom: IScoreboard = {players: [{name: "jason", score: [{courseName: "big golf", score: 2}]}]}
// }