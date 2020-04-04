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

    // SimpleButtonは自作class ../Objects/Objects.js に記述している
    const stage0 = new SimpleButton(this, 300, 200, 200, 50, 0xff7f7f, 'stage0', 'red');

    const stage1 = new SimpleButton(this, 300, 300, 200, 50, 0xff7f7f, 'stage-test', 'blue');
    const backTitle = new SimpleButton(this, 300, 400, 200, 50, 0xffff7f, 'Title', 'black');

    // コールバックの指定
    stage0.button.on('pointerdown', function() {
      // シーンの遷移にエフェクトを加えたいならここの処理を変更する
      this.scene.start('load', {stage_dir: 'test'});
    }.bind(this));
    backTitle.button.on('pointerdown', function() {
      this.scene.start('title');
    }.bind(this));

    stage1.button.on('pointerdown', function() {
      this.scene.start('load', {stage_dir: 'stage-test'});
    }.bind(this));
  }
  update() { }
}
export default SceneStageSelect;
