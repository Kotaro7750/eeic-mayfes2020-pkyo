import Phaser from "phaser";
// ステージ依存のファイル
// xmlのpathはwebpack後に取り出されるので
import XML from "./command.xml";
import map1 from "./tilemap.json";
import tiles from "./tilesets.png";
import playerImg from "../obake.png";
import stageConfig from "./config.json";

class StageRunner {
    constructor() {
        this.xmlFilePath = XML;
        this.stageConfig = stageConfig;
    }

    load() {
        
    }
}

export default StageRunner;