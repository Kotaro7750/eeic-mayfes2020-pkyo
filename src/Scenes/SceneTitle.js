import Phaser from 'phaser';
import SimpleButton from '../Objects/Objects.js';

class SceneTitle extends Phaser.Scene {
  constructor() {
    super({key: 'title'});
  }

  preload() { }

  create() {
    this.game.scale.setGameSize(800, 600);
    this.add.text(200, 50, 'Apple', {fontSize: 50, color: 'red'});

    const phaserDiv = document.getElementById('phaserDiv');
    document.querySelectorAll('#phaserDiv div').forEach((v) => {
      phaserDiv.removeChild(v);
    });

    // SimpleButtonは自作class ../Objects/Objects.js に記述している
    const button0 = new SimpleButton(phaserDiv, this, 300, 200, 'simple_button', 'simple_button_start', 200, 50, 0xff7f7f, 'start', 'red');
    // eslint-disable-next-line no-unused-vars
    const button1 = new SimpleButton(phaserDiv, this, 300, 280, 'simple_button', 'simple_button_dummy1', 200, 50, 0x7fff7f, 'dummy', 'green');
    // eslint-disable-next-line no-unused-vars
    const button2 = new SimpleButton(phaserDiv, this, 300, 360, 'simple_button', 'simple_button_dummy2', 200, 50, 0x7f7fff, 'dummy', 'blue');

    // コールバックの指定
    button0.button.addEventListener('click', function() {
      // シーンの遷移にエフェクトを加えたいならここの処理を変更する
      this.scene.start('stage-select');
    }.bind(this));
  }

  update() { }
}

export default SceneTitle;
