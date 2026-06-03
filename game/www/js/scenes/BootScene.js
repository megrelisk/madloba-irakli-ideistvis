/* Title screen. Tap anywhere to start Level 1. */
class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    makeGradientBg(this, '#e60023', '#7a0012');

    makeEmoji(this, GAME_W / 2, 230, '🥤', 110);

    this.add
      .text(GAME_W / 2, 360, 'COLA QUEST', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '52px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_W / 2, 410, 'A Coca-Cola Adventure', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#ffe0e0',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_W / 2, 470, '3 levels · dodge the food · pick a car\nrace the cops · climb to Fanta', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        color: '#ffd0d0',
        align: 'center',
      })
      .setOrigin(0.5);

    const tap = this.add
      .text(GAME_W / 2, 620, '▶  TAP TO START', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: tap,
      alpha: 0.25,
      duration: 650,
      yoyo: true,
      repeat: -1,
    });

    this.add
      .text(GAME_W / 2, GAME_H - 30, 'made with Phaser 🎮', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#ffb0b0',
      })
      .setOrigin(0.5);

    this.input.once('pointerdown', () => {
      // Fresh run resets the secret flag and chosen car.
      GameState.secret = false;
      GameState.chosenCar = '🚗';
      this.scene.start('Level1Scene');
    });
  }
}
