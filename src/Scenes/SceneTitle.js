import Phaser from 'phaser';
import {FlipButton} from '../Objects/Objects';
import TitleImg from './title.png';

class SceneTitle extends Phaser.Scene {
  constructor() {
    super({key: 'title'});
  }

  preload() {
    this.load.image('title', TitleImg);
  }

  create() {
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;
    this.game.scale.setGameSize(this.width, this.height);
    this.title = this.add.image(this.width / 2, this.height / 4, 'title');
    console.log(this.title);
    window.onresize = () => {
      this.width = document.documentElement.clientWidth;
      this.height = document.documentElement.clientHeight;
      this.game.scale.setGameSize(this.width, this.height);
    };

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

  update() { }
}

export default SceneTitle;
