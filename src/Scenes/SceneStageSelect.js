import Phaser from "phaser";
import SimpleButton from "../Objects/Objects.js";

class SceneStageSelect extends Phaser.Scene {
  constructor() {
    super({ key: 'stage-select' });
  }
  preload() { }
  create() {

    this.add.text(0, 0, "Very Very Cool\nStage Select", { fontSize: 50, color: "white" });

    //SimpleButtonは自作class ../Objects/Objects.js に記述している
    var stage0 = new SimpleButton(this, 50, 200, 200, 50, 0x0000ff, 'stage0', "red");

    //コールバックの指定
    stage0.button.on('pointerdown', function() {
      //シーンの遷移にエフェクトを加えたいならここの処理を変更する
      this.scene.start('game', { stage_dir: "test" });
    }.bind(this));
  }
  update() { }
}
export default SceneStageSelect;
