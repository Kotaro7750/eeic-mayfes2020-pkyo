// ステージ依存のファイル
// xmlのpathはwebpack後に取り出されるので

class StageRunner {
  constructor(stageDir) {
    this.stageDir = stageDir;
  }

  async preload() {
    console.log('runner preload start:', this.stageDir);
    this.tileMap = import('./stage/' + this.stageDir + '/tilemap.json');
    this.tileSets = import('./stage/' + this.stageDir + '/tilesets.png');

    const [tileMap, tileSets] = await Promise.all(
        [this.tileMap, this.tileSets]
    );
    return [tileMap.default, tileSets.default];
  }

  async load() {
    this.xmlFilePath = import('./stage/' + this.stageDir + '/command.xml');
    this.stageConfig = import('./stage/' + this.stageDir + '/config.json');
    this.blockDefs = import('./stage/' + this.stageDir + '/Blocks.json');
    this.blockFuncs = import('./stage/' + this.stageDir + '/Blocks.js');

    const [xmlFilePath, stageConfig, blockDefs, blockFuncs] = await Promise.all(
        [this.xmlFilePath, this.stageConfig, this.blockDefs, this.blockFuncs]
    );

    return [xmlFilePath.default, stageConfig.default, blockDefs.blocks, blockFuncs];
  }
}

export default StageRunner;
