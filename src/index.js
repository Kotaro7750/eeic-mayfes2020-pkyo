import Blockly from "blockly";
import Phaser from "phaser";
import map1 from "../public/stage/test/tilemap.json";
import tiles from "../public/stage/test/tilesets.png";
import playerImg from "../public/stage/obake.png";
import BlocklyRunner from "./Blockly/BlocklyRunner.js";
import StageRunner from "./stage/test/StageRunner";

// TODO: 未検証ですが、setGameSizeを使うことでcanvasサイズが動的に変更できそうです→stage選択画面が窮屈にならずに済む
const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    parent: "phaserDiv",
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// blocklyのdiv.style.leftを予め調整しておく
const blocklyDiv = document.getElementById("blocklyDiv");
blocklyDiv.style.left = config.width;

// initialize(この辺のvar/constはクラスでどっかに飛ばしたい)
var game = new Phaser.Game(config);

// これらはgame管理classへ飛ばせる
const cmdDelta = 45;
var tick = 0;
var isRunning = false;
//コマンド生成用ジェネレータ
let commandGenerator;
// game管理classのうちphaser持ち
var player;
var mapDat;
var map2Img;

// stagerunner class
const stageRunner = new StageRunner();
// blocklyrunner class
const blocklyRunner = new BlocklyRunner(stageRunner.xmlFilePath);

function preload() {
    // この内容はStageRunner.loadに入れたいけど、出来ていない
    // map
    this.load.tilemapTiledJSON("map1", map1);
    this.load.image("tiles", tiles);
    // player
    this.load.spritesheet("player", playerImg, {frameWidth: 32, frameHeight: 32});
}

function create() {
    // mapの表示(mapはcanvasのwidth,heightと同じ比で作成されていることが前提です)
    mapDat = this.add.tilemap("map1");
    let tileset = mapDat.addTilesetImage("tileset", "tiles");
    this.backgroundLayer = mapDat.createDynamicLayer("ground", tileset);
    map2Img = game.canvas.width / this.backgroundLayer.width;
    this.backgroundLayer.setScale(map2Img);
    mapDat = { ...mapDat, ...stageRunner.stageConfig };

    // 初期位置はstageクラスに乗せるとして...（プレイヤーとマップの微妙なズレは要調整）
    // 実はmapDat.tilesets[0].texCoordinatesに各tileの座標が記録されています(が今回使っていない)
    let playerX = stageRunner.stageConfig.playerX;
    let playerY = stageRunner.stageConfig.playerY;
    player = this.add.sprite(mapDat.tileWidth * playerX * map2Img, mapDat.tileWidth * (playerY + 0.9) * map2Img, "player");
    player.setOrigin(0, 1);
    // †JSの闇†を使った定義
    player.gridX = playerX;
    player.gridY = playerY;
    player.targetX = player.x;
    player.targetY = player.y;
}

function update() {
    // move: player.x += mapDat.tileWidth * map2Img * velocity;
    // これはobjectリストなるものをここに用意しておいて、適宜push/popすることでまとめて管理も可能
    if (player.targetX != player.x) {
        const difX = player.targetX - player.x;
        player.x += difX / Math.abs(difX) * 1;  // とてもよくない(画像サイズ規定を設けるor微分方程式なので減衰覚悟でやる)
    }
    if (player.targetY != player.y) {
        const difY = player.targetY - player.y;
        player.y += difY / Math.abs(difY) * 1;
    }
    runCode(commandGenerator);
}

// class stageに入れたい
function tryMove(player, dir) {
    // ここはこれでいいの？ってなるけど
    const dx = [1, -1, 0, 0];
    const dy = [0, 0, -1, 1];
    const nextGX = player.gridX + dx[dir];
    const nextGY = player.gridY + dy[dir];
    if (mapDat.isWall[nextGY][nextGX])    return;
    else {
        player.targetX += dx[dir] * mapDat.tileWidth * map2Img;
        player.gridX = nextGX;
        player.targetY += dy[dir] * mapDat.tileHeight * map2Img;
        player.gridY = nextGY;
    }
}


function startBlockly() {
    console.log("start");
    if (!isRunning) {
        isRunning = true;
        window.LoopTrap = 1000;
        Blockly.JavaScript.INFINITE_LOOP_TRAP = 'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';

        console.log(workspace);
        let code = Blockly.JavaScript.workspaceToCode(workspace);
        Blockly.JavaScript.INFINITE_LOOP_TRAP = null;

        try {
            console.log("code: ", code);
            commandGenerator = eval("(function* () {" + code + "})()");
        } catch(err) {
            console.error(err);
        }

        blocklyRunner.updateBlockly(isRunning);
        return commandGenerator;
    } else {
        return null;
    }
};


function runCode() {
    console.log(commandGenerator);
    if (isRunning) {
        if (++tick === cmdDelta) {
            let gen = commandGenerator.next();
            if (!gen.done) tick = 0;
            else {
                blocklyRunner.endRunning();
            }
        }
    }
};

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
    return `tryMove(player, ${dropdown_direction});\
        yield true;\n`;
});

// 僕のblocklyに対するブチ切れ案件1
var workspace;
blocklyRunner.renderBlockly(startBlockly)
    .then((space) => {
        workspace = space;
    });