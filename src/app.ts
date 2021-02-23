/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { Asset, Collider, Context, MreArgumentError } from '@microsoft/mixed-reality-extension-sdk';
import { SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG } from 'constants';
import { ScoreboardInterface, Player } from '.';

/**
 * The main class of this app. All the logic goes here.
 */
export default class GolfScoreboard {
	private assets: MRE.AssetContainer;
	
	private scoreText: MRE.Actor = null;

	private increaseLevelButton: MRE.Actor = null;
	private increaseHitButton: MRE.Actor = null;
	private resetCurrentButton: MRE.Actor = null;
	private resetAllButton: MRE.Actor = null;

	private playerText: MRE.Actor = null;
	private increaseLevelText: MRE.Actor = null;
	private increaseHitText: MRE.Actor = null;
	private resetCurrentText: MRE.Actor = null;
	private resetAllText: MRE.Actor = null;

	private balls: MRE.Actor[] = [];
	private scores: ScoreboardInterface = {players: []};

	constructor(private context: MRE.Context) {
		this.context.onStarted(() => this.started());
		this.context.onUserJoined(user => this.addUserToScoreboard(user));
		this.context.onUserLeft(user => this.removeUserFromScoreboard(user));
	}

	// SCOREBOARD FUNCTIONS
	private removeUserFromScoreboard(user: MRE.User){
		this.scores.players.forEach((player, index) =>{
			if(player.user === user) this.scores.players.splice(index, 1);
		});
		this.refreshScoreboard();
	}

	private addUserToScoreboard(user: MRE.User) {
		this.scores.players.forEach((player, index) =>{
			if(player.user === user) return;
		});
		this.scores.players.push(new Player(user));
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

	// GAMEPLAY FUNCTIONS
	// (CALL WHEN PLAYER HITS BALL)
	private addScoreToUser(user: MRE.User){
		this.scores.players.forEach((player) =>{
			if(player.user === user) player.addPointToHole(player.currLevel);
		});
		this.refreshScoreboard();
	}

	// (CALL WHEN PLAYER HITS BALL INTO HOLE!!!)
	private score(user: MRE.User){
		this.scores.players.find(player => player.user.id === user.id).scoreGoal();
		this.refreshScoreboard();
	}

	// RESET CURRENT SCORES
	private resetCurrentLevelForUser(user: MRE.User){
		this.scores.players.find(player => player.user.id === user.id).resetCurrentScore();		
		this.refreshScoreboard();
	}

	// RESET ALL SCORES
	private resetAllScoresForUser(user: MRE.User){
		this.scores.players.find(player => player.user.id === user.id).resetScores();		
		this.refreshScoreboard();
	}

	private async started() {

		let textXoffset = -1.5;
		let textZoffset = 0;

		// Set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);

		// SCORE SHEET REPRESENTATION
		this.scoreText = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: { x: 0, y: 0, z: textZoffset } }
				},
				text: {
					contents: "Scores",
					anchor: MRE.TextAnchorLocation.MiddleLeft,
					color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
					height: 0.3
				}
			}
		});

		// LABELS FOR THE BUTTONS
		this.playerText = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					local: { position: { x: textXoffset, y: 0.5, z: textZoffset } }
				},
				text: {
					contents: "PER PLAYER OPTIONS",
					anchor: MRE.TextAnchorLocation.MiddleRight,
					color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
					height: 0.3
				}
			}
		});

		this.increaseHitText = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					local: { position: { x: textXoffset, y: 0, z: textZoffset } }
				},
				text: {
					contents: "Increase Score",
					anchor: MRE.TextAnchorLocation.MiddleRight,
					color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
					height: 0.3
				}
			}
		});

		this.increaseLevelText = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					local: { position: { x: textXoffset, y: -0.5, z: textZoffset } }
				},
				text: {
					contents: "Increase Level",
					anchor: MRE.TextAnchorLocation.MiddleRight,
					color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
					height: 0.3
				}
			}
		});

		this.resetAllText = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					local: { position: { x: textXoffset, y: -1, z: textZoffset } }
				},
				text: {
					contents: "Reset Current Level Score",
					anchor: MRE.TextAnchorLocation.MiddleRight,
					color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
					height: 0.3
				}
			}
		});

		this.resetAllText = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					local: { position: { x: textXoffset, y: -1.5, z: textZoffset } }
				},
				text: {
					contents: "Reset ALL Scores",
					anchor: MRE.TextAnchorLocation.MiddleRight,
					color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
					height: 0.3
				}
			}
		});

		// CREATE MENU BUTTON MESH (text does not have a collider sadge)
		const buttonMesh = this.assets.createBoxMesh('button', 0.3, 0.3, 0.01);

		// BUTTONS
		this.increaseHitButton = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: { x: -1, y: 0, z: 0 } }
				},
				appearance: { meshId: buttonMesh.id },
				collider: { geometry: { shape: MRE.ColliderType.Auto } },
			}
		});

		this.increaseLevelButton = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: { x: -1, y: -0.5, z: 0 } }
				},
				appearance: { meshId: buttonMesh.id },
				collider: { geometry: { shape: MRE.ColliderType.Auto } },
			}
		});

		this.resetCurrentButton = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: { x: -1, y: -1, z: 0 } }
				},
				appearance: { meshId: buttonMesh.id },
				collider: { geometry: { shape: MRE.ColliderType.Auto } },
			}
		});


		this.resetAllButton = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: { x: -1, y: -1.5, z: 0 } }
				},
				appearance: { meshId: buttonMesh.id },
				collider: { geometry: { shape: MRE.ColliderType.Auto } },
			}
		});

		// BUTTON BEHAVIOUR
		const increaseHitButtonBehaviour = this.increaseHitButton.setBehavior(MRE.ButtonBehavior);
		const increaseLevelButtonBehaviour = this.increaseLevelButton.setBehavior(MRE.ButtonBehavior);
		const resetCurrentLevelBehaviour = this.resetCurrentButton.setBehavior(MRE.ButtonBehavior);
		const resetAllButtonBehaviour = this.resetAllButton.setBehavior(MRE.ButtonBehavior);

		increaseHitButtonBehaviour.onClick(user =>{
			this.addScoreToUser(user);
			this.refreshScoreboard();
		});

		increaseLevelButtonBehaviour.onClick(user =>{
			this.score(user);
			this.refreshScoreboard();
		});

		resetCurrentLevelBehaviour.onClick(user =>{
			this.resetCurrentLevelForUser(user);
			this.refreshScoreboard();
		})

		resetAllButtonBehaviour.onClick(user =>{
			this.resetAllScoresForUser(user);
			this.refreshScoreboard();
		});

		// Load a glTF model before we use it
		const cubeData = await this.assets.loadGltf('altspace-cube.glb', "box");
	}
}
