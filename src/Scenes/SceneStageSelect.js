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

    // 全体統一のdiv
    const phaserDiv = document.getElementById('phaserDiv');

    // phaserDiv内部のdivを消す
    document.querySelectorAll('#phaserDiv div').forEach((v) => {
      if (phaserDiv.contains(v)) {
        phaserDiv.removeChild(v);
      }
    });

    this.background = document.createElement('div');
    this.background.style.zIndex = -1;
    this.background.style.position = 'fixed';
    this.background.style.width = '100%';
    this.background.style.height = '100%';
    this.background.style.top = '0px';
    this.background.style.left = '0px';
    this.background.style.backgroundColor = '#ffff96';
    phaserDiv.appendChild(this.background);

    this.stageTitle = document.createElement('img');
    this.stageTitle.setAttribute('src', window.location.pathname.replace(new RegExp('\\\/[^\\\/]*$'), '') + '/stage/stage-select.png');
    this.stageTitle.style.position = 'absolute';
    this.stageTitle.style.left = this.width / 4 + 'px';
    this.stageTitle.style.top = '0px';
    const rate = (this.width / 2) / 770;
    const titleHeight = 109 * rate;
    this.stageTitle.style.width = this.width / 2 + 'px';
    this.stageTitle.style.height = titleHeight + 'px';
    this.background.appendChild(this.stageTitle);

    this.stageDiv = document.createElement('div');
    this.stageDiv.style.position = 'absolute';
    this.stageDiv.style.overflowY = 'scroll';
    this.stageDiv.style.width = 'auto';
    this.stageDiv.style.height = (this.height - titleHeight - 20) + 'px';
    this.stageDiv.overflowY = 'scroll';
    this.stageDiv.style.left = '0px';
    this.stageDiv.style.top = (titleHeight + 20) + 'px';
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
