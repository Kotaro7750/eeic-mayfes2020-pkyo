# 新しいステージの作り方
## タイルマップエディタの使い方
### 1. Tiled Map Editorをインストール
[ここ]( https://www.mapeditor.org/ )を参照して、エディタをインストールする

### 2.　マップを作る
[ここ](https://www.catch.jp/wiki3/tools/phaser_and_tiled)を参考に

### 3. tilemap.json
生成したtilemap.jsonのtilesets->nameが多分"tilesets"になってるので"tileset"に変えます
![](https://i.imgur.com/Dth1n5A.png)

### 4. config.json
config.jsonを作ります
手作業は大変なので自動生成します(配列が全部改行されてめちゃめちゃ縦長になってしまうので誰か直してほしい) 

```python:generate_config.py
"""
標準入力に以下の形式でマップの横幅(W),
壁じゃないマスの番号(id_1, id_2, ...)(〇〇.tmxを見ると分かる),
プレイヤーとゴールの座標(playerX, playerX, goalX, goalY),
プレイヤーの向き(playerD)
を入れてください

W
id_1 id_2 ...
playerX playerX goalX goalY
playerD

例: python generate_config.py
16
497 521
5 7 10 7
right
"""

import json
import copy
import sys

def generate_config(width, not_wall_list, start_goal, playerD):
    filename = 'tilemap.json'
    fr = open(filename, 'r')
    tilemap_data = json.load(fr)
    map_data = tilemap_data['layers'][0]['data']
    n_cells = len(map_data)
    row = []
    map_list = []
    for i in range(n_cells):
        row.append(map_data[i])
        if len(row) == width:
            tmp = copy.deepcopy(row)
            map_list.append(tmp)
            row.clear()
    config = {}
    config['isWall']=[]
    for i in range(len(map_list)):
        row = [True] * width
        for j in range(width):
            tile = map_list[i][j]
            if tile in not_wall_list:
                row[j]=False
        tmp = copy.deepcopy(row)
        config['isWall'].append(tmp)

    config['playerX'] = start_goal[0]
    config['playerY'] = start_goal[1]
    config['goalX'] = start_goal[2]
    config['goalY'] = start_goal[3]
    config['playerD'] = playerD

    with open('config.json','w') as fw:
        json.dump(config,fw,indent=2)

if __name__ == '__main__':
    args = sys.argv
    width = int(input())
    not_wall_list = [int(x)for x in input().split()]
    start_goal = [int(x) for x in input().split()]
    playerD = input()
    generate_config(width, not_wall_list, start_goal, playerD)
```


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
