/* unko*/
import Phaser from 'phaser';
import SimpleButton from '../Objects/Objects.js';

class SceneTitle extends Phaser.Scene {
  constructor() {
    super({key: 'title'});
  }

  preload() { }

  create() {
    this.game.scale.setGameSize(800, 600);
    this.add.text(200, 50, 'Really Really\nCool Title', {fontSize: 50, color: 'white'});

    // SimpleButtonは自作class ../Objects/Objects.js に記述している
    const button0 = new SimpleButton(this, 300, 200, 200, 50, 0xff7f7f, 'start', 'red');
    const button1 = new SimpleButton(this, 300, 280, 200, 50, 0x7fff7f, 'dummy', 'green');
    const button2 = new SimpleButton(this, 300, 360, 200, 50, 0x7f7fff, 'dummy', 'blue');

    // コールバックの指定
    button0.button.on('pointerdown', function() {
      // シーンの遷移にエフェクトを加えたいならここの処理を変更する
      this.scene.start('stage-select');
    }.bind(this));
  }

  update() { }
}

export default SceneTitle;
