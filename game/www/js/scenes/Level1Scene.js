/* LEVEL 1 — "RUN, COLA, RUN!"
 * Coca-Cola runs down the road. Six Georgian/Italian foods fall toward you.
 * Touch ANY food and the level restarts. Survive to the finish line and you
 * move on to choose one of three cars. */
class Level1Scene extends Phaser.Scene {
  constructor() {
    super('Level1Scene');
  }

  create() {
    this.dead = false;
    this.won = false;
    this.progress = 0;
    this.spawnAcc = 0;
    this.laneOffset = 0;
    this.foods = [];

    this.GOAL_TIME = 22; // seconds you must survive
    this.FOODS = ['🫓', '🥟', '🍕', '🍝', '🥗', '🍖']; // khachapuri, khinkali, pizza, pasta, salad, meat

    makeGradientBg(this, '#3a3a4a', '#15151f');

    // Road
    this.add.rectangle(GAME_W / 2, GAME_H / 2, 300, GAME_H, 0x2b2b38).setDepth(-50);
    this.laneGfx = this.add.graphics().setDepth(-49);

    // Player: a red "cola" disc with the cup emoji on top.
    const disc = this.add.circle(0, 0, 30, 0xe60023).setStrokeStyle(4, 0xffffff);
    const face = makeEmoji(this, 0, 0, '🥤', 40);
    this.player = this.add.container(GAME_W / 2, GAME_H - 110, [disc, face]);
    this.playerTargetX = GAME_W / 2;

    // HUD
    this.add.text(12, 12, 'LEVEL 1', { fontFamily: 'Arial', fontSize: '18px', color: '#fff', fontStyle: 'bold' });
    this.add.text(GAME_W / 2, 40, 'Dodge the food! 🚫🍕', { fontFamily: 'Arial', fontSize: '16px', color: '#ffd6d6' })
      .setOrigin(0.5);

    // Progress bar
    this.barBg = this.add.rectangle(GAME_W / 2, 70, 300, 14, 0x000000, 0.5).setStrokeStyle(2, 0xffffff);
    this.bar = this.add.rectangle(GAME_W / 2 - 150, 70, 0, 10, 0x39d353).setOrigin(0, 0.5);

    // Touch to steer.
    this.input.on('pointermove', (p) => { if (p.isDown) this.playerTargetX = p.x; });
    this.input.on('pointerdown', (p) => { this.playerTargetX = p.x; });

    this.flash = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0xff0000, 0)
      .setDepth(1000);
  }

  spawnFood() {
    const x = Phaser.Math.Between(GAME_W / 2 - 130, GAME_W / 2 + 130);
    const char = Phaser.Utils.Array.GetRandom(this.FOODS);
    const food = makeEmoji(this, x, -30, char, 38);
    food.speed = 190 + this.progress * 300;
    this.foods.push(food);
  }

  hit() {
    if (this.dead) return;
    this.dead = true;
    this.cameras.main.shake(250, 0.02);
    this.flash.setAlpha(0.6);
    this.tweens.add({ targets: this.flash, alpha: 0, duration: 400 });
    this.add.text(GAME_W / 2, GAME_H / 2, 'OUCH! 😵\nyou ate the food', {
      fontFamily: 'Arial', fontSize: '30px', color: '#fff', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5).setDepth(1001);
    this.time.delayedCall(900, () => this.scene.restart());
  }

  win() {
    if (this.won) return;
    this.won = true;
    this.dead = true;
    this.scene.start('CarSelectScene');
  }

  update(time, delta) {
    if (this.dead) return;
    const dt = delta / 1000;

    // Scrolling lane markers for a sense of speed.
    this.laneOffset = (this.laneOffset + (220 + this.progress * 260) * dt) % 80;
    this.laneGfx.clear();
    this.laneGfx.fillStyle(0xf2c200, 0.9);
    for (let y = -80 + this.laneOffset; y < GAME_H; y += 80) {
      this.laneGfx.fillRect(GAME_W / 2 - 4, y, 8, 44);
    }

    // Steer the player toward the finger.
    this.player.x = Phaser.Math.Linear(this.player.x, this.playerTargetX, 0.2);
    this.player.x = Phaser.Math.Clamp(this.player.x, GAME_W / 2 - 135, GAME_W / 2 + 135);

    // Progress.
    this.progress = Math.min(1, this.progress + dt / this.GOAL_TIME);
    this.bar.width = 300 * this.progress;
    if (this.progress >= 1) { this.win(); return; }

    // Spawn foods (faster as you progress).
    this.spawnAcc += delta;
    const interval = 720 - this.progress * 380;
    if (this.spawnAcc >= interval) {
      this.spawnAcc = 0;
      this.spawnFood();
    }

    // Move foods + collision.
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const f = this.foods[i];
      f.y += f.speed * dt;
      const dx = f.x - this.player.x;
      const dy = f.y - this.player.y;
      if (dx * dx + dy * dy < 46 * 46) { this.hit(); return; }
      if (f.y > GAME_H + 40) { f.destroy(); this.foods.splice(i, 1); }
    }
  }
}
