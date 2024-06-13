class Test extends Phaser.Scene {
    constructor() {
        super("testScene");
    }

    preload() {
        //Note: if this preload is done in Load.js, the program loses access to the animatedTiles plugin when it changes to this scene
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');

        //text
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {

        this.map = this.add.tilemap("Attic_0", 16, 16, 18, 13);
    }

    update() {

    }
}