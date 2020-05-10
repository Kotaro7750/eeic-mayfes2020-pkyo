import Blockly from 'blockly';
import commonBlockDefs from './Blocks.json';
import commonBlockFuncs from './Blocks.js';

class BlocklyRunner {
  constructor(xmlFilePath) {
    // ステージによらず常に読み込むブロックの定義を列挙する
    this.commonBlockDefs;
    this.commonBlockFuncs;
    this.setCommonBlockDefinition();
    this.xmlFilePath = xmlFilePath;
  }

  async getFile(filePath) {
    const res = await fetch(filePath);
    if (res.status != 200) {
      console.error(`failed to get file ${filePath}: ${res.status}`);
    } else {
      const text = await res.text();
      return text;
    }
  }

  setBlockDefinition(name, init, conv) {
    Blockly.defineBlocksWithJsonArray([
      init,
    ]);
    Blockly.JavaScript[name] = (name) => {
      return conv(name);
    };
  }

  // 共通ブロック(ステージによらず常に読み込むブロック)の定義を読み込む
  setCommonBlockDefinition() {
    commonBlockDefs.blocks.forEach( (elem) =>{
      this.setBlockDefinition(elem.name, elem.block, commonBlockFuncs['common_block_' + elem.name]);
    });
  }

  async renderBlockly(startBlockly, pauseBlockly, maxBlocks) {
    console.log(this.xmlFilePath);
    const xmlFile = await this.getFile(this.xmlFilePath);
    console.log(xmlFile);
    if (typeof maxBlocks === 'undefined') {
      maxBlocks = Infinity;
    }
    const options = {
      toolbox: xmlFile,
      collapse: true,
      comments: true,
      disable: true,
      maxBlocks: maxBlocks,
      trashcan: true,
      horizontalLayout: false,
      toolboxPosition: 'start',
      css: true,
      rtl: false,
      scrollbars: true,
      sounds: true,
      oneBasedIndex: true,
      grid: {
        spacing: 20,
        length: 1,
        colour: '#888',
        snap: true,
      },
    };

    this.workspace = Blockly.inject('blocklyDiv', options);
    console.log(this.workspace);
    Blockly.Xml.domToWorkspace(document.getElementById('startBlocks'), this.workspace);

    this.workspace.getTopBlocks().forEach((block) => {
      block.setMovable(false);
      this.rootBlockId = block.id;
    });

    const executeButton = document.getElementById('executeButton');
    executeButton.onclick = startBlockly;
    const pauseButton = document.getElementById('pauseButton');
    pauseButton.onclick = pauseBlockly;
    return this.workspace;
  }

  // isRunningは現状無効です
  updateBlockly(isRunning) {
    // 主に実行ボタンの描画更新（実行中/実行できるよ）の場所
    // ぶっちゃけボタンのclass変更してCSS変えるだけor画像切り替えるだけ
  }

  endRunning() {
    this.updateBlockly();
  };
};

export default BlocklyRunner;
