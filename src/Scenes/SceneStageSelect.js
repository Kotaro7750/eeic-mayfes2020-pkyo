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
      phaserDiv.removeChild(v);
    });


    // SimpleButtonは自作class ../Objects/Objects.js に記述している
    const stage0 = new SimpleButton(phaserDiv, this, 300, 200, 'stage_button', 'stageselect_stage0', 200, 50, 'red', 'STAGE 0', 'white');
    phaserDiv.appendChild(stage0.button);
    const stage1 = new SimpleButton(phaserDiv, this, 300, 300, 'stage_button', 'stageselect_stage1', 200, 50, 'blue', 'STAGE 1', 'white');
    const backTitle = new SimpleButton(phaserDiv, this, 300, 400, 'stage_button', 'stageselect_stage2', 200, 50, 'black', 'Title', 'white');

    // コールバックの指定
    stage0.button.addEventListener('click', function() {
      // シーンの遷移時にエフェクトを加えたいならここの処理を変更する
      this.scene.start('load', {stage_dir: 'test'});
    }.bind(this));

    stage1.button.addEventListener('click', function() {
      this.scene.start('load', {stage_dir: 'stage-test'});
    }.bind(this));
    backTitle.button.addEventListener('click', function() {
      this.scene.start('title');
    }.bind(this));
  }
  update() { }
}
export default SceneStageSelect;
