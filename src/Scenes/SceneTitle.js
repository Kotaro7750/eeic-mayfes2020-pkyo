import Phaser from 'phaser';
import {FlipButton} from '../Objects/Objects';

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
      if (phaserDiv.contains(v)) {
        phaserDiv.removeChild(v);
      }
    });

    // START button
    const titleBtn = new FlipButton(phaserDiv, 'START', 300, 200, 200, 50);

    // コールバックの指定
    titleBtn.button.addEventListener('click', function() {
      // シーンの遷移にエフェクトを加えたいならここの処理を変更する
      this.scene.start('stage-select');
    }.bind(this));
  }

  update() { }
}

export default SceneTitle;
