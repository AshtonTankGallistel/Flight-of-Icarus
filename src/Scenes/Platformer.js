class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 800;
        this.DRAG = 1500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -700;
        this.PARTICLE_VELOCITY = 50;
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

        //audio
        this.load.audio("letter-collect", "cardPlace2.ogg");
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 90, 50); //need to update to 120 by 80

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.tilesetmoon = this.map.addTilesetImage("moon-tiles", "moon_tiles");
        this.tilesetDark = this.map.addTilesetImage("bg-tiles-packed", "background_tiles");

        // Create a layer
        //moon tile
        this.farBackgroundLayer = this.map.createLayer("far-background", this.tilesetmoon, 0, 0).setScrollFactor(0.1);
        this.farBackgroundLayer.setScale(2.0);
        //darker tiles
        this.mountainLayer = this.map.createLayer("mountains", this.tilesetDark, 0, 0).setScrollFactor(0.7);
        this.mountainLayer.setScale(2.0);
        this.backgroundDarkLayer = this.map.createLayer("background-dark", this.tilesetDark, 0, 0);
        this.backgroundDarkLayer.setScale(2.0);
        //reg tiles
        this.backgroundLayer = this.map.createLayer("background", this.tileset, 0, 0);
        this.backgroundLayer.setScale(2.0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setScale(2.0);
        this.foregroundLayer = this.map.createLayer("foreground", this.tileset, 0, 0);
        this.foregroundLayer.setScale(2.0);
        this.detailsLayer = this.map.createLayer("details", this.tileset, 0, 0);
        this.detailsLayer.setScale(2.0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        //Make water collidable
        this.foregroundLayer.setCollisionByProperty({
            death: true
        });

        //console.log(this.animatedTiles);
        //animate the water
        this.animatedTiles.init(this.map);

        // set up player avatar
        this.playerSpawn = this.map.findObject("Player-n-Coins", obj => obj.name === "Player");
        //console.log(this.playerSpawn);
        //y offset needed due to the player being bigger than each square of the floor without it
        my.sprite.player = this.physics.add.sprite(this.playerSpawn.x * 2 + 27, this.playerSpawn.y * 2 - 27, "platformer_characters", "tile_0000.png").setScale(SCALE)
        this.physics.world.bounds.width = this.map.widthInPixels * 2;
        this.physics.world.bounds.height = this.map.heightInPixels * 2;
        my.sprite.player.setCollideWorldBounds(true);

        //console.log(this.cameras.main);
        // setup camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels * 2, this.map.heightInPixels * 2);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        //console.log(this.cameras.main);

        // Enable collision handling
        //this.physics.add.collider(my.sprite.player, this.groundLayer);

        //coin code
        this.coins = this.map.createFromObjects("Player-n-Coins", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
            //gid:152
        })
        for(let coin of this.coins){
            //coin._crop.width = 16;
            //coin._crop.height = 16;
            //console.log(coin.sprite);
            coin.setScale(2.0);
            coin.x = coin.x * 2;
            coin.y = coin.y * 2;
            coin.anims.play("letter");
        }
        //console.log(this.coins);
        this.coinGroup = this.add.group(this.coins);
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coins.map((coin) => {
            coin.body.setCircle(12).setOffset(6, 6) 
        })
        this.score = 0;
        //my.text.score = this.add.bitmapText(900, 900, "rocketSquare", "Coins: " + this.score);
        my.text.score = this.add.text(32, 32, `Letters: ${ this.score }`, { 
            fontFamily: "rocketSquare",
            fontSize: '32px',
            backgroundColor: '#000000' 
        }).setScrollFactor(0)
        //console.log(my.text.score);
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.add.particles(obj2.x, obj2.y, "kenny-particles", {
                frame: ['star_01.png', 'star_02.png', 'star_03.png', 'star_03.png'],
                scale: {start: 0.03, end: 0.1},
                lifespan: 500,
                alpha: {start: 1, end: 0.1}, 
                quantity: 5,
                stopAfter: 5 //spawns 5 instantly, then stops
            });
            obj2.destroy() // remove coin on overlap
            this.score += 1;
            //my.text.score.setText = "Coins: " + this.score;
            my.text.score.text = `Letters: ${ this.score }`;
            this.sound.play("letter-collect");
        })

        //checkpoint code
        this.checkpoint = this.map.createFromObjects("Player-n-Coins", {
            name: "checkpoint",
            key: "tilemap_sheet",
            frame: 111
            //gid:152
        })
        for(let point of this.checkpoint){
            //coin._crop.width = 16;
            //coin._crop.height = 16;
            //console.log(coin.sprite);
            point.setScale(2.0);
            point.x = point.x * 2;
            point.y = point.y * 2;
        }
        this.checkpointGroup = this.add.group(this.checkpoint);
        this.physics.world.enable(this.checkpoint, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(my.sprite.player, this.checkpointGroup, (obj1, obj2) => {
            this.playerSpawn.x = obj2.x / 2;
            this.playerSpawn.y = obj2.y / 2;
        })

        /*
        //win zone code
        this.winZone = this.map.createFromObjects("Player-n-Coins", {
            name: "win-zone",
            //gid:152
        })
        for(let point of this.winZone){
            //coin._crop.width = 16;
            //coin._crop.height = 16;
            //console.log(coin.sprite);
            point.setScale(2.0);
            point.x = point.x * 2;
            point.y = point.y * 2;
        }
        this.winZoneGroup = this.add.group(this.checkpoint);
        this.physics.world.enable(this.winZone, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(my.sprite.player, this.winZoneGroup, (obj1, obj2) => {
            console.log("in win zone");
        })
        */

        //enemy
        // get enemy object array from tilemap Objects layer
        let enemyList = this.map.filterObjects("Player-n-Coins", obj => obj.name === "enemy");
        this.enemies = [];
        enemyList.map((element) => {
            // Jumper prefab (scene, x, y, key, frame)
            let enemy = new Enemy(this, element.x * 2, element.y * 2, "platformer_characters", "tile_0008.png").setScale(SCALE);
            this.enemies.push(enemy)
        })
        this.physics.add.collider(my.sprite.player, this.enemies, (p1, enemy) => {
            // push player
            if((p1.x > enemy.x && Math.sign(enemy.lastMove) == 1) || (p1.x < enemy.x && Math.sign(enemy.lastMove) == -1)){
                p1.x += enemy.lastMove;
            }
            if(p1.y < enemy.y - (enemy.displayHeight / 2)){
                p1.setVelocityY(-600);
            }
            //p1.setVelocityX(1000);
        })

        //tile collision specialty
        this.physics.add.collider(my.sprite.player, this.foregroundLayer, (p1, tile) => {
            //console.log(tile.properties.death);
            if(tile.properties.death == true){
                my.sprite.player.body.x = this.playerSpawn.x * 2 - 27;
                my.sprite.player.body.y = this.playerSpawn.y * 2 - 64;
                my.sprite.player.body.velocity.x = 0;
                my.sprite.player.body.velocity.y = 0;
            }
        })
        this.physics.add.collider(my.sprite.player, this.groundLayer, (p1, tile) => {

            if(tile.properties.snowy == true){
                //console.log("snow");
                my.vfx.walking.frame = ['smoke_01.png','smoke_02.png','smoke_03.png','smoke_04.png',];
                //my.vfx.walking.scale = {start: 0.03, end: 0.2};
                my.vfx.walking.lifespan = 500;
                my.vfx.walking.quantity = 4;
                //my.vfx.walking.speedY = 150;
                //my.vfx.walking.gravity = 5;
                //my.vfx.walking.maxAliveParticles = 20;
                my.vfx.walking.alpha = {start: 0.9, end: 0.1};
                my.vfx.walking.frequency = 100;
            }
            else{
                //console.log("no snow");
                my.vfx.walking.frame = ['smoke_03.png', 'smoke_09.png'];
                //my.vfx.walking.scale = {start: 0.03, end: 0.1};
                my.vfx.walking.lifespan = 250;
                my.vfx.walking.quantity = 2;
                //my.vfx.walking.speedY = 0;
                //my.vfx.walking.gravity = 0;
                //my.vfx.walking.frequency = 1;
                //my.vfx.walking.maxAliveParticles = 10;
                my.vfx.walking.alpha = {start: 0.75, end: 0.1};
                my.vfx.walking.frequency = 250;
            }
            //console.log(my.vfx.walking.speedY);
        })

        //movement vfx
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            //random: true, //Effect currently seems to be bugged, according to TA. will return to later if the reason is found
            scale: {start: 0.03, end: 0.1},
            //maxAliveParticles: 8, //Maxes out visible particles at 8. currently results in sudden bursts
            lifespan: 350,
            //gravityY: -400, //Causes particles to rise up in the air after spawning
            alpha: {start: 1, end: 0.1}, 
            gravityY: -50,
            //speedY: -300
        });

        my.vfx.walking.stop();

        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            x: {min:-5, max:5},
            //speedY:{min: -5, max: 0},
            frame: ['smoke_03.png', 'smoke_09.png'],
            scale: {start: 0.03, end: 0.1},
            lifespan: 350,
            quantity: 15,
            //stopAfter: 15,
            gravityY: -400, //Causes particles to rise up in the air after spawning
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.jumping.stop();

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

    }

    update(time,delta) {
        console.log(my.sprite.player.x + "," + my.sprite.player.y);
        if(cursors.left.isDown) {
            // -T-O-D-O-: have the player accelerate to the left
            if(my.sprite.player.body.velocity.x > -500){
                my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
                if(this.cameras.main.followOffset.x < 200){
                    this.cameras.main.followOffset.x += 0.5 * delta;
                    //this.cameras.main.followOffset.x += ((this.cameras.main.followOffset.x / 200) * 0.9 + 0.1) * delta;
                    if(this.cameras.main.followOffset.x > 200)
                        this.cameras.main.followOffset.x = 200;
                }
            }
            else{
                //console.log("capped");
                my.sprite.player.body.velocity.x = -500;
                my.sprite.player.body.setDragX(this.DRAG);
            }
            if(my.sprite.player.body.velocity.x >= 0){
                my.sprite.player.body.setVelocityX(-this.ACCELERATION * 0.25);
            }
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            //particle vfx
            //console.log(my.sprite.player.displayWidth);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
            else{
                my.vfx.walking.stop();
            }

        } else if(cursors.right.isDown) {
            // -T-O-D-O-: have the player accelerate to the right
            if(my.sprite.player.body.velocity.x < 500){
                my.sprite.player.body.setAccelerationX(this.ACCELERATION);
                if(this.cameras.main.followOffset.x > -200){
                    this.cameras.main.followOffset.x -= 0.5 * delta;
                    //this.cameras.main.followOffset.x -= (Math.abs(this.cameras.main.followOffset.x / 200) * 0.9 + 0.1) * delta;
                    if(this.cameras.main.followOffset.x < -200)
                        this.cameras.main.followOffset.x = -200;
                }
            }
            else{
                //console.log("capped");
                my.sprite.player.body.velocity.x = 500;
                my.sprite.player.body.setDragX(this.DRAG);
            }
            //console.log(my.sprite.player.body.velocity.x);
            if(my.sprite.player.body.velocity.x <= 0){
                my.sprite.player.body.setVelocityX(this.ACCELERATION * 0.25);
            }
            //my.sprite.player.body.setDragX(this.DRAG / 2);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            //particle vfx
            my.vfx.walking.startFollow(my.sprite.player, -my.sprite.player.displayWidth/2+10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
            else{
                my.vfx.walking.stop();
            }

        } else {
            // -T-O-D-O-: set acceleration to 0 and have DRAG take over
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
            //console.log("smalling: "+this.cameras.main.followOffset.x);
            if(this.cameras.main.followOffset.x > 0){
                this.cameras.main.followOffset.x -= 0.5 * delta;
                if(this.cameras.main.followOffset.x < 0)
                    this.cameras.main.followOffset.x = 0;
            }
            if(this.cameras.main.followOffset.x < 0){
                this.cameras.main.followOffset.x += 0.5 * delta;
                if(this.cameras.main.followOffset.x > 0)
                    this.cameras.main.followOffset.x = 0;
            }
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            // -T-O-D-O-: set a Y velocity to have the player "jump" upwards (negative Y direction)
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            //my.vfx.walking.startFollow(my.sprite.player, 0, my.sprite.player.displayHeight/2-5, false);
            //my.vfx.jumping.start();
            //console.log(my.vfx.jumping);
            this.add.particles(my.sprite.player.x, my.sprite.player.y + my.sprite.player.displayHeight/2-5, "kenny-particles", {
                x: {min:-25, max:25},
                //speedY:{min: -5, max: 0},
                frame: ['smoke_03.png', 'smoke_09.png'],
                scale: {start: 0.03, end: 0.1},
                lifespan: 550,
                quantity: 15,
                stopAfter: 15,
                gravityY: 300,
                speedY: -100,
                //using {start:-400, end:-200} in the above line results in the particles tping to the top left for some reason??
                alpha: {start: 1, end: 0.1}, 
            });
        }

        //enemy updater
        //console.log(this.enemies);
        for(let e of this.enemies){
            e.update(time);
        }

        //terminal velocity
        //console.log(my.sprite.player.body.velocity.y);
        if(my.sprite.player.body.velocity.y > 1000){
            my.sprite.player.body.velocity.y = 1000;
        }

        //console.log("wut");
        //console.log(my.sprite.player.body.y + ",");// + 
        //console.log(this.map.heightInPixels * 2 - 48);
        //Out of bounds check
        if(my.sprite.player.body.y >= this.map.heightInPixels * 2 - 48){
            //console.log("check");
            my.sprite.player.body.x = this.playerSpawn.x * 2 - 27;
            my.sprite.player.body.y = this.playerSpawn.y * 2 - 64;
            my.sprite.player.body.velocity.x = 0;
            my.sprite.player.body.velocity.y = 0;
        }

        //100 to 300 x, 480 to 360 y
        //check for if the player entered the win zone
        //(really low quality since I'm doing this last minute, oops)
        if(100 <= my.sprite.player.x && my.sprite.player.x <= 300
            && 360 <= my.sprite.player.y && my.sprite.player.y <= 480){
            this.scene.start("creditsScene"); 
        }
    }
}

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, frame) {
        super(scene, x, y, key, frame);
        scene.add.existing(this);               // make it real
        scene.physics.add.existing(this);       // add physics body
        this.body.allowGravity = false; //setGravityY(0);
        //this.body.setVelocityY(0);
        this.body.setImmovable();
        this.centerX = x;
        this.centerY = y;
        this.lastMove = 0;
        //console.log(this);
    }
    update(time){
        //this.body.setVelocityY(0);
        this.lastMove = ((200 * Math.cos(time / 1000)) + this.centerX) - this.x;
        this.x = (200 * Math.cos(time / 1000)) + this.centerX;
        //console.log(this.lastMove);
    }
}