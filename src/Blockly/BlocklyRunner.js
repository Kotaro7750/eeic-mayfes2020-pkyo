import Blockly from 'blockly';

class BlocklyRunner {
    constructor(xmlFilePath) {
        this.setBlockDefinition("loop", function() {
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
                + "yield true;\n"
                + "}\n";
        });
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
        Blockly.Blocks[name] = {
            init: init
        };
        Blockly.JavaScript[name] = (name) => {
            return conv(name);
        }
    }
    
    async renderBlockly(startBlockly, maxBlocks) {
        console.log(this.xmlFilePath);
        let xmlFile = await this.getFile(this.xmlFilePath);
        console.log(xmlFile);
        if (typeof maxBlocks === "undefined") {
            maxBlocks = Infinity;
        }
        let options = {
            toolbox: xmlFile,
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
    
        this.workspace = Blockly.inject("blocklyDiv", options);
        console.log(this.workspace);
        Blockly.Xml.domToWorkspace(document.getElementById('startBlocks'), this.workspace);

        const executeButton = document.getElementById("executeButton");
        executeButton.onclick = startBlockly;
        return this.workspace;
    }

    
    updateBlockly(isRunning) {
        // 主に実行ボタンの描画更新（実行中/実行できるよ）の場所
        // ぶっちゃけボタンのclass変更してCSS変えるだけor画像切り替えるだけ
        var element = document.getElementById( "executeButton" ) ;
        if(isRunning){
            element.className = "circle_running_btn";
            element.innerHTML="■";
        }else{
            element.className = "circle_spread_btn";
            element.innerHTML='<i class="fas fa-chevron-circle-left"></i>';
        }
    }

    endRunning(isRunning) {
        isRunning = false;
        this.updateBlockly(isRunning);
        return isRunning;
    };
};

export default BlocklyRunner;