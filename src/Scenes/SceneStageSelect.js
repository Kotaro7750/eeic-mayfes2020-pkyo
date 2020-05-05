import Phaser from 'phaser';
import SimpleButton from '../Objects/Objects.js';

class SceneStageSelect extends Phaser.Scene {
  constructor() {
    super({key: 'stage-select'});
  }
  preload() { }
  create() {
    this.game.scale.setGameSize(800, 600);
    this.add.text(200, 50, 'Very Very Cool\nStage Select', {fontSize: 50, color: 'white'});

    // 全体統一のdiv
    const phaserDiv = document.getElementById('phaserDiv');

    // phaserDiv内部のdivを消す
    document.querySelectorAll('#phaserDiv div').forEach((v) => {
      if (phaserDiv.contains(v)) {
        phaserDiv.removeChild(v);
      }
    });

    const stageDiv = document.createElement('div');
    stageDiv.style.position = 'absolute';
    stageDiv.style.width = 'auto';
    stageDiv.style.left = '0px';
    stageDiv.style.top = '0px';
    stageDiv.style.paddingLeft = '300px';
    stageDiv.style.paddingRight = '300px';
    stageDiv.style.paddingTop = '200px';
    phaserDiv.appendChild(stageDiv);

    const stage0 = new SimpleButton(stageDiv, this, 300, 200, 'stage_button', 'stageselect_stage0', 200, 50, 'red', 'STAGE 0', 'white');
    const stage1 = new SimpleButton(stageDiv, this, 300, 300, 'stage_button', 'stageselect_stage1', 200, 50, 'blue', 'STAGE 1', 'white');

    const backTitle = document.createElement('div');
    backTitle.setAttribute('class', 'simple-button-div');
    backTitle.setAttribute('id', 'stageselect_backtotitle');
    backTitle.style.width = 'auto';
    backTitle.style.backgroundColor = '#333333';
    backTitle.style.color = 'white';
    backTitle.innerHTML = 'タイトルへ戻る';
    stageDiv.appendChild(backTitle);

    // コールバックの指定
    stage0.button.addEventListener('click', function() {
      // シーンの遷移時にエフェクトを加えたいならここの処理を変更する
      this.scene.start('load', {stage_dir: 'test'});
    }.bind(this));

    stage1.button.addEventListener('click', function() {
      this.scene.start('load', {stage_dir: 'stage-test'});
    }.bind(this));
    backTitle.addEventListener('click', function() {
      this.scene.start('title');
    }.bind(this));
  }
  update() { }
}
export default SceneStageSelect;
