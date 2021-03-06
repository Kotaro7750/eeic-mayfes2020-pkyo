import Phaser from 'phaser';
import SceneGame from './Scenes/SceneGame.js';
// SceneGameEffectは現状使っていません
// import SceneGameEffect from "./Scenes/SceneGameEffect.js";
import SceneLoad from './Scenes/SceneLoad.js';
import SceneTitle from './Scenes/SceneTitle.js';
import SceneStageSelect from './Scenes/SceneStageSelect.js';


// TODO: 未検証ですが、setGameSizeを使うことでcanvasサイズが動的に変更できそうです→stage選択画面が窮屈にならずに済む
// sceneはリスト最初のものが自動実行されるらしい[要検証]

const config = {
  Extends: Phaser.Scene,
  type: Phaser.AUTO,
  width: 400,
  height: 600,
  parent: 'phaserDiv',
  scene: [SceneTitle, SceneStageSelect, SceneLoad, SceneGame],
};

// initialize(この辺のvar/constはクラスでどっかに飛ばしたい)
window.onload = () => {
  // eslint-disable-next-line no-unused-vars
  const game = new Phaser.Game(config);
};

// index.jsには最小限のコードだけ置きます
// グローバル変数は最終的に必要最低限になるようにする
