import Blockly from "blockly";
import Phaser from "phaser";

import map1 from "../../public/stage/test/tilemap.json";
import tiles from "../../public/stage/test/tilesets.png";
import playerImg from "../../public/stage/obake.png";

import BlocklyRunner from "../Blockly/BlocklyRunner.js";
import StageRunner from "../stage/test/StageRunner";

class SceneGame extends Phaser.Scene {
    
    constructor ()
    {
        super();
        
        // game管理classのうちphaser持ち
        this.player;
        this.mapDat;
        this.map2Img;

        //コマンド生成用ジェネレータ
        this.commandGenerator;
        this.cmdDelta = 45;
        this.tick = 0;

        // これらはgame管理classへ飛ばせる
        this.isRunning = false;

        // stage option
        blocklyRunner.setBlockDefinition("move", function() {
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
            return `scene.tryMove(scene.player, ${dropdown_direction});\
                yield true;\n`;
        });
        
    }

    preload() {
        // この内容はStageRunner.loadに入れたいけど、出来ていない
        // map
        this.load.tilemapTiledJSON("map1", map1);
        this.load.image("tiles", tiles);
        // player
        this.load.spritesheet("player", playerImg, {frameWidth: 32, frameHeight: 32});
    }
    
    create() {
        // blocklyのdiv.style.leftを予め調整しておく
        const blocklyDiv = document.getElementById("blocklyDiv");
        blocklyDiv.style.left = this.game.canvas.width;

        //blocklyを描画
        blocklyRunner.renderBlockly(this)
            .then((space) => {
                workspace = space;
            });
        // mapの表示(mapはcanvasのwidth,heightと同じ比で作成されていることが前提です)
        this.mapDat = this.add.tilemap("map1");
        let tileset = this.mapDat.addTilesetImage("tileset", "tiles");
        this.backgroundLayer = this.mapDat.createDynamicLayer("ground", tileset);
        this.map2Img = this.game.canvas.width / this.backgroundLayer.width;
        this.backgroundLayer.setScale(this.map2Img);
        this.mapDat = { ...this.mapDat, ...stageRunner.stageConfig };
    
        // 初期位置はstageクラスに乗せるとして...（プレイヤーとマップの微妙なズレは要調整）
        // 実はthis.mapDat.tilesets[0].texCoordinatesに各tileの座標が記録されています(が今回使っていない)
        let playerX = stageRunner.stageConfig.playerX;
        let playerY = stageRunner.stageConfig.playerY;
        this.player = this.add.sprite(this.mapDat.tileWidth * playerX * this.map2Img, this.mapDat.tileWidth * (playerY + 0.9) * this.map2Img, "player");
        this.player.setOrigin(0, 1);
        // †JSの闇†を使った定義
        this.player.gridX = playerX;
        this.player.gridY = playerY;
        this.player.targetX = this.player.x;
        this.player.targetY = this.player.y;
/*
        var rect = new Phaser.Geom.Rectangle(150, 200, 200, 200);
        var graphics = this.add.graphics({ fillStyle: { color: 0x0000ff } });
        graphics.fillRectShape(rect);*/
    }
    
    update() {
        // move: this.player.x += this.mapDat.tileWidth * this.map2Img * velocity;
        // これはobjectリストなるものをここに用意しておいて、適宜push/popすることでまとめて管理も可能
        if (this.player.targetX != this.player.x) {
            const difX = this.player.targetX - this.player.x;
            this.player.x += difX / Math.abs(difX) * 1;  // とてもよくない(画像サイズ規定を設けるor微分方程式なので減衰覚悟でやる)
        }
        if (this.player.targetY != this.player.y) {
            const difY = this.player.targetY - this.player.y;
            this.player.y += difY / Math.abs(difY) * 1;
        }
        this.runCode(this.commandGenerator);
    }

    runCode() {
        //console.log(commandGenerator);
        if (this.isRunning) {
            if (++this.tick === this.cmdDelta) {
                let gen = this.commandGenerator.next();
                if (!gen.done) this.tick = 0;
                else {
                    blocklyRunner.endRunning();
                }
            }
        }
    };

    startBlockly() {
        console.log("start");
        if (!this.isRunning) {
            this.isRunning = true;
    
            console.log(workspace);
            let code = Blockly.JavaScript.workspaceToCode(workspace);
    
            try {
                console.log("code: ", code);
                this.commandGenerator = eval("(function* (scene) {" + code + "})(this)");
            } catch(err) {
                console.error(err);
            }
    
            blocklyRunner.updateBlockly();
            return this.commandGenerator;
        } else {
            return null;
        }
    };


    tryMove(player, dir) {
        // ここはこれでいいの？ってなるけど
        const dx = [1, -1, 0, 0];
        const dy = [0, 0, -1, 1];
        const nextGX = this.player.gridX + dx[dir];
        const nextGY = this.player.gridY + dy[dir];
        if (this.mapDat.isWall[nextGY][nextGX]) return;
        else {
            player.targetX += dx[dir] * this.mapDat.tileWidth * this.map2Img;

            player.gridX = nextGX;
            player.targetY += dy[dir] * this.mapDat.tileHeight * this.map2Img;
            player.gridY = nextGY;
        }
    }

}

// stagerunner class
const stageRunner = new StageRunner();
// blocklyrunner class
const blocklyRunner = new BlocklyRunner(stageRunner.xmlFilePath);

// 僕のblocklyに対するブチ切れ案件1
var workspace;



export default SceneGame;