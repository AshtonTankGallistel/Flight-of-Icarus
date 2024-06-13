class Floor extends Phaser.Scene {
    constructor() {
        super("floorScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 800;
        this.DRAG = 1500;    // DRAG < ACCELERATION = icy slide
        //this.physics.world.gravity.y = 1500;
        //this.JUMP_VELOCITY = -700;
        this.PARTICLE_VELOCITY = 50;
        this.CURRENT_ROOM = {x:1,y:1}; // 1,1 is the center
    }

    preload() {
        //Note: if this preload is done in Load.js, the program loses access to the animatedTiles plugin when it changes to this scene
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        
        //Doing this solely for the coin sprite. Can't find a better way to do this lol
        //future note: I am no longer using the coin sprite. i forgot if I used this for something else though, so Im leaving it
        this.load.path = "./assets/"
        this.load.spritesheet("roguelikeSheet", "roguelikeSheet_transparent.png", {
            frameWidth: 16,
            frameHeight: 16
        })

        //projectile
        this.load.image("Ball","coin.png");
        this.load.image("Bullet","flameOrb.png");
        
        //text
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {
        this.enemies = [];
        //add tilemaps for this floor
        this.map = this.add.tilemap("Attic_Border", 16, 16, 18, 13);
        this.roomLock = this.add.tilemap("Attic_TrapBorder", 16, 16, 18, 13);
        this.floors = [];
        //specialRooms store the 3 rooms that always appear, plus a random room
        let specialRooms = ["Attic_Item","Attic_Boss","Attic_Shop","Attic_" + Math.ceil(Math.random() * ROOMCOUNT)];
        //for loop
        for(let r = 0; r < 3; r++){ // row
            this.floors.push([]);
            for(let c = 0; c < 3; c++){ // col
                let mapName = "Attic_" + Math.ceil(Math.random() * ROOMCOUNT); //1 to 3
                if(r == 1 && c == 1){ // center square
                    mapName = "Attic_0";
                }
                else if(r % 2 == 0 && c % 2 == 0){ // corner square
                    //If a corner, it grabs a random special room, and removes it from the list of special rooms
                    let randRoom = Math.floor(Math.random() * specialRooms.length);
                    mapName = specialRooms[randRoom];
                    specialRooms.splice(randRoom,1);
                }
                console.log(mapName);
                let temp = this.add.tilemap(mapName,16,16,18,13);
                this.floors[r].push(temp);
            }
        }

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("roguelikeSheet", "tilemap_tiles");

        //console.log(this.tileset);

        // Create a layer
        //moon tile
        //this.farBackgroundLayer = this.map.createLayer("far-background", this.tilesetmoon, 0, 0);//.setScrollFactor(0.1);
        //this.farBackgroundLayer.setScale(2.0);
        //reg tiles
        this.groundLayers = [];
        this.blockLayers = [];
        this.roomStatus = []; //Tracks if rooms have enemy encounters in them; 'clear','enemy','boss'
        this.floorItem;
        this.floorLadder;
        for(let r = 0; r < 3; r++){ // row
            this.groundLayers.push([]);
            this.blockLayers.push([]);
            this.roomStatus.push([]);
            for(let c = 0; c < 3; c++){ // column
                //groundLayer
                let temp = this.floors[r][c].createLayer("Ground-n-Walls", this.tileset,
                    r * config.width - config.width, c * config.height - config.height);
                temp.setScale(SCALE);
                this.groundLayers[r].push(temp);
                // Make it collidable
                this.groundLayers[r][c].setCollisionByProperty({
                    collides: true
                });

                //blockLayer
                let temp2 = this.floors[r][c].createLayer("Blocks-n-Layouts", this.tileset,
                    r * config.width - config.width, c * config.height - config.height);
                temp2.setScale(SCALE);
                this.blockLayers[r].push(temp2);
                // Make it collidable
                this.blockLayers[r][c].setCollisionByProperty({
                    collides: true
                });

                //Item spawner
                let itemSpawn = this.floors[r][c].findObject("Enemies-n-Items", obj => obj.name === "Item");
                if(itemSpawn != null){
                    this.floorItem = this.physics.add.sprite(itemSpawn.x * SCALE + r * config.width - config.width,
                        itemSpawn.y * SCALE + c * config.height - config.height,
                        "Ball");//.setScale(SCALE);
                    //Note for future me; objects in the tiled layer have their center at the bottom left corner,
                    //while phaser has them in the center.
                    //console.log(this.floorItem.x,itemSpawn.x,itemSpawn.x * SCALE, r * config.width - config.width);
                }

                //Ladder spawner; temp, they should spawn after the boss fight
                let ladderSpawn = this.floors[r][c].findObject("Enemies-n-Items", obj => obj.name === "Ladder");
                if(ladderSpawn != null){
                    this.floorLadder = this.physics.add.sprite(ladderSpawn.x * SCALE + r * config.width - config.width,
                        ladderSpawn.y * SCALE + c * config.height - config.height,
                        "Ball").setScale(SCALE);
                    this.floorLadder.anims.play('ladder');
                    this.floorLadder.body.setSize(4 * SCALE, 4 * SCALE);
                    //Note for future me; objects in the tiled layer have their center at the bottom left corner,
                    //while phaser has them in the center.
                    console.log(this.floorLadder.x,ladderSpawn.x,ladderSpawn.x * SCALE, r * config.width - config.width);
                }

                //enemy check
                let enemyExists = this.floors[r][c].findObject("Enemies-n-Items", obj => obj.name === "Enemy");
                let bossExists = this.floors[r][c].findObject("Enemies-n-Items", obj => obj.name === "Boss");
                if(bossExists != null){
                    this.roomStatus[r].push('boss');
                }
                else if(enemyExists != null){
                    this.roomStatus[r].push('enemy');
                }
                else{
                    this.roomStatus[r].push('clear');
                }
            }
        }
        console.log(this.roomStatus);
        this.borderLayer = this.map.createLayer("Ground-n-Walls", this.tileset, -config.width, -config.height);
        this.borderLayer.setScale(SCALE);
        this.borderLayer.setCollisionByProperty({
            collides: true
        });
        this.roomLockLayer = this.roomLock.createLayer("Ground-n-Walls", this.tileset, -(config.width * 5), -(config.height * 5));
        this.roomLockLayer.setScale(SCALE);
        this.roomLockLayer.setCollisionByProperty({
            collides: true
        });

        //Player
        my.sprite.player = this.physics.add.sprite(config.width / 2, config.height / 2, "platformer_characters", "tile_0000.png").setScale(SCALE - 2)
        // Enable collision handling
        for(let r = 0; r < 3; r++){ // row
            for(let c = 0; c < 3; c++){ // column
                this.physics.add.collider(my.sprite.player, this.groundLayers[r][c]);
                this.physics.add.collider(my.sprite.player, this.blockLayers[r][c]);
            }
        }
        this.physics.add.collider(my.sprite.player, this.borderLayer);
        this.physics.add.collider(my.sprite.player, this.roomLockLayer);
        this.physics.add.overlap(my.sprite.player, this.floorItem, (obj1, obj2) => {
            obj2.destroy();
            playerStats.itemTotal += 1;
        })
        //temp; Below overlap should be added when ladder is created, not here
        this.physics.add.overlap(my.sprite.player, this.floorLadder, (obj1, obj2) => {
            //sceneChange
            this.scene.start("floorTransScene");
        })

        //projectile code
        this.projectiles = {
            bullets: [],
            shootCooldown: 500, //time between bullets
            shootTimer: 0 //time since last shot
        };

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();
        wasd = {
            W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        // camera code
        this.cameras.main.setZoom(this.SCALE);
        this.cameraMoving = false;
        this.cameraGoal = {
            oldX: 0,
            oldY: 0,
            x: 0,
            y: 0
        }
        this.cameraMoveTimer = 0;
        this.camTimeToMove = 300;
        this.camMoveLerp = (x,y,time) =>{
            let moveSpeed = Phaser.Tweens.Builders.GetEaseFunction("Power3");
            //console.log("movespeed: " + moveSpeed(time));
            return x + moveSpeed(time) * (y - x);
        };

        // UI
        //hp
        my.sprite.healthPoints = [];
        for(let i = 0; i < my.stats.maxHp; i++){
            let heart = this.add.sprite(16 + 32 * i,16, "Ball").setScrollFactor(0).anims.play("heartFilled");
            heart.setScale(SCALE);
            heart.x = heart.displayWidth * (i + 0.5);
            heart.y = heart.displayHeight * 0.5;
            my.sprite.healthPoints.push(heart);
        }
        //money
        my.text.money = this.add.text(0, my.sprite.healthPoints[0].displayHeight, `$${ my.stats.money }`, { 
            fontFamily: "rocketSquare",
            fontSize: '64px',
            backgroundColor: '#000000' 
        }).setScrollFactor(0)

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-G', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

    }
    
    update(time,delta){
        //console.log(this.cameras.main.x);
        // Player movement ----------------------------------------<><>
        // Horizontal
        if(wasd.A.isDown && !wasd.D.isDown) { // left
            if(my.sprite.player.body.velocity.x > -500){
                my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
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
            //my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            //my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

        } else if(wasd.D.isDown && !wasd.A.isDown) { // right
            if(my.sprite.player.body.velocity.x < 500){
                my.sprite.player.body.setAccelerationX(this.ACCELERATION);
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
            //my.vfx.walking.startFollow(my.sprite.player, -my.sprite.player.displayWidth/2+10, my.sprite.player.displayHeight/2-5, false);
            //my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);

        } else {
            // -T-O-D-O-: set acceleration to 0 and have DRAG take over
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            if(!(wasd.W.isDown || wasd.S.isDown)){
                my.sprite.player.anims.play('idle');
            }
            //my.vfx.walking.stop();
        }
        // Vertical
        if(wasd.W.isDown && !wasd.S.isDown) { // up
            if(my.sprite.player.body.velocity.y > -500){
                my.sprite.player.body.setAccelerationY(-this.ACCELERATION);
            }
            else{
                //console.log("capped");
                my.sprite.player.body.velocity.y = -500;
                my.sprite.player.body.setDragY(this.DRAG);
            }
            if(my.sprite.player.body.velocity.y >= 0){
                my.sprite.player.body.setVelocityY(-this.ACCELERATION * 0.25);
            }
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            //particle vfx
            //console.log(my.sprite.player.displayWidth);
            //my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            //my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

        } else if(wasd.S.isDown && !wasd.W.isDown) { // down
            if(my.sprite.player.body.velocity.y < 500){
                my.sprite.player.body.setAccelerationY(this.ACCELERATION);
            }
            else{
                //console.log("capped");
                my.sprite.player.body.velocity.y = 500;
                my.sprite.player.body.setDragY(this.DRAG);
            }
            //console.log(my.sprite.player.body.velocity.x);
            if(my.sprite.player.body.velocity.y <= 0){
                my.sprite.player.body.setVelocityY(this.ACCELERATION * 0.25);
            }
            //my.sprite.player.body.setDragX(this.DRAG / 2);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            //particle vfx
            //my.vfx.walking.startFollow(my.sprite.player, -my.sprite.player.displayWidth/2+10, my.sprite.player.displayHeight/2-5, false);
            //my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);

        } else {
            // -T-O-D-O-: set acceleration to 0 and have DRAG take over
            my.sprite.player.body.setAccelerationY(0);
            my.sprite.player.body.setDragY(this.DRAG);
            if(!(wasd.A.isDown || wasd.D.isDown)){
                my.sprite.player.anims.play('idle');
            }
            //my.vfx.walking.stop();
        }

        // Shooting Controls ----------------------------------------<><>
        this.projectiles.shootTimer += delta;
        if(this.projectiles.shootTimer > this.projectiles.shootCooldown
            && (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown)){
            //Determine direction the bullet will go in
            let dir = { x: 0, y: 0};
            if(cursors.left.isDown) { // left
                dir.x -= 1;
            }
            else if(cursors.right.isDown) { // right
                dir.x += 1;
            }
            if(cursors.up.isDown) { // up
                dir.y -= 1;
            }
            else if(cursors.down.isDown) { // down
                dir.y += 1;
            }
            // create bullet and send it to the list of bullets currently in the game
            var temp = new bullet(this, my.sprite.player.x, my.sprite.player.y, dir);
            this.projectiles.bullets.push(temp);
            this.projectiles.shootTimer = 0;
        }
        // update bullet position
        for(let i = 0; i < this.projectiles.bullets.length; i++){//(let bullet of this.projectiles.bullets){
            this.projectiles.bullets[i].update(delta);
            //console.log(this.projectiles.bullets[i].sprite);
            if(this.projectiles.bullets[i].sprite.active == false){
                this.projectiles.bullets[i] = null; //setting to null removes ref to object, deleting it
                this.projectiles.bullets.splice(i,1); //then, remove null pointer
                i--;
            }
        }
        // update enemies
        for(let i = 0; i < this.enemies.length; i++){//let e of this.enemies){
            //console.log(my.sprite.player.body.x,my.sprite.player.body.y);
            this.enemies[i].update(delta);
            if(this.enemies[i].sprite.active == false){
                //console.log(this.enemies[i]);
                this.enemies[i] = null;
                this.enemies.splice(i,1);
                i--;
                console.log("enemies" + this.enemies.length);
                if(this.enemies.length == 0){
                    this.unLockRoom();
                }
            }
        }
        //update invulnerability
        my.stats.invulnerable -= delta;

        //Camera update ----------------------------------------<><>
        //Want to use an object but can't find how to add an invisible object
        //Note: USE scrollX instead of x! x changes position where player sees it, not where the camera is pointed
        if(this.cameraMoving == true){
            //console.log(this.cameras.main.y);
            this.cameraMoveTimer = Math.min(this.camTimeToMove, this.cameraMoveTimer + delta);
            //console.log(this.camMoveLerp(this.cameraGoal.oldX, this.cameraGoal.x, this.cameraMoveTimer / this.camTimeToMove));
            if(this.cameras.main.scrollX != this.cameraGoal.x){
                this.cameras.main.scrollX = this.camMoveLerp(this.cameraGoal.oldX, this.cameraGoal.x, this.cameraMoveTimer / this.camTimeToMove);
                //this.cameras.main.scrollX = this.cameraGoal.x
                //console.log(this.cameras.main.scrollX + "," + this.cameraGoal.x);
            }
            else if(this.cameras.main.scrollY != this.cameraGoal.y){
                this.cameras.main.scrollY = this.camMoveLerp(this.cameraGoal.oldY, this.cameraGoal.y, this.cameraMoveTimer / this.camTimeToMove);
                //this.cameras.main.scrollY = this.cameraGoal.y
                //console.log(this.cameras.main.scrollY + "," + this.cameraGoal.y);
            }
            else{
                //console.log("what");
                this.cameraMoving = false;
                this.cameraGoal.oldY = this.cameraGoal.y;
                this.cameraGoal.oldX = this.cameraGoal.x;
                this.cameraMoveTimer = 0;
            }
        }
        else{
            //console.log(my.sprite.player.x + "," + my.sprite.player.y);
            if(my.sprite.player.x < this.cameras.main.scrollX){ //left
                this.CURRENT_ROOM.x -= 1;
                this.cameraMoving = true;
                this.cameraGoal.x -= config.width;
            }
            else if(my.sprite.player.x > this.cameras.main.scrollX + config.width){ //right
                this.CURRENT_ROOM.x += 1;
                this.cameraMoving = true;
                this.cameraGoal.x += config.width;
            }
            else if(my.sprite.player.y < this.cameras.main.scrollY){ //up
                this.CURRENT_ROOM.y -= 1;
                this.cameraMoving = true;
                this.cameraGoal.y -= config.height;
            }
            else if(my.sprite.player.y > this.cameras.main.scrollY + config.height){ //down
                this.CURRENT_ROOM.y += 1;
                this.cameraMoving = true;
                this.cameraGoal.y += config.height;
            }
            if(this.cameraMoving == true && (this.roomStatus[this.CURRENT_ROOM.x][this.CURRENT_ROOM.y] == 'enemy'
                || this.roomStatus[this.CURRENT_ROOM.x][this.CURRENT_ROOM.y] == 'boss')){
                //console.log("huh");
                this.lockRoom();
            }
        }
    }

    //locks the room when you enter a room with enemies in it
    lockRoom(){
        //Move the 'lock layer' (a border that prevents the player moving out of room) to the room the player is in
        //need to offset due to roomLockLayer being 2 tiles taller/wider than the room
        this.roomLockLayer.x = this.groundLayers[this.CURRENT_ROOM.x][this.CURRENT_ROOM.y].x - 16 * SCALE;//this.roomLockLayer.tileWidth;
        this.roomLockLayer.y = this.groundLayers[this.CURRENT_ROOM.x][this.CURRENT_ROOM.y].y - 16 * SCALE;//this.roomLockLayer.tileHeight;
        
        // enemy spawn
        let tempGrid = this.layersToGrid(this.floors[this.CURRENT_ROOM.x][this.CURRENT_ROOM.y],[this.groundLayers,this.blockLayers]);
        for(let enemySpawn of this.floors[this.CURRENT_ROOM.x][this.CURRENT_ROOM.y].getObjectLayer("Enemies-n-Items").objects){
            console.log(enemySpawn.properties[0].value);
            let tempenemy;
            switch(enemySpawn.properties[0].value){ //properties[0] points to the Type property
                case "Walker":
                    tempenemy = new walker(enemySpawn.Type,this,tempGrid,enemySpawn.x,enemySpawn.y);
                    break;
                case "Shooter":
                    tempenemy = new shooter(enemySpawn.Type,this,tempGrid,enemySpawn.x,enemySpawn.y);
                    break;
                default:
                    tempenemy = new enemy(enemySpawn.Type,this,tempGrid,enemySpawn.x,enemySpawn.y);
                    break;
            }
            this.enemies.push(tempenemy);
        }
    }
    
    //unlocks the room when you clear all enemies
    unLockRoom(){
        console.log("unlocking room");
        this.roomLockLayer.x = - (config.width * 5);
        this.roomLockLayer.y = - (config.height * 5);
        this.roomStatus[this.CURRENT_ROOM.x][this.CURRENT_ROOM.y] = 'clear';
    }

    // Updates the UI. What section gets updated is determined by the string inputted for 'section'
    updateUI(section){
        console.log("bruh" + my.stats.hp);
        switch(section){
            case "hp":
                for(let i = 0; i < my.stats.maxHp; i++){
                    if(i >= my.stats.hp - 1){
                        my.sprite.healthPoints[i].anims.play("heartEmpty");
                    }
                    else{
                        my.sprite.healthPoints[i].anims.play("heartFilled");
                    }
                }
                break;
            case "money":
                my.text.money.text = `$${ my.stats.money }`;
                break;
            default:
                break;
        }
    }

    // Uses the tile layer information in this.map and outputs
    // an array which contains the tile ids of the visible tiles on screen.
    // This array can then be given to Easystar for use in path finding.
    layersToGrid(mapArray) {
        //console.log(mapArray);
        //console.log(mapArray.layers);
        let grid = [];
        // Initialize grid as two-dimensional array
        for(let y = 0; y < 13; y++){ // 13 = height
            grid.push([]);
            for(let x = 0; x < 18; x++){ //18 = width
                grid[y].push(0); //All values should get replaced eventually, so the pre-existing values don't matter for this project
            }
        }

        // Loop over layers to find tile IDs, store in grid
        for(let mapLayer of mapArray.layers){
            for(let y = 0; y < 13; y++){ //13 = height
                for(let x = 0; x < 18; x++){ //18 = wodth
                    //console.log(x + ',' + y);
                    if(mapLayer.tilemapLayer.getTileAt(x,y) != null){
                        grid[y][x] = mapLayer.tilemapLayer.getTileAt(x,y).index;
                    }
                }
            }
        }
        //console.log(grid);
        return grid;
    }
}

class bullet{
    constructor(scene, x, y, direction, enemyBullet = false){ // direction = {x,y}, x and y values will be 'smoothed' in const
        this.scene = scene
        this.sprite = scene.physics.add.sprite(x,y,"Bullet");
        this.sprite.body.setCircle(29).setOffset(7 * SCALE, 7 * SCALE);
        this.dir = {x:0,y:0};
        if(Math.abs(direction.x) + Math.abs(direction.y) != 1){ //If not alr smoothed, smooth s.t. x + y = 1/-1
            let combined = Math.abs(direction.x) + Math.abs(direction.y);
            this.dir.x = direction.x / combined;
            this.dir.y = direction.y / combined;
        }
        else{
            this.dir = direction;
        }
        this.strength;
        //console.log(scene.CURRENT_ROOM.x,scene.CURRENT_ROOM.y);
        scene.physics.add.collider(this.sprite, scene.groundLayers[scene.CURRENT_ROOM.x][scene.CURRENT_ROOM.y], (b1, tile) => {
            this.destroySprite();  
        })
        scene.physics.add.collider(this.sprite, scene.blockLayers[scene.CURRENT_ROOM.x][scene.CURRENT_ROOM.y], (b1, tile) => {
            this.destroySprite();  
        })
        scene.physics.add.collider(this.sprite, scene.borderLayer, (b1, tile) => {
            this.destroySprite();  
        })
        //console.log(scene.enemies);
        if(enemyBullet == false){ //player's bullet
            //The below loop sets up collision for each enemy.
            //Simply trying to add a collider for the whole array like above doesn't work sadly
            for(let en of scene.enemies){
                scene.physics.add.collider(this.sprite, en.sprite, (b1, e1) => {
                    en.hp -= my.stats.atk;
                    en.checkHealth()
                    this.destroySprite();  
                })
            }
        }
        else{ //enemy's bullet
            scene.physics.add.collider(my.sprite.player, this.sprite, (p1, b1) => {
                if(my.stats.invulnerable <= 0){
                    this.scene.updateUI("hp");
                    my.stats.hp -=1;
                    my.stats.invulnerable = 1400; //1.4 secs of invincibility
                    this.scene.scene.start("gameoverScene");
                    this.destroySprite();
                }
            })
        }
        this.speed = 650;
        this.bulletLifetime = 750;
    }
    update(delta){
        //If the sprite doesn't exist (ie this bullet is done) no code is ran
        //console.log(this);
        if(this.sprite != null && this.sprite.body != null){
            //this.sprite.x += this.speed * this.dir.x * delta;
            //this.sprite.y += this.speed * this.dir.y * delta;
            this.sprite.setVelocityX(this.speed * this.dir.x);
            this.sprite.setVelocityY(this.speed * this.dir.y);
            //If enough time has passed, the bullet gets "deleted"
            this.bulletLifetime -= delta;
            if(this.bulletLifetime <= 0){
                this.sprite.destroy();
            }
        }
    }
    destroySprite(){
        this.sprite.destroy();
        //add destroy particle effect later
    }
}

class enemy{
    constructor(type, scene, roomGrid, x, y){
        //Sprite setup
        this.name = type;
        this.sprite = scene.physics.add.sprite(SCALE * x + ((scene.CURRENT_ROOM.x - 1) * config.width),
                                        SCALE * y + ((scene.CURRENT_ROOM.y - 1) * config.height),"Ball").setOrigin(0,0);
        this.sprite.anims.play('enemyWalk').setScale(SCALE - 1);
        this.sprite.setSize(TILESIZE - 1,TILESIZE - 1);//.setOffset(0, 0);
        //this.sprite.body.x -= this.sprite.displayWidth / 2;
        //this.sprite.body.y -= this.sprite.displayheight / 2;
        this.scene = scene;

        //player collision setup
        scene.physics.add.collider(my.sprite.player, this.sprite, (p1, e1) => {
            if(my.stats.invulnerable <= 0){
                this.scene.updateUI("hp");
                my.stats.hp -=1;
                my.stats.invulnerable = 1400; //1.4 secs of invincibility
                this.scene.scene.start("gameoverScene");
            }
        })

        //stat setup
        this.hp = 3 * multiplier;

        //pathfinding setup
        this.finder = new EasyStar.js();
        //let roomGrid = this.layersToGrid([roomFloor, roomBoxes]); //run this for each room, send to every enemy
        //Below has the 4 rows of floor panels
        let walkables = [119, 120, 121, 122, 123, 124, 176, 177, 178, 179, 180, 181,
                        233, 234, 235, 236, 237, 238, 290, 291, 292, 293, 294, 295];
        this.finder.setGrid(roomGrid);
        this.finder.setAcceptableTiles(walkables);
        this.tweens;
        this.active = true;
        // offset used for pathfinding. Easystar acts from 0 to width/height, expecting the room to be centered
        // so we need to offset before running calculations, then reset back after running calcs for calcing tweens
        this.offset = {x:(scene.CURRENT_ROOM.x - 1) * 18, y:(scene.CURRENT_ROOM.y - 1) * 13};
        this.timer = 750;
    }
    update(delta){
        console.log("base");
    }
    //handle defeat
    checkHealth(){
        console.log("hp: " + this.hp);
        if(this.hp <= 0){
            if(Math.random() < 0.75){
                new coin(this.scene,this.sprite.x,this.sprite.y);
            }
            else{
                new heartDrop(this.scene,this.sprite.x,this.sprite.y);
            }
            this.sprite.destroy();
        }
    }
}

//Enemy subclasses
class walker extends enemy{
    update(delta){
        console.log("walker");
        this.timer -= delta;
        //console.log(this.active === true, this.timer <= 0);
        if(this.active === true && this.timer <= 0 && this.sprite != null){
            this.active = false;
            this.handleClick(my.sprite.player.body,this.scene);
        }
    }
    //pathfinding stuff
    handleClick(pointer) {
        let x = pointer.x / SCALE;
        let y = pointer.y / SCALE;
        let toX = Math.floor(x/TILESIZE) - this.offset.x;
        var toY = Math.floor(y/TILESIZE) - this.offset.y;
        var fromX = Math.floor(this.sprite.x/(SCALE * TILESIZE)) - this.offset.x;
        var fromY = Math.floor(this.sprite.y/(SCALE * TILESIZE)) - this.offset.y;
        //console.log(this.offset);
        //console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');
        if(!(toX == fromX && toY == fromY)){ // && (0 <= fromX  && fromX <= 18)&& (0 <= fromY  && fromY <= 13)){
            //console.log(x,y,this.sprite.x,this.sprite.y,fromX, fromY, toX, toY);
            this.finder.findPath(fromX, fromY, toX, toY, (path) => {
                //console.log("hah");
                if (path === null) {
                    //console.warn("Path was not found.");
                    //Enemy can't currently reach player; check again until they can
                    this.active = true;
                } else {
                    //console.log(path);
                    this.moveCharacter(path, this.sprite);
                }
            });
            //console.log("ah");
            this.finder.calculate(); // ask EasyStar to compute the path
            // When the path computing is done, the arrow function given with
            // this.finder.findPath() will be called.
        }
        else{
            // enemy isn't moving, so we let it check again until it can
            this.active = true;
        }
    }
    moveCharacter(path, character) {
    // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
    var tweensLocal = [];
    for(var i = 0; i < 1/*path.length-1*/; i++){
        var ex = path[i+1].x + this.offset.x;
        var ey = path[i+1].y + this.offset.y;
        let tempTween = this.scene.tweens.add({
            targets: character,
            x: ex*this.scene.map.tileWidth*SCALE,
            y: ey*this.scene.map.tileHeight*SCALE,
            duration: 250
        });
        tempTween.on('complete', () => {
            tempTween.stop();
            this.active = true;
            //console.log("end of a tween!");
        });
        tweensLocal.push(tempTween);
    }

    /*
    this.scene.tweens.chain({
        targets: character,
        tweens: tweensLocal
    });
    */

    }
}

class shooter extends enemy{
    constructor(type, scene, roomGrid, x, y){
        super(type, scene, roomGrid, x, y);
        this.shootTimer = 1250;
    }
    update(delta){
        this.timer -= delta;
        //console.log(this.active === true, this.timer <= 0);
        if(this.active === true && this.timer <= 0 && this.sprite != null){
            this.active = false;

            //Goal code; will try to move to somewhere on the opposite half of the room. which 'half' (hor or ver) is random
            let xChange = 0;
            let yChange = 0;
            if(Math.random() < 0.5){ //horizontal change
                xChange = Math.floor(Math.random() * 8); // 0 to 8
                yChange = Math.floor(Math.random() * 4) - 2; // -2 to 2
                if(Math.floor(this.sprite.x/(SCALE * TILESIZE)) - this.offset.x > 9){ // ie enemy is on right half of screen
                    xChange *= -1; //made negative, so that it moves up
                }
            }
            else{ //vertical change
                xChange = Math.floor(Math.random() * 4) - 2; // -2 to 2
                yChange = Math.floor(Math.random() * 4); // 0 to 4
                if(Math.floor(this.sprite.y/(SCALE * TILESIZE)) - this.offset.y > 6.5){ // ie enemy is on bottom half of screen
                    yChange *= -1; //made negative, so that it moves left
                }
            }
            //It's entirely possible for this to result in a goal impossible to reach, requiring a few attempts to work. Some may call this a bug.
            //I call it the enemy having trouble deciding where to go, giving the player a few frame advantage against it in more complex rooms

            console.log("move: " + this.sprite.x,xChange * SCALE * TILESIZE);
            //console.log("why");
            this.handleClickShooter({x: this.sprite.x + xChange * SCALE * TILESIZE, y: this.sprite.y + yChange * SCALE * TILESIZE},this.scene);
        }

        //shooting updater
        this.shootTimer -= delta;
        if(this.shootTimer <= 0){
            this.shootTimer = 750;
            let dir ={
                x: my.sprite.player.x - this.sprite.x,
                y: my.sprite.player.y - this.sprite.y
            }
            var temp = new bullet(this.scene, this.sprite.x, this.sprite.y, dir, true);
            this.scene.projectiles.bullets.push(temp);
            
        }
    }
    //Pathfinding stuff
    handleClickShooter(pointer) {
        let x = pointer.x / SCALE;
        let y = pointer.y / SCALE;
        let toX = Math.floor(x/TILESIZE) - this.offset.x;
        var toY = Math.floor(y/TILESIZE) - this.offset.y;
        var fromX = Math.floor(this.sprite.x/(SCALE * TILESIZE)) - this.offset.x;
        var fromY = Math.floor(this.sprite.y/(SCALE * TILESIZE)) - this.offset.y;
        console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');
        if(!(toX == fromX && toY == fromY) && (1 <= toX  && toX <= 17)&& (2 <= toY  && toY <= 12)){
            //console.log(x,y,this.sprite.x,this.sprite.y,fromX, fromY, toX, toY);
            this.finder.findPath(fromX, fromY, toX, toY, (path) => {
                //console.log("hah");
                if (path === null) {
                    //console.warn("Path was not found.");
                    //Enemy can't currently reach player; check again until they can
                    this.active = true;
                } else {
                    //console.log(path);
                    this.moveCharacterShooter(path, this.sprite);
                }
            });
            //console.log("ah");
            this.finder.calculate(); // ask EasyStar to compute the path
            // When the path computing is done, the arrow function given with
            // this.finder.findPath() will be called.
        }
        else{
            // enemy isn't moving, so we let it check again until it can
            this.active = true;
        }
    }
    moveCharacterShooter(path, character) {
        // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
        var tweensLocal = [];
        for(var i = 0; i < path.length-1; i++){
            var ex = path[i+1].x + this.offset.x;
            var ey = path[i+1].y + this.offset.y;
            //adding directly to scene.tweens results in all tweens running at once, need to chain
            let tempTween = ({//this.scene.tweens.add({ 
                targets: character,
                x: ex*this.scene.map.tileWidth*SCALE,
                y: ey*this.scene.map.tileHeight*SCALE,
                duration: 250
            });
            /*
            if(i == path.length - 2){
                tempTween.on('complete', () => {
                    tempTween.stop();
                    this.active = true;
                    //console.log("end of a tween!");
                });
            }
            */
            tweensLocal.push(tempTween);
        }
        //console.log(tweensLocal);
    
        
        this.scene.tweens.chain({
            targets: character,
            tweens: tweensLocal
        });
        //Grab the last tween of that chain. Yes, that is the code I am using to do this.
        let tempTween = this.scene.tweens.tweens[this.scene.tweens.tweens.length - 1].data[this.scene.tweens.tweens[this.scene.tweens.tweens.length - 1].data.length - 1];
        tempTween.on('complete', () => {
            tempTween.stop();
            this.active = true;
            console.log("end of a tween!");
        });
    
    }
}

// grabbable drops
class coin{
    constructor(scene,x,y){
        console.log("making coin!");
        this.sprite = scene.physics.add.sprite(x, y,"Ball");
        this.sprite.body.setCircle(29).setOffset(7 * SCALE, 7 * SCALE);
        scene.physics.add.collider(my.sprite.player, this.sprite, (p1, c1) => {
            console.log("coin got!");
            my.stats.money += 1;
            scene.updateUI("money");
            c1.destroy();
        })
    }
}

class heartDrop{
    constructor(scene,x,y){
        console.log("making heart!");
        this.sprite = scene.physics.add.sprite(x, y,"Ball").anims.play("heartFilled").setScale(SCALE).setSize(TILESIZE * 4/5,TILESIZE * 4/5);
        //this.sprite.body.setCircle(29).setOffset(7 * SCALE, 7 * SCALE);
        scene.physics.add.collider(my.sprite.player, this.sprite, (p1, c1) => {
            console.log("heart got!");
            my.stats.hp += 1;
            scene.updateUI("hp");
            c1.destroy();
        })
    }
}