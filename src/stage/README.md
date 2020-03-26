# 新しいステージの作り方
## タイルマップエディタの使い方
[ここ]( https://www.mapeditor.org/ )を参照して、エディタをインストールする。

## ブロックエディタの使い方
[ブロックエディタ](https://blockly-demo.appspot.com/static/demos/blockfactory/index.html)では、カスタムブロックをGUIで作成することができる。

まずはBlock Factoryで好みのブロックを作る。どのようなブロックを作るかはステージ設計と相談。できたらSaveで保存。

その次にBlock ExporterでJSON形式でエクスポートする。Block Definitionsに作ったJSONが出力されるので、以下のようにBlocks.jsonに配置する。JSONチェッカーか何かで整形すると見やすくてベネ。

```json
{
  "blocks":[
    {
      "name":"作ったブロックの名前",
      "block": {
        作ったオブジェクトをここに
      }
    },
    {
      以下同様
    }
  ]
}
```

また、Blocks.jsに、

```javascript
export default {
  blocks_作ったブロック名 : (block) => {
    const value_num_input = block.getFieldValue('num_input');
    return `適当なコード\n`;
  },
  以下同様
};
```

と書く。

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

また、command.xmlに配置するブロックを定義する。ステージ共通ブロックも配置することを忘れずに。

```xml
 <xml>
    <block type="loop"></block>
    <block type="move"></block>
    <block type="new_block"></block>
</xml>
```
