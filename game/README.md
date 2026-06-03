# 🥤 Cola Quest

A small 3-level mobile arcade game starring Coca-Cola, built to run on Android.

## Stack

| Layer        | Tech                                   | Why |
|--------------|----------------------------------------|-----|
| Game engine  | **Phaser 3** (HTML5 / JavaScript)      | Fast 2D engine — perfect for a runner, a dodge level and a platformer. |
| Native wrap  | **Capacitor 6**                        | Wraps the web game into a real Android app and produces an `.apk`. |
| APK build    | **GitHub Actions** (`.github/workflows/build-apk.yml`) | The Android SDK lives in CI; every push builds the APK and publishes it. |
| Art          | Emoji + colored shapes                 | No asset licensing, instantly playable. Swap in real sprites later. |

## The 3 levels

1. **RUN, COLA, RUN!** — Coca-Cola runs down the road dodging 6 foods
   (khachapuri 🫓, khinkali 🥟, pizza 🍕, pasta 🍝, salad 🥗, meat 🍖).
   Touch any food → restart. Survive to the finish → pick **1 of 3 cars**:
   one restarts the game, one goes to Level 2, one opens the **secret level**.
2. **GETAWAY** — You drive the car you picked and dodge **police cars** 🚓.
   Reach the **door** 🚪 to clear the level.
   *Secret Level 2* is identical but the cops are replaced by little humans 🧍.
3. **CLIMB TO FANTA** — A Mario-style platformer. Jump up the bricks 🧱 to
   reach **Fanta** at the top. Touch her → the final **love-story cutscene**:
   Cola ❤️ Fanta → a month later Fanta leaves for Pepsi → Cola and the gang go
   beat Pepsi. THE END.

## How to get the APK on your phone

1. Push to the `claude/mobile-game-stack-design-3obyF` branch (already wired up).
2. Open the repo's **Actions** tab → the **Build Android APK** run.
3. Either download the **`cola-quest-apk`** artifact, **or** grab
   `cola-quest.apk` from the **Releases** page (tag `cola-quest-latest`) —
   easiest to open directly on your phone.
4. On the phone, allow "install from unknown sources" and install. Play! 🎮

## Run in a browser (quick dev loop)

```bash
cd game
npm install
npm run copy:phaser
npx serve www      # or: python3 -m http.server -d www 8080
```

Then open the served URL. Touch/drag to steer; on-screen buttons control Level 3.

## Build the APK locally (needs Android SDK + JDK 17)

```bash
cd game
npm install
npm run build:apk
# -> android/app/build/outputs/apk/debug/app-debug.apk
```

## Project layout

```
game/
  www/                 # the actual game (HTML5 + Phaser)
    index.html
    js/
      main.js          # Phaser config + shared helpers + global state
      scenes/          # one file per scene
        BootScene.js
        Level1Scene.js
        CarSelectScene.js
        Level2Scene.js
        Level3Scene.js
        CutsceneScene.js
  android/             # Capacitor-generated native Android project
  capacitor.config.json
  package.json
```
