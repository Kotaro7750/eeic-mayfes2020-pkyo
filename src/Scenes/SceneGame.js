import Phaser from "phaser";
import map1 from "../../public/stage/test/tilemap.json";
import tiles from "../../public/stage/test/tilesets.png";
import playerImg from "../../public/stage/obake.png";

var mapDat;
var map2Img;

var canvasWidth=480;


class SceneGame extends Phaser.Scene {
    
    constructor() {
        super();
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

        // mapの表示(mapはcanvasのwidth,heightと同じ比で作成されていることが前提です)
        mapDat = this.add.tilemap("map1");
        let tileset = mapDat.addTilesetImage("tileset", "tiles");
        this.backgroundLayer = mapDat.createDynamicLayer("ground", tileset);
        //map2Img = game.canvas.width / this.backgroundLayer.width;
        map2Img = canvasWidth / this.backgroundLayer.width;
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

        var rect = new Phaser.Geom.Rectangle(150, 200, 200, 200);
        var graphics = this.add.graphics({ fillStyle: { color: 0x0000ff } });
        graphics.fillRectShape(rect);
    }
    
    update() {
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
}


export default SceneGame;