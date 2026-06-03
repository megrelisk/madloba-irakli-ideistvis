/* LEVEL 2 — "GETAWAY"
 * You ARE the car you picked. Dodge the police cars (🚓). On the SECRET path
 * the cops are replaced by little humans (🧍). Survive until the door (🚪)
 * appears, then touch it to clear the level. */
class Level2Scene extends Phaser.Scene {
  constructor() {
    super('Level2Scene');
  }

  create() {
    this.dead = false;
    this.passed = false;
    this.elapsed = 0;
    this.spawnAcc = 0;
    this.laneOffset = 0;
    this.enemies = [];
    this.door = null;

    this.DOOR_TIME = 16; // seconds until the exit door shows up
    this.secret = !!GameState.secret;
    this.enemyChar = this.secret ? '🧍' : '🚓';

    makeGradientBg(this, this.secret ? '#241b3a' : '#1b2a4a', '#0a0a14');

    this.add.rectangle(GAME_W / 2, GAME_H / 2, 320, GAME_H, 0x20202c).setDepth(-50);
    this.laneGfx = this.add.graphics().setDepth(-49);

    // Player = chosen car.
    this.player = makeEmoji(this, GAME_W / 2, GAME_H - 110, GameState.chosenCar, 52);
    this.playerTargetX = GAME_W / 2;

    // HUD
    this.add.text(12, 12, this.secret ? 'SECRET LEVEL' : 'LEVEL 2', {
      fontFamily: 'Arial', fontSize: '18px', color: this.secret ? '#c084fc' : '#fff', fontStyle: 'bold',
    });
    this.hint = this.add.text(GAME_W / 2, 44, this.secret ? 'Dodge the people! 🏃' : 'Dodge the cops! 🚓', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffd6d6',
    }).setOrigin(0.5);

    this.input.on('pointermove', (p) => { if (p.isDown) this.playerTargetX = p.x; });
    this.input.on('pointerdown', (p) => { this.playerTargetX = p.x; });

    this.flash = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0xff0000, 0).setDepth(1000);
  }

  spawnEnemy() {
    const x = Phaser.Math.Between(GAME_W / 2 - 135, GAME_W / 2 + 135);
    const e = makeEmoji(this, x, -30, this.enemyChar, 44);
    e.speed = 200 + Math.min(this.elapsed, 18) * 12;
    this.enemies.push(e);
  }

  spawnDoor() {
    const glow = this.add.rectangle(0, 0, 70, 90, 0x39d353, 0.35);
    const d = makeEmoji(this, 0, 0, '🚪', 60);
    this.door = this.add.container(Phaser.Math.Between(GAME_W / 2 - 110, GAME_W / 2 + 110), -50, [glow, d]);
    this.door.speed = 130;
    this.tweens.add({ targets: glow, alpha: 0.1, duration: 400, yoyo: true, repeat: -1 });
    this.hint.setText('🚪 TOUCH THE DOOR TO ESCAPE!');
    this.hint.setColor('#39d353');
  }

  hit() {
    if (this.dead) return;
    this.dead = true;
    this.cameras.main.shake(250, 0.02);
    this.flash.setAlpha(0.6);
    this.tweens.add({ targets: this.flash, alpha: 0, duration: 400 });
    this.add.text(GAME_W / 2, GAME_H / 2, '🚨 BUSTED!\ntry again', {
      fontFamily: 'Arial', fontSize: '30px', color: '#fff', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5).setDepth(1001);
    this.time.delayedCall(900, () => this.scene.restart());
  }

  pass() {
    if (this.passed) return;
    this.passed = true;
    this.dead = true;
    this.add.text(GAME_W / 2, GAME_H / 2, '🏁 LEVEL CLEAR!', {
      fontFamily: 'Arial Black, Arial', fontSize: '34px', color: '#39d353', fontStyle: 'bold',
      backgroundColor: '#000000aa', padding: { x: 16, y: 12 },
    }).setOrigin(0.5).setDepth(1001);
    this.time.delayedCall(1200, () => this.scene.start('Level3Scene'));
  }

  update(time, delta) {
    if (this.dead) return;
    const dt = delta / 1000;
    this.elapsed += dt;

    this.laneOffset = (this.laneOffset + 300 * dt) % 80;
    this.laneGfx.clear();
    this.laneGfx.fillStyle(0xf2c200, 0.9);
    for (let y = -80 + this.laneOffset; y < GAME_H; y += 80) {
      this.laneGfx.fillRect(GAME_W / 2 - 4, y, 8, 44);
    }

    this.player.x = Phaser.Math.Linear(this.player.x, this.playerTargetX, 0.22);
    this.player.x = Phaser.Math.Clamp(this.player.x, GAME_W / 2 - 140, GAME_W / 2 + 140);

    // Spawn enemies; ease off once the door is on screen so there's a path.
    this.spawnAcc += delta;
    const interval = this.door ? 900 : Math.max(380, 700 - this.elapsed * 14);
    if (this.spawnAcc >= interval) { this.spawnAcc = 0; this.spawnEnemy(); }

    if (!this.door && this.elapsed >= this.DOOR_TIME) this.spawnDoor();

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.y += e.speed * dt;
      const dx = e.x - this.player.x;
      const dy = e.y - this.player.y;
      if (dx * dx + dy * dy < 44 * 44) { this.hit(); return; }
      if (e.y > GAME_H + 40) { e.destroy(); this.enemies.splice(i, 1); }
    }

    if (this.door) {
      this.door.y += this.door.speed * dt;
      const dx = this.door.x - this.player.x;
      const dy = this.door.y - this.player.y;
      if (dx * dx + dy * dy < 52 * 52) { this.pass(); return; }
      if (this.door.y > GAME_H + 60) { this.door.y = -50; this.door.x = Phaser.Math.Between(GAME_W / 2 - 110, GAME_W / 2 + 110); }
    }
  }
}
