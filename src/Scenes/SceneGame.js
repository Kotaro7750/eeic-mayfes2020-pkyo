import Blockly from 'blockly';
import Phaser from 'phaser';
import stageList from '../stage/stageList';

import BlocklyRunner from '../Blockly/BlocklyRunner.js';

import {FlipButton} from '../Objects/Objects.js';

const enumExecModePre = 1;
const enumExecModeRun = 2;
const enumExecModePause = 3;
const enumExecModeDone = 4;
const enumExecModeClear = 5;


class SceneGame extends Phaser.Scene {
  init(data) {
    this.stageDir = data.stage_dir;
    this.stageRunner = data.stageRunner;
    this.idx = data.idx;
  }
  constructor() {
    super({key: 'game'});

    this.workspace;

    // game管理classのうちphaser持ち
    this.player = new Player();
    this.goal = new Goal();
    this.mapDat;
    this.map2Img;

    // コマンド生成用ジェネレータ
    this.commandGenerator;
    this.cmdDelta;
    this.tick;

    this.execMode;

    this.stageDir;

    // stagerunner class
    this.stageRunner;
    // blocklyrunner class
    this.blocklyRunner;
  }

  preload() {
  }

  async create() {
    console.log('create ' + this.stageDir);
    const awaitedResources = await this.stageRunner.load();

    this.stageRunner.xmlFilePath = awaitedResources[0];
    this.blocklyRunner = new BlocklyRunner(this.stageRunner.xmlFilePath);
    // await this.blocklyRunner.setCommonBlockDefinition();

    this.stageRunner.stageConfig = awaitedResources[1];

    this.stageRunner.blockDefs = awaitedResources[2];
    this.stageRunner.blockFuncs = awaitedResources[3];

    this.game.scale.setGameSize(400, 600);

    // stage固有ブロックの定義
    this.stageRunner.blockDefs.forEach((elem) => {
      this.blocklyRunner.setBlockDefinition(elem.name, elem.block, this.stageRunner.blockFuncs.default['block_' + elem.name]);
    });

    // blocklyのdiv.style.leftを予め調整しておく
    const blocklyDiv = document.getElementById('blocklyDiv');
    blocklyDiv.style.left = this.game.canvas.width;

    // blocklyの描画設定(レンダリング)
    // コールバック関数を渡す時はちゃんとbindする
    this.blocklyRunner.renderBlockly(this.stageRunner.stageConfig.maxBlock)
        .then((space) => {
          this.workspace = space;
        });

    // mapの表示(mapはcanvasのwidth,heightと同じ比で作成されていることが前提です)
    this.mapDat = this.add.tilemap('map-' + this.stageDir);
    const tileset = this.mapDat.addTilesetImage('tileset', 'tiles-' + this.stageDir);
    this.backgroundLayer = this.mapDat.createDynamicLayer('ground', tileset);
    this.map2Img = this.game.canvas.width / this.backgroundLayer.width;
    console.log(this.map2Img);
    this.backgroundLayer.setScale(this.map2Img);
    this.mapDat = {...this.mapDat, ...this.stageRunner.stageConfig};

    // 初期位置はstageクラスに乗せるとして...（プレイヤーとマップの微妙なズレは要調整）
    // 実はthis.mapDat.tilesets[0].texCoordinatesに各tileの座標が記録されています(が今回使っていない)
    this.player.sprite = this.add.sprite(0, 0, 'player');
    this.player.sprite.setOrigin(0, 1);
    // プレイヤーの位置等の初期化処理をしている
    this.initGameField();
    // ここでアニメーションの定義(193,194行目のようにthis.player.sprite.anims.play('key', true);でこのアニメーションを実行できる)
    // これをplayerクラスに上下左右入れれば4方向へのアニメーションができそう
    this.player.sprite.scene.anims.create({
      key: 'right',
      frames: this.player.sprite.scene.anims.generateFrameNumbers('player', {frames: [5, 6, 7]}),
      frameRate: 7,
      repeat: -1,
    });
    this.player.sprite.scene.anims.create({
      key: 'left',
      frames: this.player.sprite.scene.anims.generateFrameNumbers('player', {frames: [3, 4, 5]}),
      frameRate: 7,
      repeat: -1,
    });
    this.player.sprite.scene.anims.create({
      key: 'up',
      frames: this.player.sprite.scene.anims.generateFrameNumbers('player', {frames: [9, 10, 11]}),
      frameRate: 7,
      repeat: -1,
    });
    this.player.sprite.scene.anims.create({
      key: 'down',
      frames: this.player.sprite.scene.anims.generateFrameNumbers('player', {frames: [0, 1, 2]}),
      frameRate: 7,
      repeat: -1,
    });
    this.setDir();
  }

  update() {
    if (this.execMode === enumExecModeRun) this.updateOnRunning();
  }

  setDir() {
    switch (this.player.dir) {
      case 'down':
        this.player.sprite.setFrame(0);
        break;
      case 'up':
        this.player.sprite.setFrame(9);
        break;
      case 'right':
        this.player.sprite.setFrame(6);
        break;
      case 'left':
        this.player.sprite.setFrame(3);
        break;
      default:
        console.error('incorrect dir in setDir()');
    }
  };

  // 実行中の処理を行うパート
  updateOnRunning() {
    console.log(this.player.dir);
    // これはobjectリストなるものをここに用意しておいて、適宜push/popすることでまとめて管理も可能
    if (this.player.targetX !== this.player.sprite.x) {
      const difX = this.player.targetX - this.player.sprite.x;
      // とてもよくない(画像サイズ規定を設けるor微分方程式なので減衰覚悟でやる)
      this.player.sprite.anims.play(this.player.dir, true);
      this.player.sprite.x += difX / Math.abs(difX) * 1;
    } else if (this.player.targetY !== this.player.sprite.y) {
      const difY = this.player.targetY - this.player.sprite.y;
      this.setDir();
      this.player.sprite.y += difY / Math.abs(difY) * 1;
    } else {
      this.setDir();
    }
    if (++this.tick === this.cmdDelta) {
      this.tick = 0;
      // 向きをplayerDに揃える
      // runCodeとゴール判定を同じタイミングで行うことで、移動が完了してから(正確には次のコードを受理できるタイミングになってから)ゴール判定がなされるようにした
      // ゴール判定を満たすならばゴール処理
      // そうでなければ通常の処理
      if (this.goal.gridX === this.player.gridX && this.goal.gridY === this.player.gridY) {
        const phaserDiv = document.getElementById('phaserDiv');

        // TODO: ゲームクリアという表示を出す

        const button = new FlipButton(phaserDiv, '次へ', 50, 500, 100, 50);
        const buttonT = new FlipButton(phaserDiv, 'タイトルへ', 50, 550, 250, 50);
        const buttonS = new FlipButton(phaserDiv, 'ステージ', 50, 450, 250, 50);

        button.button.addEventListener('click', function() {
          // TODO: ボタン押したら次のゲームが展開されるようにしたい
          this.exitScene();
          if (stageList.length == this.idx + 1) {
            this.scene.start('stage-select');
          } else {
            this.scene.start('load', {stage_dir: stageList[this.idx + 1].id, idx: this.idx + 1});
          }
        }.bind(this));
        buttonS.button.addEventListener('click', function() {
          this.exitScene();
          this.scene.start('stage-select');
        }.bind(this));
        buttonT.button.addEventListener('click', function() {
          this.exitScene();
          this.scene.start('title');
        }.bind(this));

        this.execMode = enumExecModeClear;
      } else {
        const gen = this.commandGenerator.next();
        console.log(gen.value);
        this.workspace.highlightBlock(gen.value);
        if (gen.done) {
          this.execMode = enumExecModeDone;
          this.blocklyRunner.endRunning();
        }
      }
    }
    if (this.tick > this.cmdDelta) {
      console.error('Scene Game: tick exceeded cmdDelta');
    }
  }

  startBlockly() {
    console.log('start blockly');
    if (this.execMode === enumExecModePre) {
      this.execMode = enumExecModeRun;

      console.log(this.workspace);
      // メインループ以外のルートブロックの削除
      this.workspace.getTopBlocks().forEach(function(block) {
        if (block.id !== this.blocklyRunner.rootBlockId) {
          block.dispose(false);
        }
      }.bind(this));
      let code = Blockly.JavaScript.workspaceToCode(this.workspace);

      // ジェネレータに変換
      code = '(function* () {' + code + '})';

      try {
        console.log('code: ', code);
        this.commandGenerator = eval(code).bind(this)();
      } catch (err) {
        console.error(err);
      }

      this.blocklyRunner.updateBlockly();
      this.redrawPauseButton();
      return this.commandGenerator;
    } else if (this.execMode == enumExecModeRun) {
      this.execMode = enumExecModePause;
      this.player.sprite.anims.stop();
    } else if (this.execMode === enumExecModePause) {
      this.execMode = enumExecModeRun;
    }
    this.redrawPauseButton();
    return null;
  };

  redrawPauseButton() {
    const element = document.getElementById('executeButton');
    if (this.execMode === enumExecModePause || this.execMode === enumExecModePre) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      const playIcon = document.createElement('i');
      playIcon.setAttribute('class', 'fas fa-play-circle');
      element.appendChild(playIcon);
    } else {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      const pauseIcon = document.createElement('i');
      pauseIcon.setAttribute('class', 'fas fa-pause-circle');
      element.appendChild(pauseIcon);
    }
  };

  // playerの位置を初期位置に戻す
  // TODO: ここ冗長そう（constructorと同様の処理を書くのはアです）←まとめました
  initGameField() {
    console.log('initGameField');
    this.player.sprite.anims.stop();// 同じくresetボタン押したらアニメーションを停止し、


    const playerX = this.stageRunner.stageConfig.playerX;
    const playerY = this.stageRunner.stageConfig.playerY;
    const playerD = this.stageRunner.stageConfig.playerD;
    const goalX = this.stageRunner.stageConfig.goalX;
    const goalY = this.stageRunner.stageConfig.goalY;

    this.player.sprite.x = this.mapDat.tileWidth * playerX * this.map2Img;
    this.player.sprite.y = this.mapDat.tileWidth * (playerY + 0.9) * this.map2Img;

    this.player.gridX = playerX;
    this.player.gridY = playerY;
    this.player.dir = playerD;
    this.setDir();// 指定した向きを向くようにしている
    this.player.targetX = this.player.sprite.x;
    this.player.targetY = this.player.sprite.y;
    this.goal.gridX = goalX;
    this.goal.gridY = goalY;

    this.execMode = enumExecModePre;

    this.commandGenerator = null;
    this.cmdDelta = 1;
    this.tick = 0;

    // ゲームクリアを考慮し、phaserDiv内の整理
    this.phaserDiv = document.getElementById('phaserDiv');
    document.querySelectorAll('#phaserDiv div').forEach((v) => {
      if (this.phaserDiv.contains(v)) {
        this.phaserDiv.removeChild(v);
      }
    });
    const executeButton = document.createElement('div');
    executeButton.setAttribute('id', 'executeButton');
    executeButton.setAttribute('class', 'circle_button');
    const executeIcon = document.createElement('i');
    executeIcon.setAttribute('class', 'fas fa-play-circle');
    executeButton.appendChild(executeIcon);
    phaserDiv.appendChild(executeButton);
    executeButton.onclick = this.startBlockly.bind(this);

    const resetButton = document.createElement('div');
    resetButton.setAttribute('id', 'resetButton');
    resetButton.setAttribute('class', 'circle_button');
    const resetIcon = document.createElement('i');
    resetIcon.setAttribute('class', 'fas fa-stop-circle');
    resetButton.appendChild(resetIcon);
    phaserDiv.appendChild(resetButton);
    resetButton.onclick = this.initGameField.bind(this);

    const backButton = document.createElement('div');
    backButton.setAttribute('id', 'backButton');
    backButton.setAttribute('class', 'circle_button');
    backButton.innerHTML = 'back';
    phaserDiv.appendChild(backButton);
    backButton.onclick = this.backToStageSelect.bind(this);


    this.redrawPauseButton();
  };

  backToStageSelect() {
    this.exitScene();
    this.scene.start('stage-select');
  }
  // シーンを終了する時は必ずこの関数を通ること
  exitScene() {
    this.workspace.dispose();
    this.workspace = null;
  };


  // TODO: ここに置くべきかどうか考えておく
  changeDir(player, dir) { // 向きを変えるとかのブロックに使う
    player.dir = dir;
  }
  tryMove(player, dir) {
    this.changeDir(player, ['right', 'left', 'up', 'down'][dir]);
    if (dir < 0 || dir >= 4) console.error('incorrect dir in tryMove()');

    const dx = [1, -1, 0, 0];
    const dy = [0, 0, -1, 1];
    const nextGX = player.gridX + dx[dir];
    const nextGY = player.gridY + dy[dir];
    if (this.mapDat.isWall[nextGY][nextGX]) {
      return;
    } else {
      player.targetX += dx[dir] * this.mapDat.tileWidth * this.map2Img;
      player.gridX = nextGX;
      player.targetY += dy[dir] * this.mapDat.tileHeight * this.map2Img;
      player.gridY = nextGY;
    }
  };
}

class Player {
  constructor() {
    this.sprite;
    this.gridX;
    this.gridY;
    this.targetX;
    this.targetY;
  }
}

class Goal {
  constructor() {
    this.gridX;
    this.gridY;
  }
}

export default SceneGame;
