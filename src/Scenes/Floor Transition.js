class FloorTrans extends Phaser.Scene {
    constructor() {
        super("floorTransScene");
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

        if(playerStats.currentFloor % 4 == 0){ //every 4 floors cleared, the difficulty increases
            multiplier += 0.5;
            my.text.multiplierWarning = this.add.text(config.width / 2, 300, `Difficulty up!\nEnemies now have\nmore health!`, { 
                fontFamily: "rocketSquare",
                fontSize: '64px',
                backgroundColor: '#000000' 
            })
        }
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