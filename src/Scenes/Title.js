class Title extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    preload() {
        //Note: if this preload is done in Load.js, the program loses access to the animatedTiles plugin when it changes to this scene
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        
        //Doing this solely for the coin sprite. Can't find a better way to do this lol
        //future note: I am no longer using the coin sprite. i forgot if I used this for something else though, so Im leaving it
        this.load.path = "./assets/"
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        })
        
        //text
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("Attic_0",16,16,18,13);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("roguelikeSheet", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Walls",this.tileset,0,0).setScale(SCALE);
        this.blockLayer = this.map.createLayer("Blocks-n-Layouts",this.tileset,0,0).setScale(SCALE);

        //text
        my.text.title = this.add.text(288, 32, `FLIGHT OF\nICARUS`, { 
            fontFamily: "rocketSquare",
            fontSize: '64px',
            backgroundColor: '#000000' 
        })
        my.text.startInstructions = this.add.text(288, 288, `Press space to start!`, { 
            fontFamily: "rocketSquare",
            fontSize: '64px',
            backgroundColor: '#000000' 
        })

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