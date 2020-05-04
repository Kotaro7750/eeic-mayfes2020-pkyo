"""
標準入力に以下の形式でマップの横幅(W),
壁じゃないマスの番号(id_1, id_2, ...)(〇〇.tmxを見ると分かる),
プレイヤーとゴールの座標(playerX, playerX, goalX, goalY),
プレイヤーの向き(playerD)
を入れてください
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