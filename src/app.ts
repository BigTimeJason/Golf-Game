/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { MreArgumentError } from '@microsoft/mixed-reality-extension-sdk';
import { SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG } from 'constants';
import { ScoreboardInterface, Player } from '.';

/**
 * The main class of this app. All the logic goes here.
 */
export default class HelloWorld {
	private text: MRE.Actor = null;
	private ball: MRE.Actor[] = [];
	private assets: MRE.AssetContainer;
	private scores: ScoreboardInterface = {players: []};

	constructor(private context: MRE.Context) {
		this.context.onStarted(() => this.started());
		this.context.onUserJoined(user => this.addUserToScoreboard(user));
		this.context.onUserLeft(user => this.removeUserFromScoreboard(user));
	}

	private removeUserFromScoreboard(user: MRE.User){
		this.scores.players.forEach((user, index) =>{
			if(user === user) this.scores.players.splice(index, 1);
		});
		this.refreshScoreboard();
	}

	private addUserToScoreboard(user: MRE.User) {
		this.scores.players.push(new Player(user));
		this.refreshScoreboard();
	}

	private addScoreToUser(user: MRE.User, holeNumber: number){
		this.scores.players.find(player => player.user.id === user.id).addPointToHole(holeNumber);		
		this.refreshScoreboard();
	}

	private refreshScoreboard(){
		this.text.text.contents = "Scores";
		this.scores.players.forEach(player => {
			this.text.text.contents += "\n" + player.user.name;
			player.score.forEach(score => {
				this.text.text.contents += "\t" + score;
			});
		});
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);

		// Create a new actor with no mesh, but some text.
		this.text = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: { x: 0, y: 1, z: 0 } }
				},
				text: {
					contents: "Scores",
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
					height: 0.3
				}				
				// attachment: {
				// 	attachPoint: 'head',
				// 	userId: user.id
				// }
			}
		});

				
		// Load a glTF model before we use it
		const cubeData = await this.assets.loadGltf('altspace-cube.glb', "box");

		// spawn a copy of the glTF model
		this.ball[0] = MRE.Actor.CreateFromPrefab(this.context, {
			// using the data we loaded earlier
			firstPrefabFrom: cubeData,
			// Also apply the following generic actor properties.
			actor: {
				name: 'Altspace Cube',
				// Parent the glTF model to the text actor, so the transform is relative to the text
				transform: {
					local: {
						position: { x: 0, y: -1, z: 0 },
						scale: { x: 0.4, y: 0.4, z: 0.4 }
					}
				}
			}
		});
	}
}
