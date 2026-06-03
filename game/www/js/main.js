/* Cola Quest - main entry point.
 * Wires up Phaser, registers every scene and holds the tiny bit of global state
 * (which car the player picked, whether they are on the secret path). */

window.GameState = {
  chosenCar: '🚗', // 🚗 default; overwritten on the car-select screen
  secret: false,
};

// Shared sizes for the "virtual" portrait screen. Phaser's Scale.FIT keeps the
// aspect ratio and letterboxes on whatever phone it runs on.
window.GAME_W = 450;
window.GAME_H = 800;

/* ----------------------------- shared helpers ----------------------------- */

// Paint a vertical two-colour gradient that fills the whole scene.
window.makeGradientBg = function (scene, topHex, bottomHex) {
  const w = GAME_W;
  const h = GAME_H;
  const tex = scene.textures.createCanvas('bg_' + scene.scene.key + '_' + Date.now(), w, h);
  const ctx = tex.getContext();
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, topHex);
  grad.addColorStop(1, bottomHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  tex.refresh();
  return scene.add.image(0, 0, tex.key).setOrigin(0, 0).setDepth(-100);
};

// An emoji rendered as a text object, centred on (x, y).
window.makeEmoji = function (scene, x, y, char, size) {
  return scene.add
    .text(x, y, char, {
      fontFamily: 'Segoe UI Emoji, Noto Color Emoji, Apple Color Emoji, sans-serif',
      fontSize: (size || 40) + 'px',
    })
    .setOrigin(0.5);
};

// A simple tappable rounded button. Returns the container.
window.makeButton = function (scene, x, y, label, onClick, opts) {
  opts = opts || {};
  const w = opts.width || 240;
  const h = opts.height || 64;
  const color = opts.color || 0xe60023;
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
  g.lineStyle(3, 0xffffff, 0.9);
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
  const txt = scene.add
    .text(0, 0, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: (opts.fontSize || 24) + 'px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);
  const c = scene.add.container(x, y, [g, txt]);
  c.setSize(w, h);
  c.setInteractive({ useHandCursor: true });
  c.on('pointerdown', () => {
    scene.tweens.add({ targets: c, scale: 0.92, duration: 70, yoyo: true });
    if (onClick) onClick();
  });
  return c;
};

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#0d0d1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [
    BootScene,
    Level1Scene,
    CarSelectScene,
    Level2Scene,
    Level3Scene,
    CutsceneScene,
  ],
};

window.addEventListener('load', () => {
  // eslint-disable-next-line no-new
  new Phaser.Game(config);
});
