import Phaser from 'phaser';
import StageRunner from '../StageRunner';
import playerImg from '../stage/obake.png';

class SceneLoad extends Phaser.Scene {
  constructor() {
    super({key: 'load'});

    this.stageDir;
    this.idx;
    this.stageRunner;
  }

  init(data) {
    this.stageDir = data.stage_dir;
    this.idx = data.idx;
  }

  async preload() {
    this.stageRunner = new StageRunner(this.stageDir);
    this.load.reset();
    this.load.removeListener('complete');

    // player
    // TODO playerImgだけは動的importしてない
    this.load.spritesheet('player', playerImg, {frameWidth: 32, frameHeight: 32});

    const awaitedResources = await this.stageRunner.preload();
    this.load.tilemapTiledJSON('map-' + this.stageDir, awaitedResources[0]);
    this.load.image('tiles-' + this.stageDir, awaitedResources[1]);
    this.load.start();

    if (this.cache.tilemap.exists('map-' + this.stageDir) && this.load.textureManager.exists('tiles-' + this.stageDir) && this.load.textureManager.exists('player')) {
      this.scene.start('game', {stage_dir: this.stageDir, stageRunner: this.stageRunner, idx: this.idx});
    } else {
      this.load.on('complete', () => {
        this.scene.start('game', {stage_dir: this.stageDir, stageRunner: this.stageRunner, idx: this.idx});
      });
    }
  }
}

export default SceneLoad;
