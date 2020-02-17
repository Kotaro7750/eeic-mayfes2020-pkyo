// ゲーム部

// メインキャンバス
let mainCanvas;
let subCanvasGame;

// デバッグメッセージ
let debugMsg;

let mouseManager;
let keyboardManager;

//画像ファイルを一括管理する
let imageManager;

let mainField;

let code={
    "Shift":16, "Ctrl":17, "Space":32, "Tab":9,
    "Up":38, "Down":40, "Left":37, "Right":39, 
    "0":48, "1":49, "2":50, "3":51, "4":52, 
    "5":53, "6":54, "7":55, "8":56, "9":57, 
    "A":65, "B":66, "C":67, "D":68, "E":69, "F":70, "G":71, 
    "H":72, "I":73, "J":74, "K":75, "L":76, "M":77, "N":78, 
    "O":79, "P":80, "Q":81, "R":82, "S":83, "T":84, "U":85, 
    "V":86, "W":87, "X":88, "Y":89, "Z":90
};


//各種定数
//1秒間の描画回数(flamesPerSecond)
const flamesPerSecond = 30;
const loopTime = 1000/flamesPerSecond;
const keycodeEnd = 256;
const wholeWidth = 640;
const wholeHeight = 480;

//汎用クラス
class Point{
    constructor(x=0,y=0) {
        this.x = x;
        this.y = y;
    }
}

//マウス情報の管理用クラス
class MouseManager{
    constructor() {
        this.point = new Point();
        this.pointImm = new Point();
        this.click = false;
        this.clickImm = false;
    }
    propagate(){
        this.point.x=this.pointImm.x;
        this.point.y=this.pointImm.y;
        this.click=this.clickImm;
    }
}

//キーボード情報の管理用クラス
class KeyboardManager{
    constructor() {
        this.key = new Array(keycodeEnd);
        for (let index = 0; index < keycodeEnd; index++) this.key[index]=false;

        this.upDur = new Array(keycodeEnd);
        for (let index = 0; index < keycodeEnd; index++) this.upDur[index]=0;

        this.downDur = new Array(keycodeEnd);
        for (let index = 0; index < keycodeEnd; index++) this.downDur[index]=0;

        this.keyImm = new Array(keycodeEnd);
        for (let index = 0; index < keycodeEnd; index++) this.keyImm[index]=false;
    }
    get(str){
        return this.key[code[str]];
    };
    getUpDur(str){
        return this.upDur[code[str]];
    };
    getDownDur(str){
        return this.downDur[code[str]];
    };

    propagate(){
        for (let index = 0; index < keycodeEnd; index++) {
            this.key[index]=this.keyImm[index];
            if (this.key[index]){
                this.downDur[index]++;
                this.upDur[index]=0;
            }else{
                this.downDur[index]=0;
                this.upDur[index]++;
            }
        }
    }
}

//画像データの管理用クラス
class ImageManager{
    constructor(){
        this.imageNum = 256;
        this.img = new Array(this.imageNum);
        for (let index=0; index<this.imageNum; index++)
            this.img[index] = new Image();
    }
}

//タイル(グリッド1マス分)の情報を保持するクラス
class Tile{
    constructor(){
    }
    draw(ctx){
        ctx.fillStyle="#FF7700";
        ctx.fillRect(2, 2, 28, 28);
    }
}

//アイテム(オブジェクト)の情報を保持するクラス
class Item{
    constructor(){
        this.row=-1;
        this.col=-1;
        this.type=-1;
        this.valid=false;
    }
    draw(ctx){
        switch(this.type){
            case 100:
                ctx.fillStyle="#77FF00";
                ctx.fillRect(2, 2, 28, 28);
                break;
        }
    }

}

//フィールド(ゲーム盤)の状態を統括するクラス
//子の要素として、全てのグリッドタイルとアイテムを保持する
class Field{
    constructor(rowsize,colsize) {
        this.rows = rowsize;
        this.cols = colsize;
        this.maxItems = 256;

        this.innerOfs = new Point(16,16);
        this.interval = new Point(32,32);
        this.cameraOfs = new Point(-16,-16);
        this.cameraScale = 1.0;

        this.tiles = new Array(this.rows);
        for (let index = 0; index < this.rows; index++)
            this.tiles[index] = new Array(this.cols);
        
        for (let iRow = 0; iRow < this.rows; iRow++)
            for (let iCol = 0; iCol < this.cols; iCol++)
                this.tiles[iRow][iCol]=new Tile();

        this.items = new Array(this.maxItems);
        for (let index = 0; index < this.maxItems; index++)
            this.items[index] = new Item();

        /*--テスト用--*/
        this.items[0].valid=true;
        this.items[0].row=0;
        this.items[0].col=0;
        this.items[0].type=100;
        /*------*/
    }
    moveItem(target,way){
        switch(way){
            case("D"):
                this.items[target].row++;
                if (this.items[target].row>=this.rows)
                    this.items[target].row-=this.rows;
            break;
            case("U"):
                this.items[target].row--;
                    if (this.items[target].row<0)
                        this.items[target].row+=this.rows;
            break;
            case("R"):
                this.items[target].col++;
                if (this.items[target].col>=this.cols)
                    this.items[target].col-=this.cols;
            break;
            case("L"):
                this.items[target].col--;
                    if (this.items[target].col<0)
                        this.items[target].col+=this.cols;
            break;
        }
    }
    draw(ctx){
        ctx.save();
            ctx.scale(this.cameraScale,this.cameraScale);
            ctx.translate(-this.cameraOfs.x,-this.cameraOfs.y);
            ctx.fillStyle="#0077FF";
            ctx.fillRect(-this.innerOfs.x, -this.innerOfs.y,
                            this.cols*this.interval.x+this.innerOfs.x*2,
                            this.rows*this.interval.y+this.innerOfs.y*2); 

            for (let iRow = 0; iRow < this.rows; iRow++){
                for (let iCol = 0; iCol < this.cols; iCol++){
                    ctx.save();
                        ctx.translate(iCol*this.interval.x,iRow*this.interval.y);
                        this.tiles[iRow][iCol].draw(ctx);
                    ctx.restore();
                }
            }
            for (let index = 0; index < this.maxItems; index++){
                if (this.items[index].valid){
                    ctx.save();
                        ctx.translate(this.items[index].col*this.interval.x,
                                        this.items[index].row*this.interval.y);
                        this.items[index].draw(ctx);
                    ctx.restore();
                }
            }
        ctx.restore();
    }
}


/*コールバック*/
function evMouseUp(event){
    mouseManager.clickImm=false;
}
function evMouseDown(event){
    mouseManager.clickImm=true;
}

function evMouseMove(event){
    mouseManager.pointImm.x = event.clientX - mainCanvas.offsetLeft;
    mouseManager.pointImm.y = event.clientY - mainCanvas.offsetTop;
}

function evKeyUp(event){
    let keycode = event.keyCode;
    if (keycode>=0 && keycode<keycodeEnd){
        keyboardManager.keyImm[keycode]=false;
    }
}

function evKeyDown(event){
    let keycode = event.keyCode;
    if (keycode>=0 && keycode<keycodeEnd){
        keyboardManager.keyImm[keycode]=true;
    }
}
/*---------*/

//グローバル変数の初期化
//プログラム開始時に1度だけ実行する
function initGlobals(){
    mainCanvas = document.createElement("canvas");
    debugMsg = document.createElement("div");

    document.body.appendChild(mainCanvas);
    document.body.appendChild(debugMsg);

    mainCanvas.width = wholeWidth;
    mainCanvas.height = wholeHeight;

    mainCanvas.addEventListener('mousemove', evMouseMove, true);
    mainCanvas.addEventListener('mousedown', evMouseDown, true);
    mainCanvas.addEventListener('mouseup', evMouseUp, true);

    window.addEventListener('keydown', evKeyDown, true);
    window.addEventListener('keyup', evKeyUp, true);

    mouseManager =  new MouseManager();
    keyboardManager = new KeyboardManager();

    imageManager = new ImageManager();
}

//使用する全画像ファイルの読み込みを実行する
function loadAllImages(){
    imageManager.img[0].src = "./images/img.png";
}

//ゲームの初期化
//ゲーム開始時に1度だけ実行する
function initGame(){
    mainField = new Field(8,8);
}

function moveItems(){
    let target=0;
    let km=keyboardManager;
    if (km.getDownDur("D")%8==1 && km.getDownDur("A")==0){
        mainField.moveItem(target,"R");
    }
    if (km.getDownDur("A")%8==1 && km.getDownDur("D")==0){
        mainField.moveItem(target,"L");
    }
    if (km.getDownDur("S")%8==1 && km.getDownDur("W")==0){
        mainField.moveItem(target,"D");
    }
    if (km.getDownDur("W")%8==1 && km.getDownDur("S")==0){
        mainField.moveItem(target,"U");
    }
    
}

//キャンバスの描画を更新する
function refleshCanvas(){
    let context;

    let buffer = document.createElement("canvas");
    
    context = buffer.getContext("2d");
    buffer.width = 320;
    buffer.height = 480;
    mainField.draw(context);

    context = mainCanvas.getContext("2d");
    context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    context.drawImage(buffer,0,0);

}

//デバッグメッセージ用の領域を更新する
function refleshDebugMsg(){
    let kb = keyboardManager;
    let msg = "";
    for (let index=65; index<65+26;index++){
        msg+=String.fromCharCode(index)+" "+kb.downDur[index]+"<br>";
    }
    debugMsg.innerHTML = msg;
}

//メインループ
//一定時間ごとに再実行される
function mainLoop(){
    //マウス及びキーボード入力をmainLoop関数と同期させる
    keyboardManager.propagate();
    mouseManager.propagate();

    //キー入力に呼応してアイテムを動かす
    moveItems();

    //キャンバスの再描画
    refleshCanvas();

    //デバッグメッセージ領域の再描画
    refleshDebugMsg();

    //loopTime[ms]後にmainLoop関数を呼ぶ予定を追加する
    setTimeout(mainLoop, loopTime);
}

function main(){
    initGlobals();

    loadAllImages();

    initGame();

    mainLoop();
};


window.onload = main;


// BLockly部分
import Blockly from "blockly";

//block definition

// sleep関数。各コマンドにこれを入れること。
const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

Blockly.Blocks['move'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Move")
            .appendField(new Blockly.FieldDropdown([
                ["→", "R"],
                ["←", "L"],
                ["↑", "U"],
                ["↓", "D"]
            ]), "move_direction");
        this.setNextStatement(true);
        this.setPreviousStatement(true);
        this.setColour(270);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['move'] = function(block) {
    block.setColour(180);
    var dropdown_direction = block.getFieldValue('move_direction');
    return 'mainField.moveItem(0, "' + dropdown_direction + '");\nawait sleep(500);\n';
};


Blockly.Blocks['loop'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Repeat Infinity");
        this.appendStatementInput("LOOP");
        this.setColour(360);
        this.setTooltip("");
        this.setHelpUrl("");
    }
}

Blockly.JavaScript['loop'] = function(block) {
    code = Blockly.JavaScript.statementToCode(block, "LOOP");
    return 'while(true) {\n' + code + '}\n';
}


//set options
var options = {
  toolbox: document.getElementById("toolbox"),
  collapse: true,
  comments: true,
  disable: true,
  maxBlocks: Infinity,
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

//put the toolbox in the workspace
var workspace = Blockly.inject("blocklyDiv", options);
// take the text generated by the blocks and run it as code
function runCode() {
  window.LoopTrap = 1000;
  Blockly.JavaScript.INFINITE_LOOP_TRAP =
    'if (--window.LoopTrap == 0) throw "Infinite loop.";¥n';
  var code = Blockly.JavaScript.workspaceToCode(workspace);
  Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
  try {
    eval('(async () => {' + code + '})();');
  } catch (e) {
    alert(e);
  }
}

const runcodeDom = document.getElementById("runcode");
runcodeDom.onclick = () => runCode();
