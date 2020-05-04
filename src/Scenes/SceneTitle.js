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
      if (phaserDiv.contains(v)) {
        phaserDiv.removeChild(v);
      }
    });

    // START button
    const titleBtn0 = document.createElement('div');
    titleBtn0.setAttribute('class', 'title-box');
    const titleBtn1 = document.createElement('div');
    titleBtn1.setAttribute('class', 'title-button');
    titleBtn1.innerHTML = 'START';
    titleBtn0.appendChild(titleBtn1);
    phaserDiv.appendChild(titleBtn0);

    // コールバックの指定
    titleBtn0.addEventListener('click', function() {
      // シーンの遷移にエフェクトを加えたいならここの処理を変更する
      this.scene.start('stage-select');
    }.bind(this));
  }

  update() { }
}

export default SceneTitle;
