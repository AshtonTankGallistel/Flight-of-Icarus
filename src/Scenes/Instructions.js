class Instructions extends Phaser.Scene {
    constructor() {
        super("instructionsScene");
    }

    preload() {
        //Note: if this preload is done in Load.js, the program loses access to the animatedTiles plugin when it changes to this scene
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        
        this.load.path = "./assets/"
        
        //text
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {
        // Create a new tilemap game object
        this.map = this.add.tilemap("Attic_0",16,16,18,13);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("roguelikeSheet", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Walls",this.tileset,0,0).setScale(SCALE);
        this.blockLayer = this.map.createLayer("Blocks-n-Layouts",this.tileset,0,0).setScale(SCALE);

        //text
        my.text.Instructions1 = this.add.text(config.width / 4, config.height / 4, `WASD to move`, { 
            fontFamily: "rocketSquare",
            fontSize: '64px',
            backgroundColor: '#000000' 
        })
        my.text.Instructions1.x = config.width / 2 - my.text.Instructions1.displayWidth / 2;
        my.text.Instructions2 = this.add.text(config.width * 3 / 4, config.height / 2, `Arrow keys to shoot`, { 
            fontFamily: "rocketSquare",
            fontSize: '64px',
            backgroundColor: '#000000' 
        })
        my.text.Instructions2.x = config.width / 2 - my.text.Instructions2.displayWidth / 2;
        my.text.startInstructions = this.add.text(config.width / 2, config.height *3 / 4, `Press space to begin!`, { 
            fontFamily: "rocketSquare",
            fontSize: '64px',
            backgroundColor: '#000000' 
        })
        my.text.startInstructions.x = config.width / 2 - my.text.startInstructions.displayWidth / 2;

        //start game
        let SpaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        SpaceKey.on('down',(key,event) =>{
            this.scene.start("floorScene");
        });

    }
    
    update(){
        //wow! it's nothing!
    }
}