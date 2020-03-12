import Blockly from 'blockly';
import Phaser from 'phaser';

import StageRunner from '../stage/test/StageRunner';
import BlocklyRunner from '../Blockly/BlocklyRunner.js';

import playerImg from '../../public/stage/obake.png';
import playerImg1 from '../../public/stage/obake2.png';
import playerImg2 from '../../public/stage/obake3.png';
import playerImg3 from '../../public/stage/obake4.png';
import SimpleButton from '../Objects/Objects.js';

class SceneGame extends Phaser.Scene {
  init(data) {
    this.loadedDataSrc.tilemap = import('../../public/stage/' + data.stage_dir + '/tilemap.json');
    this.loadedDataSrc.tilesets = import('../../public/stage/' + data.stage_dir + '/tilesets.png');
  }

  constructor() {
    super({key: 'game'});

    // 僕のblocklyに対するブチ切れ案件1
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

    // これらはgame管理classへ飛ばせる

    // コードの実行中であるか
    this.isRunning;
    // ステージがクリア状態であるか
    this.isCleared;
    // コードの開始を行って良いか
    this.isExecutable = true;

    // ポーズ状態であるか
    this.isPause;

    // stagerunner class
    this.stageRunner = new StageRunner();
    // blocklyrunner class
    this.blocklyRunner = new BlocklyRunner(this.stageRunner.xmlFilePath);

    this.loadedDataSrc = {};
  }

  preload() {
    // この内容はStageRunner.loadに入れたいけど、出来ていない
    // map
    this.loadedDataSrc.tilemap.then((res) => {
      this.load.tilemapTiledJSON('map1', res.default);
    });

    this.loadedDataSrc.tilesets.then((res) => {
      this.load.image('tiles', res.default);
    });

    // player
    // TODO playerImgだけは動的importしてない
    this.load.spritesheet('player', playerImg, {frameWidth: 32, frameHeight: 32});
  }

  create() {
    this.game.scale.setGameSize(400, 600);

    // 変数の初期化(再start時に勝手に初期化してくれない？ので)
    this.commandGenerator=null;
    // cmdDeltaは命令実行毎に書き換わるようにした
    this.cmdDelta = 1;
    this.tick = 0;
    this.isRunning = false;
    this.isPause = false;
    this.isCleared = false;
    this.isExecutable = true;

    // htmlボタンを可視化する
    document.getElementById('executeButton').style.visibility='visible';
    document.getElementById('pauseButton').style.visibility='visible';

    // stage固有ブロックの定義 stageの定義の方に移せると思う
    // stage option
    this.blocklyRunner.setBlockDefinition('move', {
      'type': 'move',
      'message0': '%1 にすすむ',
      'args0': [{
        'type': 'field_dropdown',
        'name': 'move_direction',
        'options': [
          ['→', '0'],
          ['←', '1'],
          ['↑', '2'],
          ['↓', '3'],
        ],
      }],
      'previousStatement': null,
      'nextStatement': null,
      'colour': 270,
      'tooltip': '',
      'helpUrl': '',
    }, function(block) {
      // TODO: ここ、blockをJSON.stringifyしてyieldの返り値で返せばhighlight出来る
      const dropdownDirection = block.getFieldValue('move_direction');
      return `this.tryMove(this.player, ${dropdownDirection});\
                this.cmdDelta=35;\
                yield true;\n`;
    });

    // blocklyのdiv.style.leftを予め調整しておく
    const blocklyDiv = document.getElementById('blocklyDiv');
    blocklyDiv.style.left = this.game.canvas.width;

    // blocklyの描画設定(レンダリング)
    // コールバック関数を渡す時はちゃんとbindする
    this.blocklyRunner.renderBlockly(this.startBlockly.bind(this), this.pauseBlockly.bind(this))
        .then((space) => {
          this.workspace = space;
        });

    // mapの表示(mapはcanvasのwidth,heightと同じ比で作成されていることが前提です)
    this.mapDat = this.add.tilemap('map1');
    const tileset = this.mapDat.addTilesetImage('tileset', 'tiles');
    this.backgroundLayer = this.mapDat.createDynamicLayer('ground', tileset);
    this.map2Img = this.game.canvas.width / this.backgroundLayer.width;
    this.backgroundLayer.setScale(this.map2Img);
    this.mapDat = {...this.mapDat, ...this.stageRunner.stageConfig};

    // 初期位置はstageクラスに乗せるとして...（プレイヤーとマップの微妙なズレは要調整）
    // 実はthis.mapDat.tilesets[0].texCoordinatesに各tileの座標が記録されています(が今回使っていない)
    const playerX = this.stageRunner.stageConfig.playerX;
    const playerY = this.stageRunner.stageConfig.playerY;
    const goalX = this.stageRunner.stageConfig.goalX;
    const goalY = this.stageRunner.stageConfig.goalY;
    this.player.sprite = this.add.sprite(
        this.mapDat.tileWidth * playerX * this.map2Img,
        this.mapDat.tileWidth * (playerY + 0.9) * this.map2Img,
        'player');
    this.player.sprite.setOrigin(0, 1);


    this.player.gridX = playerX;
    this.player.gridY = playerY;
    this.player.targetX = this.player.sprite.x;
    this.player.targetY = this.player.sprite.y;
    this.goal.gridX = goalX;
    this.goal.gridY = goalY;

    // リセットボタン
    const buttonReset = new SimpleButton(this, 300, 0, 100, 30, 0x7f7fff, 'reset', 'blue');
    buttonReset.button.on('pointerdown', function() {
      this.reset();
    }.bind(this));
    // ステージセレクトに戻る
    const buttonBack = new SimpleButton(this, 0, 0, 100, 30, 0x7fff7f, 'back', 'green');
    buttonBack.button.on('pointerdown', function() {
      this.exitScene();
      this.scene.start('stage-select');
    }.bind(this));
  }

  update() {
    if (this.isPause) return;
    if (this.isRunning) this.updateOnRunning();
  }

  // 実行中の処理を行うパート
  updateOnRunning() {
    // これはobjectリストなるものをここに用意しておいて、適宜push/popすることでまとめて管理も可能
    if (this.player.targetX !== this.player.sprite.x) {
      const difX = this.player.targetX - this.player.sprite.x;
      // とてもよくない(画像サイズ規定を設けるor微分方程式なので減衰覚悟でやる)
      if(difX > 0) this.player.sprite.setFrame(6);
      else if(difX < 0) this.player.sprite.setFrame(3);
      this.player.sprite.x += difX / Math.abs(difX) * 1;
    }
    if (this.player.targetY !== this.player.sprite.y) {
      const difY = this.player.targetY - this.player.sprite.y;
      if(difY > 0) this.player.sprite.setFrame(9);
      else if(difY < 0) this.player.sprite.setFrame(0);
      this.player.sprite.y += difY / Math.abs(difY) * 1;
    }
    if (++this.tick === this.cmdDelta) {
      this.tick = 0;
      // runCodeとゴール判定を同じタイミングで行うことで、移動が完了してから(正確には次のコードを受理できるタイミングになってから)ゴール判定がなされるようにした
      // ゴール判定を満たすならばゴール処理
      // そうでなければ通常の処理
      if (this.goal.gridX === this.player.gridX && this.goal.gridY === this.player.gridY) {
        const button = new SimpleButton(this, 50, 500, 100, 50, 0x7fff7f, '次へ', 'green');
        const buttonT = new SimpleButton(this, 50, 550, 250, 50, 0xff7f7f, 'タイトルへ', 'red');
        const buttonS = new SimpleButton(this, 50, 450, 250, 50, 0x7f7fff, 'ステージ', 'blue');
        // ボタンを消す処理等が整備されていないため、clear後のリセットができない
        // var buttonR = new SimpleButton(this,50,400,250,50,0xff7fff,'やりなおす','purple');
        // eslint-disable-next-line no-unused-vars
        const button2 = new SimpleButton(this, 50, 200, 300, 50, 0xfffff00, 'Game Clear', 'green');
        button.button.on('pointerdown', function() {
          // ボタン押したら次のゲームが展開されるようにしたい
          this.exitScene();
          this.scene.start('次のゲーム');
        }.bind(this));
        buttonS.button.on('pointerdown', function() {
          this.exitScene();
          this.scene.start('stage-select');
        }.bind(this));
        buttonT.button.on('pointerdown', function() {
          this.exitScene();
          this.scene.start('title');
        }.bind(this));
        /*
        buttonR.button.on('pointerdown', function(){
          this.isCleared=false;
          this.reset();
        }.bind(this));
*/
        this.isCleared=true;
        this.isRunning=false;
      } else {
        const gen = this.commandGenerator.next();
        if (gen.done) {
          this.isRunning = false;
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
    if (this.isExecutable) {
      this.isExecutable = false;
      this.isRunning=true;

      console.log(this.workspace);
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
      return this.commandGenerator;
    } else {
      return null;
    }
  };

  pauseBlockly() {
    // ポーズした時の処理を入れる
    if (!this.isRunning) return;
    console.log('pause blockly');
    this.isPause = !this.isPause;
    this.redrawPauseButton();
  };

  redrawPauseButton() {
    const element = document.getElementById('pauseButton');
    if (this.isPause) {
      element.innerHTML = 'restart';
    } else {
      element.innerHTML = 'pause';
    }
  };

  // playerの位置を初期位置に戻す
  // TODO: ここ冗長そう（constructorと同様の処理を書くのはアです）
  reset() {
    console.log('reset');
    if (!this.isCleared) {
      const playerX = this.stageRunner.stageConfig.playerX;
      const playerY = this.stageRunner.stageConfig.playerY;
      this.player.sprite.x = this.mapDat.tileWidth * playerX * this.map2Img;
      this.player.sprite.y = this.mapDat.tileWidth * (playerY + 0.9) * this.map2Img;

      this.player.gridX = playerX;
      this.player.gridY = playerY;
      this.player.targetX = this.player.sprite.x;
      this.player.targetY = this.player.sprite.y;

      this.isRunning = false;
      this.isPause = false;
      this.isExecutable = true;

      this.redrawPauseButton();
      this.commandGenerator = null;
    }
  };


  // シーンを終了する時は必ずこの関数を通ること
  exitScene() {
    this.workspace.dispose();
    this.workspace=null;
    document.getElementById('executeButton').style.visibility='hidden';
    document.getElementById('pauseButton').style.visibility='hidden';
    document.getElementById('executeButton').onclick=null;
    document.getElementById('pauseButton').onclick=null;
  };

  // TODO: ここに置くべきかどうか考えておく
  tryMove(player, dir) {
    if (dir < 0 || dir >= 4) console.error('incorrect dir in tryMove()');

    const dx = [1, -1, 0, 0];
    const dy = [0, 0, -1, 1];
    const nextGX = player.gridX + dx[dir];
    const nextGY = player.gridY + dy[dir];
    if (this.mapDat.isWall[nextGY][nextGX]) return;
    else {
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
