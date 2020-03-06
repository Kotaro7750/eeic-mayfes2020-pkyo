import Blockly from "blockly";
import Phaser from "phaser";

import StageRunner from "../stage/test/StageRunner";
import BlocklyRunner from "../Blockly/BlocklyRunner.js";

import map1 from "../../public/stage/test/tilemap.json";
import tiles from "../../public/stage/test/tilesets.png";
import playerImg from "../../public/stage/obake.png";
import goalImg from "../../public/stage/test/goaltest.png";
import SimpleButton from "../Objects/Objects.js";

//簡易ボタンを使う場合はコメントアウトを解除する
//import SimpleButton from "../Objects/Objects.js";

class SceneGame extends Phaser.Scene {
    
    constructor ()
    {
        super({ key: 'game'});
                
        // 僕のblocklyに対するブチ切れ案件1
        this.workspace;

        // game管理classのうちphaser持ち
        this.player=new Player();
        this.goal = new Goal();
        this.mapDat;
        this.map2Img;

        //コマンド生成用ジェネレータ
        this.commandGenerator;
        this.cmdDelta = 45;
        this.tick = 0;

        // これらはgame管理classへ飛ばせる
        this.isRunning = false;

        // stagerunner class
        this.stageRunner = new StageRunner();
        // blocklyrunner class
        this.blocklyRunner = new BlocklyRunner(this.stageRunner.xmlFilePath);
        
    }

    preload() {
        // この内容はStageRunner.loadに入れたいけど、出来ていない
        // map
        this.load.tilemapTiledJSON("map1", map1);
        this.load.image("tiles", tiles);
        // player
        this.load.spritesheet("player", playerImg, {frameWidth: 32, frameHeight: 32});
        this.load.image("goal", goalImg);
    }
    
    create() {
        // stage固有ブロックの定義　stageの定義の方に移せると思う
        // stage option
        this.blocklyRunner.setBlockDefinition("move", function() {
            this.appendDummyInput()
            .appendField("Move")
            .appendField(new Blockly.FieldDropdown([
                ["→", "0"],
                ["←", "1"],
                ["↑", "2"],
                ["↓", "3"]
            ]), "move_direction");
            this.setNextStatement(true);
            this.setPreviousStatement(true);
            this.setColour(270);
            this.setTooltip("");
            this.setHelpUrl("");
        }, function(block) {
            // TODO: ここ、blockをJSON.stringifyしてyieldの返り値で返せばhighlight出来る
            var dropdown_direction = block.getFieldValue('move_direction');
            return `this.tryMove(this.player, ${dropdown_direction});\
                yield true;\n`;
        });

        // blocklyのdiv.style.leftを予め調整しておく
        const blocklyDiv = document.getElementById("blocklyDiv");
        blocklyDiv.style.left = this.game.canvas.width;

        //blocklyの描画設定(レンダリング)
        //コールバック関数を渡す時はちゃんとbindする
        this.blocklyRunner.renderBlockly(this.startBlockly.bind(this))
            .then((space) => {
                this.workspace = space;
            });

        // mapの表示(mapはcanvasのwidth,heightと同じ比で作成されていることが前提です)
        this.mapDat = this.add.tilemap("map1");
        let tileset = this.mapDat.addTilesetImage("tileset", "tiles");
        this.backgroundLayer = this.mapDat.createDynamicLayer("ground", tileset);
        this.map2Img = this.game.canvas.width / this.backgroundLayer.width;
        this.backgroundLayer.setScale(this.map2Img);
        this.mapDat = { ...this.mapDat, ...this.stageRunner.stageConfig };
    
        // 初期位置はstageクラスに乗せるとして...（プレイヤーとマップの微妙なズレは要調整）
        // 実はthis.mapDat.tilesets[0].texCoordinatesに各tileの座標が記録されています(が今回使っていない)
        let playerX = this.stageRunner.stageConfig.playerX;
        let playerY = this.stageRunner.stageConfig.playerY;
        let goalX = this.stageRunner.stageConfig.goalX;
        let goalY = this.stageRunner.stageConfig.goalY;
        this.player.sprite = this.add.sprite(this.mapDat.tileWidth * playerX * this.map2Img, this.mapDat.tileWidth * (playerY + 0.9) * this.map2Img, "player");
        this.player.sprite.setOrigin(0, 1);
        
        // †JSの闇†を使った定義(JSの闇は祓われた)
        this.player.gridX = playerX;
        this.player.gridY = playerY;
        this.player.targetX = this.player.sprite.x;
        this.player.targetY = this.player.sprite.y;
        this.goal.gridX = goalX;
        this.goal.gridY = goalY;
    }
    
    update() {
        // これはobjectリストなるものをここに用意しておいて、適宜push/popすることでまとめて管理も可能
        if (this.player.targetX !== this.player.sprite.x) {
            const difX = this.player.targetX - this.player.sprite.x;
            this.player.sprite.x += difX / Math.abs(difX) * 1;  // とてもよくない(画像サイズ規定を設けるor微分方程式なので減衰覚悟でやる)
        }
        if (this.player.targetY !== this.player.sprite.y) {
            const difY = this.player.targetY - this.player.sprite.y;
            this.player.sprite.y += difY / Math.abs(difY) * 1;
        }
        if(this.goal.gridX === this.player.gridX && this.goal.gridY === this.player.gridY){
            //ボタン類はゴールしてから時間差をつけて表示したい(setTimeoutが使えそう)
            var button = new SimpleButton(this,50,500,100,50,0xfffff00,'次へ',"green");
            var button1 = new SimpleButton(this,50,450,250,50,0x0000ff,'タイトルへ',"red");
            var button2 = new SimpleButton(this,150,200,150,50,0xfffff00,'clear',"green");
            button.button.on('pointerdown', function(){
                //ボタン押したら次のゲームが展開されるようにしたい
                this.scene.start('次のゲーム');
            }.bind(this));
            button1.button.on('pointerdown', function(){
                //このままでは前回の操作が残ってしまうので停止するor画面を初期化したい
                this.scene.start('title');
            }.bind(this));
            return;//ゴールについたら操作を終了したいのでとりあえずreturn。
        }
        this.runCode(this.commandGenerator);
    }

    runCode() {
        if (this.isRunning) {
            if (++this.tick === this.cmdDelta) {
                let gen = this.commandGenerator.next();
                if (!gen.done) this.tick = 0;
                else {
                    this.isRunning = false;
                    this.blocklyRunner.endRunning();
                }
            }
        }
    };

    startBlockly() {
        console.log("start blockly");
        if (!this.isRunning) {
            this.isRunning = true;
    
            console.log(this.workspace);
            let code = Blockly.JavaScript.workspaceToCode(this.workspace);

            //ジェネレータに変換
            code = "(function* () {" + code + "})";

            try {
                console.log("code: ", code);
                this.commandGenerator = eval(code).bind(this)();
            } catch(err) {
                console.error(err);
            }
    
            this.blocklyRunner.updateBlockly();
            return this.commandGenerator;
        } else {
            return null;
        }
    };


    tryMove(player, dir) {
        // ここはこれでいいの？ってなるけど
        if(dir<0 || dir>=4) console.error("incorrect dir in tryMove()");

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
    }

}

class Player{
    constructor(){
        this.sprite;
        this.gridX;
        this.gridY;
        this.targetX;
        this.targetY;
    }
}

class Goal{
    constructor(){
        this.gridX;
        this.gridY;
    }
}

export default SceneGame;