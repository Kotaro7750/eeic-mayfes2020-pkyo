import Phaser from "phaser";
import SceneGame from "./Scenes/SceneGame.js";
import SceneTitle from "./Scenes/SceneTitle.js";

// TODO: 未検証ですが、setGameSizeを使うことでcanvasサイズが動的に変更できそうです→stage選択画面が窮屈にならずに済む
const config = {
    Extends: Phaser.Scene,
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    parent: "phaserDiv",
    scene: [SceneTitle,SceneGame]
};

// initialize(この辺のvar/constはクラスでどっかに飛ばしたい)
window.onload = () => {
    var game = new Phaser.Game(config);
}


//index.jsには最小限のファイルだけ置きます