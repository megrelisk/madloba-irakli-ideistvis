/* LEVEL 3 — "CLIMB TO FANTA"
 * A vertical Mario-style platformer. You are Coca-Cola again. Jump up the
 * bricks (🧱). At the very top, Fanta is waiting. Touch Fanta and the love
 * story (the final cutscene) begins. */
class Level3Scene extends Phaser.Scene {
  constructor() {
    super('Level3Scene');
  }

  create() {
    this.WORLD_H = 2600;
    this.MOVE = 230;
    this.JUMP_V = 660;
    this.finished = false;

    this.physics.world.setBounds(0, 0, GAME_W, this.WORLD_H);
    this.physics.world.gravity.y = 1300;
    this.cameras.main.setBounds(0, 0, GAME_W, this.WORLD_H);

    // Sky background pinned to the camera.
    makeGradientBg(this, '#0b1d3a', '#3a6ea5').setScrollFactor(0);

    // Build the brick staircase.
    this.platforms = [];
    this.addPlatform(GAME_W / 2, this.WORLD_H - 40, GAME_W, 40); // floor
    let side = 0;
    for (let y = this.WORLD_H - 180; y > 240; y -= 140) {
      const x = side ? GAME_W - 95 : 95;
      this.addPlatform(x, y, 170, 26);
      side = 1 - side;
    }
    this.addPlatform(GAME_W / 2, 180, 220, 26); // Fanta's ledge

    // Fanta (orange) sits on the top ledge.
    const fGlow = this.add.circle(0, 0, 32, 0xff7a00, 0.4);
    const fDisc = this.add.circle(0, 0, 24, 0xff8c00).setStrokeStyle(4, 0xffffff);
    const fFace = makeEmoji(this, 0, 0, '🥤', 32);
    const fLabel = this.add.text(0, 38, 'FANTA', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ff8c00', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.fanta = this.add.container(GAME_W / 2, 140, [fGlow, fDisc, fFace, fLabel]);
    this.tweens.add({ targets: fGlow, scale: 1.25, duration: 600, yoyo: true, repeat: -1 });

    // Player: a red physics box with a cola face drawn on top.
    this.player = this.add.rectangle(95, this.WORLD_H - 120, 38, 46, 0xe60023).setStrokeStyle(3, 0xffffff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.playerFace = makeEmoji(this, 0, 0, '🥤', 30).setDepth(5);

    this.physics.add.collider(this.player, this.platforms);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.buildControls();

    // Fixed HUD.
    this.add.text(12, 12, 'LEVEL 3', { fontFamily: 'Arial', fontSize: '18px', color: '#fff', fontStyle: 'bold' })
      .setScrollFactor(0).setDepth(100);
    this.add.text(GAME_W / 2, 40, 'Climb up to Fanta! 🧱⬆️', {
      fontFamily: 'Arial', fontSize: '16px', color: '#fff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }

  addPlatform(x, y, w, h) {
    const brick = this.add.rectangle(x, y, w, h, 0xb5651d).setStrokeStyle(2, 0x7a3f0a);
    this.physics.add.existing(brick, true);
    // A couple of brick emojis for flavour (purely cosmetic).
    for (let bx = x - w / 2 + 18; bx < x + w / 2; bx += 36) {
      makeEmoji(this, bx, y, '🧱', 22).setDepth(-1);
    }
    this.platforms.push(brick);
  }

  buildControls() {
    const y = GAME_H - 58;
    const mk = (x, label, w) => {
      const r = this.add.rectangle(x, y, w || 92, 92, 0xffffff, 0.16)
        .setStrokeStyle(2, 0xffffff, 0.5).setScrollFactor(0).setDepth(100);
      this.add.text(x, y, label, { fontFamily: 'Arial', fontSize: '34px', color: '#fff' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(101);
      return r;
    };
    this.leftRect = mk(60, '◀');
    this.rightRect = mk(160, '▶');
    this.jumpRect = mk(GAME_W - 70, '⤒', 110);

    // Allow several simultaneous touches (move + jump together).
    this.input.addPointer(2);
    this.input.on('pointerdown', (p) => {
      if (this.inRect(p.x, p.y, this.jumpRect)) this.tryJump();
    });
  }

  inRect(px, py, rect) {
    return (
      px >= rect.x - rect.width / 2 &&
      px <= rect.x + rect.width / 2 &&
      py >= rect.y - rect.height / 2 &&
      py <= rect.y + rect.height / 2
    );
  }

  tryJump() {
    if (this.finished) return;
    if (this.player.body.blocked.down || this.player.body.touching.down) {
      this.player.body.setVelocityY(-this.JUMP_V);
    }
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.player.body.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);
    this.cameras.main.flash(400, 255, 140, 0);
    this.add.text(GAME_W / 2, GAME_H / 2, '💥 GAME OVER 💥\n…or is it? 💕', {
      fontFamily: 'Arial Black, Arial', fontSize: '32px', color: '#fff', fontStyle: 'bold',
      align: 'center', backgroundColor: '#000000cc', padding: { x: 18, y: 14 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.time.delayedCall(1700, () => this.scene.start('CutsceneScene'));
  }

  update() {
    if (this.finished) return;

    // Which on-screen buttons are currently held (multi-touch aware).
    let left = false;
    let right = false;
    for (const p of this.input.manager.pointers) {
      if (!p.isDown) continue;
      if (this.inRect(p.x, p.y, this.leftRect)) left = true;
      else if (this.inRect(p.x, p.y, this.rightRect)) right = true;
    }
    const dir = (right ? 1 : 0) - (left ? 1 : 0);
    this.player.body.setVelocityX(dir * this.MOVE);

    // Cola face rides along with the body.
    this.playerFace.setPosition(this.player.x, this.player.y - 1);

    // Reached Fanta?
    const dx = this.fanta.x - this.player.x;
    const dy = this.fanta.y - this.player.y;
    if (dx * dx + dy * dy < 48 * 48) this.finish();
  }
}
