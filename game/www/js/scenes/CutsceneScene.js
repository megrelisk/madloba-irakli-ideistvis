/* FINAL CUTSCENE — the love story.
 * Cola & Fanta love each other → a month later Fanta leaves for Pepsi →
 * Cola and the gang go beat Pepsi. Tap to advance the panels. */
class CutsceneScene extends Phaser.Scene {
  constructor() {
    super('CutsceneScene');
  }

  create() {
    this.idx = 0;
    this.panels = [
      { top: '#e60023', bottom: '#5a000e', big: '🥤  ❤️  🥤',
        text: 'Coca-Cola and Fanta\nfell deeply in love.' },
      { top: '#c2185b', bottom: '#3a0020', big: '🥤 💕 🥤',
        text: 'They were the\nsweetest couple\nin the fridge.' },
      { top: '#283593', bottom: '#0a0d2a', big: '🥤 💔 🥤',
        text: '1 month later…\nFanta said:\n"I love PEPSI now." 🥤(blue)' },
      { top: '#1b1b1b', bottom: '#000000', big: '🥤😡  🥤😡  🥤😡',
        text: 'Coca-Cola called the gang.\nNobody breaks a cola heart.' },
      { top: '#7a0012', bottom: '#1a0000', big: '🥤👊💥🥤',
        text: 'So they went and\nBEAT PEPSI. 💢' },
      { top: '#e60023', bottom: '#7a0012', big: '🥤  ❤️',
        text: 'THE END.\n\nTap to play again ▶', end: true },
    ];
    this.render();
    this.input.on('pointerdown', () => this.next());
  }

  render() {
    if (this.bg) this.bg.destroy();
    if (this.group) this.group.forEach((o) => o.destroy());
    const p = this.panels[this.idx];

    this.bg = makeGradientBg(this, p.top, p.bottom);

    const big = makeEmoji(this, GAME_W / 2, 300, p.big, 60);
    const text = this.add.text(GAME_W / 2, 470, p.text, {
      fontFamily: 'Arial Black, Arial', fontSize: '26px', color: '#ffffff',
      fontStyle: 'bold', align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);

    const hint = this.add.text(GAME_W / 2, GAME_H - 70,
      p.end ? '' : 'tap to continue ▸', {
        fontFamily: 'Arial', fontSize: '16px', color: '#ffffffaa',
      }).setOrigin(0.5);

    const counter = this.add.text(GAME_W - 16, 16, (this.idx + 1) + '/' + this.panels.length, {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffffff99',
    }).setOrigin(1, 0);

    this.tweens.add({ targets: [big, text], alpha: { from: 0, to: 1 }, y: '-=14', duration: 350 });
    this.tweens.add({ targets: hint, alpha: 0.2, duration: 700, yoyo: true, repeat: -1 });

    this.group = [big, text, hint, counter];
  }

  next() {
    const p = this.panels[this.idx];
    if (p.end) {
      this.scene.start('BootScene');
      return;
    }
    this.idx++;
    this.render();
  }
}
