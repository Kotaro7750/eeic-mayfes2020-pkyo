// このファイルは現状参照されていません。不要であることが確定したら消してください
// 適当なエフェクトを発生させ、一定時間後に消えるシーンオブジェクト
import Phaser from 'phaser';
// import SimpleButton from "../Objects/Objects.js";

class SceneGameEffect extends Phaser.Scene {
  constructor() {
    super({key: 'gameEffect'});
  }

  preload() {}

  create() {
    this.text1 = this.add.text(0, 0, 'YOU\'RE\nGENIUS !!!', {fontSize: 50, color: 'white'});
    this.text2 = this.add.text(0, 100, 'YOU\'RE\nGENIUS !!!', {fontSize: 50, color: 'white'});
    this.text3 = this.add.text(0, 200, 'YOU\'RE\nGENIUS !!!', {fontSize: 50, color: 'white'});
    this.count = 0;
  }

  update() {
    this.text1.y=(this.text1.y+5)%550;
    this.text2.y=(this.text2.y+5)%550;
    this.text3.y=(this.text3.y+5)%550;
    this.count++;
    if (this.count>300) this.scene.remove('gameEffect');
  }
}

export default SceneGameEffect;
