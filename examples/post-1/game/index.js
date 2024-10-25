
let coins = [{
    x: 300,
    y: 925,
    name: 'coin',
    height: 50,
    width: 50,
 },
 {
    x: 200,
    y: 925,
    name: 'coin',
    height: 50,
    width: 50,
        },
{
    x: 100,
    y: 925,
    name: 'coin',
    height: 50,
    width: 50,
  },{
    x: 400,
    y: 925,
    name: 'coin',
    height: 50,
    width: 50,
  },{
    x: 500,
    y: 925,
    name: 'coin',
    height: 50,
    width: 50,
  }];


const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 680,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);
let cursors;
let player;
let showDebug = false;
let score = 0
let visitedPlaces = 0
let scoreText

function preload() {
  this.load.image("audio-play-button", "../assets/images/audio-play-icon.png");
  this.load.image("audio-mute-button", "../assets/images/audio-mute-icon.png");
  this.load.audio('backgroundMusic', '../assets/backgorund-music.mp3')
  this.load.image("tiles", "../assets/tilesets/tuxmon-sample-32px-extruded.png");
  this.load.tilemapTiledJSON("map", "../assets/tilemaps/tuxemon-town.json");
  this.load.atlas("atlas", "../assets/atlas/atlas.png", "../assets/atlas/atlas.json");
  this.load.image('coin', '../assets/images/pixel-coin.png')
}

function create() {
  const music = this.sound.add('backgroundMusic');
  music.play({ loop: true, volume: 0 });
  
  const map = this.make.tilemap({ key: "map" });
  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

  const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
  const worldLayer = map.createLayer("World", tileset, 0, 0);
  const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);

  let isMuted = false;
  let audioButton = this.add.image(50, 140, 'audio-play-button')
    .setDisplaySize(100, 100)
    .setScrollFactor(0)
    .setInteractive();

  audioButton.on('pointerdown', () => {
    isMuted = !isMuted; 
    if (isMuted) {
      music.pause(); 
      audioButton.setTexture('audio-mute-button'); 
    } else {
      music.resume(); 
      audioButton.setTexture('audio-play-button'); 
    }
  });
 
  worldLayer.setCollisionByProperty({ collides: true });
  aboveLayer.setDepth(10);

  const spawnPoint = map.findObject("Objects", (obj) => obj.name === "Spawn Point");
  player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
    .setSize(30, 40)
    .setOffset(0, 24);

  this.physics.add.collider(player, worldLayer);

  const anims = this.anims;
  anims.create({
    key: "misa-left-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-left-walk.",
      start: 0,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  anims.create({
    key: "misa-right-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-right-walk.",
      start: 0,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  anims.create({
    key: "misa-front-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-front-walk.",
      start: 0,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  anims.create({
    key: "misa-back-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-back-walk.",
      start: 0,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });

  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  cursors = this.input.keyboard.createCursorKeys();

  this.add
    .text(10, 5, `Coins collected: ${score}`, {
      font: "18px monospace",
      fill: "#fff",
      padding: { x: 20, y: 10 },
      backgroundColor: "#000",
    })
    .setScrollFactor(0)
    .setDepth(30);

   this.add
    .text(10, 56, `Visited Places: ${visitedPlaces}`, {
      font: "18px monospace",
      fill: "#fff",
      padding: { x: 25, y: 10 },
      backgroundColor: "#000",
    })
    .setScrollFactor(0)
    .setDepth(30);

  
 
   const coins = this.physics.add.group();

  for (let i = 0; i < 10; i++) {
    const x = Phaser.Math.Between(150, 1150);
    const y = Phaser.Math.Between(150, 1150);
    coins.create(x, y, 'coin').setDisplaySize(50, 50);
  }
  
  this.physics.add.overlap(player, coins, collectCoins, null, this);
}

function update(time, delta) {

  let prevVelocity
  const speed = 175;
 
     prevVelocity = player.body.velocity.clone();
   player.body.setVelocity(0);
   if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }
  player.body.velocity.normalize().scale(speed);

  


  if (cursors.left.isDown) {
    player.anims.play("misa-left-walk", true);
  } else if (cursors.right.isDown) {
    player.anims.play("misa-right-walk", true);
  } else if (cursors.up.isDown) {
    player.anims.play("misa-back-walk", true);
  } else if (cursors.down.isDown) {
    player.anims.play("misa-front-walk", true);
  } else {
    player.anims.stop();

    if (prevVelocity.x < 0) player.setTexture("atlas", "misa-left");
    else if (prevVelocity.x > 0) player.setTexture("atlas", "misa-right");
    else if (prevVelocity.y < 0) player.setTexture("atlas", "misa-back");
    else if (prevVelocity.y > 0) player.setTexture("atlas", "misa-front");
  }

}

function collectCoins(coin) {
  score += 10
  scoreText = 'Coins collected: ' + score
  coin.destroy();
}


