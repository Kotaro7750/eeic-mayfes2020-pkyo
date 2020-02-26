import Blockly from "blockly";
import Phaser from "phaser";
import map1 from "../public/stage/test/tilemap.json";
import tiles from "../public/stage/test/tilesets.png";
import playerImg from "../public/stage/obake.png";
import stageConfig from "./stage/test/config.json";

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
const cmdDelta = 45;
var tick = 0;
var isRunning = false;
//コマンド生成用ジェネレータ
let commandGenerator;
// console.log(initBlockly);
setBlockDefinition("loop", function() {
    this.appendDummyInput()
        .appendField("この中の内容を繰り返します");
    this.appendStatementInput("LOOP");
    this.setColour(360);
    this.setTooltip("");
    this.setHelpUrl("");
}, function(block) {
    let code = Blockly.JavaScript.statementToCode(block, "LOOP");
    return "while (true) {\n"
        + code
        + "}\n";
});

isRunning = false;
tick = 0;

// 出来れば消し去りたいグローバル変数たち
var player;
var mapDat;
var map2Img;

function preload() {
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
    mapDat = { ...mapDat, ...stageConfig };

    // 初期位置はstageクラスに乗せるとして...（プレイヤーとマップの微妙なズレは要調整）
    // 実はmapDat.tilesets[0].texCoordinatesに各tileの座標が記録されています(が今回使っていない)
    let playerX = 5;
    let playerY = 12;
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
    console.log(player.gridX, player.targetX, player.x)
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

// blocklyrunner
function setBlockDefinition(name, init, conv) {
    Blockly.Blocks[name] = {
        init: init
    };
    Blockly.JavaScript[name] = (name) => {
        return conv(name);
    }
};

function renderBlockly(xml, maxBlocks) {
    if (typeof maxBlocks === "undefined") {
        maxBlocks = Infinity;
    }
    let options = {
        toolbox: xml,
        collapse: true,
        comments: true,
        disable: true,
        maxBlocks: maxBlocks,
        trashcan: true,
        horizontalLayout: false,
        toolboxPosition: "start",
        css: true,
        rtl: false,
        scrollbars: true,
        sounds: true,
        oneBasedIndex: true,
        grid: {
            spacing: 20,
            length: 1,
            colour: "#888",
            snap: true
        }
    };

    let workspace = Blockly.inject("blocklyDiv", options);
    return workspace;
};

function updateBlockly() {
    // 主に実行ボタンの描画更新（実行中/実行できるよ）の場所
    // ぶっちゃけボタンのclass変更してCSS変えるだけor画像切り替えるだけ
};

function startBlockly(commandGenerator) {
    if (!isRunning) {
        isRunning = true;
        window.LoopTrap = 1000;
        Blockly.JavaScript.INFINITE_LOOP_TRAP = 'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';

        let code = Blockly.JavaScript.workspaceToCode(workspace);
        Blockly.JavaScript.INFINITE_LOOP_TRAP = null;

        try {
            commandGenerator = eval("(function* () {" + code + "})()");
        } catch(err) {
            console.error(err);
        }
        updateBlockly();
        return commandGenerator;
    } else {
        return null;
    }
};

function endRunning() {
    isRunning = false;
    updateBlockly();
};

function runCode(commandGenerator) {
    if (isRunning) {
        if (++tick === cmdDelta) {
            let gen = commandGenerator.next();
            console.log("runcode: ", gen.done);
            if (!gen.done) tick = 0;
            else {
                endRunning();
            }
        }
    }
};

// stage option
setBlockDefinition("move", function() {
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

// TODO: 大絶賛甘え中。ステージ増やすならpathで取ってくる関数実装してね♪
const xmlStr = '<xml xmlns="">\
<block type="loop"></block>\
<block type="move"></block>\
</xml>'

// 僕のblocklyに対するブチ切れ案件1
var workspace = renderBlockly(xmlStr);

const executeButton = document.getElementById("executeButton");
executeButton.onclick = () => {
    commandGenerator = startBlockly(commandGenerator);
}