
//Player Stats declaration
playerStats = {
    itemTotal: 0,
    currentFloor: 1
}


class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        //console.log("attempting plugin");
        //add animation plugin
        //this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        //console.log("attempted plugin");

        //particle effects
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "roguelikeSheet_transparent.png", {
            frameWidth: 16,
            frameHeight: 16,
            spacing: 1
        });

        // Load the heart sprites as a sprite
        this.load.spritesheet("heart_sheet", "heartTilemap.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        // Load tilemap information
        this.load.image("tilemap_tiles", "roguelikeSheet_transparent.png");           // Packed tilemap
        this.load.tilemapTiledJSON("Attic_Border", "Attic rooms/Attic_Border.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("Attic_Item", "Attic rooms/Attic_Item.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("Attic_Boss", "Attic rooms/Attic_Boss.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("Attic_Shop", "Attic rooms/Attic_Shop.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("Attic_TrapBorder", "Attic rooms/Attic_TrapBorder.tmj");   // Tilemap in JSON
        //attic room floors
        for(let i = 0; i <= ROOMCOUNT; i++){
            let tilemapName = "Attic_" + i;
            //console.log(tilemapName);
            this.load.tilemapTiledJSON(tilemapName, "Attic rooms/" + tilemapName + ".tmj");
        }
        //this.load.tilemapTiledJSON("title-screen-level", "title-screen-level.tmj");   // Tilemap in JSON
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

        this.anims.create({
            key: 'ladder',
            defaultTextureKey: "tilemap_sheet",
            frames: [
                { frame: 495 }
            ],
        });

        this.anims.create({
            key: 'heartFilled',
            defaultTextureKey: "heart_sheet",
            frames: [
                { frame: 0 }
            ],
        });

        this.anims.create({
            key: 'heartEmpty',
            defaultTextureKey: "heart_sheet",
            frames: [
                { frame: 1 }
            ],
        });

        this.anims.create({
            key: 'enemyWalk',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0009.png"},
                { frame: "tile_0010.png"}
            ],
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'enemyShoot',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0004.png"},
                { frame: "tile_0005.png"}
            ],
            frameRate: 15,
            repeat: -1
        });

        //hp up, 0
        this.anims.create({
            key: 'item0',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0020.png"}
            ]
        });

        //spe up, 1
        this.anims.create({
            key: 'item1',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0024.png"}
            ]
        });

        //atk up, 2
        this.anims.create({
            key: 'item2',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0017.png"}
            ]
        });

         // ...and pass to the next Scene
         console.log("exiting load.js");
         this.scene.start("titleScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}