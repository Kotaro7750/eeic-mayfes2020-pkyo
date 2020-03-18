# 新しいステージの作り方
## タイルマップエディタの使い方
[ここ]( https://www.mapeditor.org/ )を参照して、エディタをインストールする。

## コードへの反映
src/stage以下に作りたいステージのディレクトリを作る。

```sh
cd src/stage
mkdir stageX
```

stageXディレクトリ以下に以下のファイルを配置する。名前は下のとおりにすることを忘れずに。

|ファイル名  |役割                                      |
|------------|------------------------------------------|
|Blocks.js   |ブロックの動作関数定義                    |
|Blocks.json |ブロックの定義                            |
|command.xml |どのブロックを配置するかの定義            |
|config.json |マップ上の壁フラグ、初期位置、ゴールの定義|
|tilemap.json|タイルマップエディタで作ったJSON          |
|tilesets.png|タイルマップエディタで作った画像          |

その後は、ステージボタンのコールバックを以下のようにする。

```javascript
stage0.button.on('pointerdown', function() {
  this.scene.start('game', { stage_dir: 'stageX' });
}.bind(this));
```

### Blocks.jsについて
ブロックエディタで作った関数を block_{{ブロックの名前}} という名前の関数にする。

```javascript
//Blocks.js
export default {
  block_move: (block) => {
    const dropdownDirection = block.getFieldValue('move_direction');
    return `this.tryMove(this.player, ${dropdownDirection});\
                this.cmdDelta=35;\
                yield true;\n`;
  },
  block_movemove: (block) => {
    const dropdownDirection = block.getFieldValue('move_direction');
    return `this.tryMove(this.player, ${dropdownDirection});\
                this.cmdDelta=35;\
                yield true;\n`;
  },
};
```

### Blocks.jsonについて
ブロックエディタで作ったブロック定義JSONを以下のようにして配置する。JSONの書式に直すのがめんどくさいので、JSONチェッカーなどを使う。

```json
{
  "blocks":[
    {
      "name":"move",
      "block": {
        "type": "move",
        "message0": "%1 にすすむ",
        "args0": [
          {
        "type": "field_dropdown",
        "name": "move_direction",
        "options": [
                ["→", "0"],
                ["←", "1"],
                ["↑", "2"],
                ["↓", "3"]
              ]
            }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "",
        "helpUrl": ""
      }
    },
    {
      "name":"movemove",
      "block": {
        "type": "movemove",
        "message0": "%1 にすすむといいな",
        "args0": [
          {
        "type": "field_dropdown",
        "name": "move_direction",
        "options": [
                ["→", "0"],
                ["←", "1"],
                ["↑", "2"],
                ["↓", "3"]
              ]
            }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 500,
        "tooltip": "",
        "helpUrl": ""
      }
    }
  ]
}
```
