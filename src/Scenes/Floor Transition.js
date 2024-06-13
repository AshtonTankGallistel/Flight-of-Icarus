class FloorTrans extends Phaser.Scene {
    constructor() {
        super("floorTransScene");
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
        /*
        this.map = this.add.tilemap("title-screen-level", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.tilesetmoon = this.map.addTilesetImage("moon-tiles", "moon_tiles");

        // Create a layer
        //moon tile
        this.farBackgroundLayer = this.map.createLayer("far-background", this.tilesetmoon, 0, 0);//.setScrollFactor(0.1);
        this.farBackgroundLayer.setScale(2.0);
        //reg tiles
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setScale(2.0);
        */

        //text
        my.text.win = this.add.text(50, 32, `FLOOR COMPLETED!`, { 
            fontFamily: "rocketSquare",
            fontSize: '128px',
            backgroundColor: '#000000' 
        })
        my.text.myCredits = this.add.text(50, 250, `Current Items: ` + playerStats.itemTotal, { 
            fontFamily: "rocketSquare",
            fontSize: '64px',
            backgroundColor: '#000000' 
        })
        my.text.myCredits = this.add.text(50, 400, `Floors Cleared: ` + playerStats.currentFloor, { 
            fontFamily: "rocketSquare",
            fontSize: '64px',
            backgroundColor: '#000000' 
        })
        my.text.startInstructions = this.add.text(50, 750, `Press space to\ngo to next floor`, { 
            fontFamily: "rocketSquare",
            fontSize: '64px',
            backgroundColor: '#000000' 
        })

        playerStats.currentFloor += 1;

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