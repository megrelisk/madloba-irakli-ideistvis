/* CAR SELECT — you survived Level 1. Pick one of three sport cars.
 * The three outcomes (restart / next level / SECRET level) are shuffled, so
 * it is a gamble which car you grab. The car you pick becomes your vehicle
 * in Level 2. */
class CarSelectScene extends Phaser.Scene {
  constructor() {
    super('CarSelectScene');
  }

  create() {
    this.locked = false;
    makeGradientBg(this, '#0f2027', '#203a43');

    this.add.text(GAME_W / 2, 120, 'YOU SURVIVED! 🎉', {
      fontFamily: 'Arial Black, Arial', fontSize: '34px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_W / 2, 175, 'Choose your sport car…', {
      fontFamily: 'Arial', fontSize: '20px', color: '#cfeef5',
    }).setOrigin(0.5);

    this.add.text(GAME_W / 2, 215, 'one is a trap! 😈', {
      fontFamily: 'Arial', fontSize: '15px', color: '#ffd6d6',
    }).setOrigin(0.5);

    // Shuffle the three destinies across the three cars.
    const outcomes = Phaser.Utils.Array.Shuffle(['restart', 'next', 'secret']);
    const cars = ['🏎️', '🚗', '🚙'];

    const ys = [340, 480, 620];
    cars.forEach((carEmoji, i) => {
      const y = ys[i];
      const panel = this.add.rectangle(GAME_W / 2, y, 320, 110, 0xffffff, 0.08)
        .setStrokeStyle(3, 0xffffff, 0.5);
      makeEmoji(this, GAME_W / 2 - 110, y, carEmoji, 64);
      this.add.text(GAME_W / 2 - 40, y, 'CAR ' + (i + 1) + '\nTAP TO DRIVE', {
        fontFamily: 'Arial', fontSize: '18px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0, 0.5);

      panel.setInteractive({ useHandCursor: true });
      panel.on('pointerdown', () => this.choose(outcomes[i], carEmoji, panel, y));
    });
  }

  choose(outcome, carEmoji, panel, y) {
    if (this.locked) return;
    this.locked = true;
    GameState.chosenCar = carEmoji;

    this.tweens.add({ targets: panel, scaleX: 1.05, scaleY: 1.05, duration: 120, yoyo: true });

    let msg, color, go;
    if (outcome === 'restart') {
      msg = '💥 IT EXPLODED!\nback to Level 1';
      color = '#ff5555';
      go = () => this.scene.start('Level1Scene');
    } else if (outcome === 'next') {
      msg = '✅ NICE RIDE!\nLevel 2 →';
      color = '#39d353';
      go = () => { GameState.secret = false; this.scene.start('Level2Scene'); };
    } else {
      msg = '🔮 SECRET LEVEL!\nyou found it…';
      color = '#c084fc';
      go = () => { GameState.secret = true; this.scene.start('Level2Scene'); };
    }

    const banner = this.add.text(GAME_W / 2, GAME_H / 2, msg, {
      fontFamily: 'Arial Black, Arial', fontSize: '30px', color, fontStyle: 'bold',
      align: 'center', backgroundColor: '#000000aa', padding: { x: 18, y: 14 },
    }).setOrigin(0.5).setDepth(50).setAlpha(0);

    this.tweens.add({ targets: banner, alpha: 1, duration: 250 });
    this.time.delayedCall(1500, go);
  }
}
