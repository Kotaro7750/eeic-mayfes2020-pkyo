import Phaser from 'phaser';
import {SimpleButton} from '../Objects/Objects.js';
import stageList from '../stage/stageList';

class SceneStageSelect extends Phaser.Scene {
  constructor() {
    super({key: 'stage-select'});
  }
  preload() {
  }

  create() {
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;
    this.game.scale.setGameSize(this.width, this.height);
    window.onresize = () => {
      this.width = document.documentElement.clientWidth;
      this.height = document.documentElement.clientHeight;
      this.game.scale.setGameSize(this.width, this.height);
      this.stageDiv.style.height = (this.height - 200) + 'px';
    };

    this.add.text(200, 50, 'Very Very Cool\nStage Select', {fontSize: 50, color: 'white'});

    // 全体統一のdiv
    const phaserDiv = document.getElementById('phaserDiv');

    // phaserDiv内部のdivを消す
    document.querySelectorAll('#phaserDiv div').forEach((v) => {
      if (phaserDiv.contains(v)) {
        phaserDiv.removeChild(v);
      }
    });

    this.stageDiv = document.createElement('div');
    this.stageDiv.style.position = 'absolute';
    this.stageDiv.style.overflowY = 'scroll';
    this.stageDiv.style.width = 'auto';
    this.stageDiv.style.height = (this.height - 200) + 'px';
    this.stageDiv.overflowY = 'scroll';
    this.stageDiv.style.left = '0px';
    this.stageDiv.style.top = '200px';
    this.stageDiv.style.paddingLeft = '50px';
    this.stageDiv.style.paddingRight = '50px';
    phaserDiv.appendChild(this.stageDiv);

    stageList.forEach((stage, i) => {
      const stageButton = new SimpleButton(this.stageDiv, this, 0, 100 * i, 'stage_button', 'stageselect' + stage.id, this.width - 100, '#FFFF96', stage.title, 'white', '/stage/' + stage.id + '.png', stage.message);
      stageButton.button.addEventListener('click', function() {
        this.scene.start('load', {stage_dir: stage.id, idx: i});
      }.bind(this));
    });

    const backTitle = document.createElement('div');
    backTitle.setAttribute('class', 'simple-button-div');
    backTitle.setAttribute('id', 'stageselect_backtotitle');
    backTitle.style.width = 'auto';
    backTitle.style.backgroundColor = '#333333';
    backTitle.style.color = 'white';
    backTitle.innerHTML = 'タイトルへ<ruby>戻<rp>(</rp><rt>もど</rt><rp>)</rp></ruby>る';
    this.stageDiv.appendChild(backTitle);

    // コールバックの指定
    backTitle.addEventListener('click', function() {
      // シーンの遷移時にエフェクトを加えたいならここの処理を変更する
      this.scene.start('title');
    }.bind(this));
  }
  update() { }
}
export default SceneStageSelect;
