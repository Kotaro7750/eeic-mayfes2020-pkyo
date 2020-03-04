import Blockly from "blockly";
import Phaser from "phaser";
import map1 from "../public/stage/test/tilemap.json";
import tiles from "../public/stage/test/tilesets.png";
import playerImg from "../public/stage/obake.png";
import BlocklyRunner from "./Blockly/BlocklyRunner.js";
import StageRunner from "./stage/test/StageRunner";

//import SceneController from "./Scenes/SceneController.js";
//import SceneTitle from "./Scenes/SceneTitle.js";
import SceneGame from "./Scenes/SceneGame.js";




// TODO: 未検証ですが、setGameSizeを使うことでcanvasサイズが動的に変更できそうです→stage選択画面が窮屈にならずに済む
const config = {
    Extends: Phaser.Scene,
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    parent: "phaserDiv",
    scene: SceneGame
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

// stagerunner class
const stageRunner = new StageRunner();
// blocklyrunner class
const blocklyRunner = new BlocklyRunner(stageRunner.xmlFilePath);


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

function runCode() {
    console.log(commandGenerator);
    if (isRunning) {
        if (++tick === cmdDelta) {
            let gen = commandGenerator.next();
            if (!gen.done) tick = 0;
            else {
                endRunning();
            }
        }
    }
};

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

        blocklyRunner.updateBlockly();
        return commandGenerator;
    } else {
        return null;
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