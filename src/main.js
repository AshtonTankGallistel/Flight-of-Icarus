// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 1440,
    height: 1040,
    scene: [Load, Platformer, Test, Title, Floor, Credits, FloorTrans, GameOver]
}

var cursors;
var wasd;
var multiplier = 1;
const SCALE = 5.0;
const ROOMCOUNT = 3; //amount of numbered rooms, not counting #0
const TILESIZE = 16;
var my = {sprite: {}, text: {}, vfx: {}, stats: {maxHp:3, hp:3, atk:1, spe:1, invulnerable:0, money:0}};

const game = new Phaser.Game(config);