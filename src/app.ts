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
	private assets: MRE.AssetContainer;
	
	private scoreText: MRE.Actor = null;

	private debugButtonIncreaseLevel: MRE.Actor = null;
	private debugButtonIncreaseHit: MRE.Actor = null;
	private debugButtonResetAll: MRE.Actor = null;

	private balls: MRE.Actor[] = [];
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
		this.scoreText.text.contents = "Scores";
		this.scores.players.forEach(player => {
			this.scoreText.text.contents += "\n" + player.user.name;
			player.scores.forEach(score => {
				this.scoreText.text.contents += " " + score;
			});
		});
	}

	private async started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);

		this.scoreText = MRE.Actor.Create(this.context, {
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
			}
		});

		// Create menu button
		const buttonMesh = this.assets.createBoxMesh('button', 0.3, 0.3, 0.01);

		this.debugButtonIncreaseHit = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: { x: 0, y: 1, z: -1 } }
				},
				appearance: { meshId: buttonMesh.id },

				collider: { geometry: { shape: MRE.ColliderType.Auto } },
			}
		});

		this.debugButtonIncreaseLevel = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: { x: 0, y: 0, z: -1 } }
				},
				appearance: { meshId: buttonMesh.id },

				collider: { geometry: { shape: MRE.ColliderType.Auto } },
			}
		});

		this.debugButtonResetAll = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: { x: 0, y: -1, z: -1 } }
				},
				appearance: { meshId: buttonMesh.id },

				collider: { geometry: { shape: MRE.ColliderType.Auto } },
			}
		});

		const increaseHitButtonBehaviour = this.debugButtonIncreaseHit.setBehavior(MRE.ButtonBehavior);
		const increaseLevelButtonBehaviour = this.debugButtonIncreaseLevel.setBehavior(MRE.ButtonBehavior);
		const resetAllButtonBehaviour = this.debugButtonResetAll.setBehavior(MRE.ButtonBehavior);

		increaseHitButtonBehaviour.onClick(user =>{
			this.scores.players.forEach((player, index) =>{
				if(player.user === user) player.addPointToHole(player.currLevel);
			});
			this.refreshScoreboard();
		});

		increaseLevelButtonBehaviour.onClick(user =>{
			this.scores.players.forEach((player, index) =>{
				if(player.user === user) player.currLevel += 1;
			});
			this.refreshScoreboard();
		});

		resetAllButtonBehaviour.onClick(user =>{
			this.scores.players.forEach((player, index) =>{
				if(player.user === user) player.resetScores();
			});
			this.refreshScoreboard();
		});

		// Load a glTF model before we use it
		const cubeData = await this.assets.loadGltf('altspace-cube.glb', "box");

		// // spawn a copy of the glTF model
		// this.balls[0] = MRE.Actor.CreateFromPrefab(this.context, {
		// 	// using the data we loaded earlier
		// 	firstPrefabFrom: cubeData,
		// 	// Also apply the following generic actor properties.
		// 	actor: {
		// 		name: 'Altspace Cube',
		// 		// Parent the glTF model to the text actor, so the transform is relative to the text
		// 		transform: {
		// 			local: {
		// 				position: { x: 0, y: -1, z: 0 },
		// 				scale: { x: 0.4, y: 0.4, z: 0.4 }
		// 			}
		// 		}
		// 	}
		// });
	}
}
