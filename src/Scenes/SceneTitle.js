import Phaser from 'phaser';
import {FlipButton} from '../Objects/Objects';
import TitleImg from './title.png';
import Mitsuki from './mitsuki.png';
import Elena from './elena.png';

class SceneTitle extends Phaser.Scene {
  constructor() {
    super({key: 'title'});
  }

  preload() {
    this.load.image('title', TitleImg);
    this.load.spritesheet('mitsuki', Mitsuki, {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('elena', Elena, {frameWidth: 32, frameHeight: 32});
  }

  create() {
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;
    this.game.scale.setGameSize(this.width, this.height);
    this.title = this.add.image(this.width / 2, this.height / 4, 'title');
    window.onresize = () => {
      this.width = document.documentElement.clientWidth;
      this.height = document.documentElement.clientHeight;
      this.game.scale.setGameSize(this.width, this.height);
    };
    this.x = this.width / 2;
    this.y = this.height / 2;
    window.onmousemove = (e) => {
      this.x = e.clientX;
      this.y = e.clientY;
    };

    this.mitsuki = this.physics.add.sprite(100, 100, 'mitsuki');
    this.elena = this.physics.add.sprite(this.width - 100, this.height - 100, 'elena');

    this.mitsuki.setOrigin(0.5, 0.5);
    this.elena.setOrigin(0.5, 0.5);

    ['mitsuki', 'elena'].forEach((v) => {
      this.anims.create({
        key: v + '-right',
        frames: [
          {key: v, frame: 6},
          {key: v, frame: 7},
          {key: v, frame: 8},
          {key: v, frame: 7},
        ],
        frameRate: 7,
        repeat: -1,
      });
      this.anims.create({
        key: v + '-left',
        frames: [
          {key: v, frame: 3},
          {key: v, frame: 4},
          {key: v, frame: 5},
          {key: v, frame: 4},
        ],
        frameRate: 7,
        repeat: -1,
      });
      this.anims.create({
        key: v + '-up',
        frames: [
          {key: v, frame: 9},
          {key: v, frame: 10},
          {key: v, frame: 11},
          {key: v, frame: 10},
        ],
        frameRate: 7,
        repeat: -1,
      });
      this.anims.create({
        key: v + '-down',
        frames: [
          {key: v, frame: 0},
          {key: v, frame: 1},
          {key: v, frame: 2},
          {key: v, frame: 1},
        ],
        frameRate: 7,
        repeat: -1,
      });
    });

    this.elena.anims.play('elena-down', true);
    this.mitsuki.anims.play('mitsuki-down', true);

    const phaserDiv = document.getElementById('phaserDiv');
    document.querySelectorAll('#phaserDiv div').forEach((v) => {
      if (phaserDiv.contains(v)) {
        phaserDiv.removeChild(v);
      }
    });

    // START button
    const titleBtn = new FlipButton(phaserDiv, 'START', (this.width - 200) / 2, (this.height - 50) / 2, 200, 50);

    // コールバックの指定
    titleBtn.button.addEventListener('click', function() {
      // シーンの遷移にエフェクトを加えたいならここの処理を変更する
      this.scene.start('stage-select');
    }.bind(this));
  }

  update() {
    // mitsuki with acceleration
    let dx = this.x - this.mitsuki.x;
    let dy = this.y - this.mitsuki.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        this.mitsuki.anims.play('mitsuki-right', true);
      } else {
        this.mitsuki.anims.play('mitsuki-left', true);
      }
    } else {
      if (dy >= 0) {
        this.mitsuki.anims.play('mitsuki-down', true);
      } else {
        this.mitsuki.anims.play('mitsuki-up', true);
      }
    }
    this.mitsuki.setAcceleration(Math.min(50, Math.max(-50, dx)), Math.min(50, Math.max(-50, dy)));
    // elena with velocity
    dx = this.x - this.elena.x;
    dy = this.y - this.elena.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        this.elena.anims.play('elena-right', true);
      } else {
        this.elena.anims.play('elena-left', true);
      }
    } else {
      if (dy >= 0) {
        this.elena.anims.play('elena-down', true);
      } else {
        this.elena.anims.play('elena-up', true);
      }
    }
    this.elena.setVelocity(Math.min(50, Math.max(-50, dx)), Math.min(50, Math.max(-50, dy)));
  }
}

export default SceneTitle;
