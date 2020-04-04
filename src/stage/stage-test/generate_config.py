"""
コマンドライン引数の第1引数にmapの横幅、
それ以降に、壁じゃないマスの番号(tilemap.jsonのlayers->dataのやつ)
を入れてください
例: python generate_config.py 20 497 521
"""

import json
import copy
import sys

def generate_config(width, not_wall_list):
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
<<<<<<< HEAD
        row = [True] * width
        for j in range(width):
            tile = map_list[i][j]
            if tile in not_wall_list:
                row[j]=False
=======
        row = ['true'] * width
        for j in range(width):
            tile = map_list[i][j]
            if tile in not_wall_list:
                row[j]='false'
>>>>>>> origin/master
        tmp = copy.deepcopy(row)
        config['isWall'].append(tmp)

    config['playerX'] = 'playerX'
    config['playerY'] = 'playerY'
    config['goalX'] = 'goalX'
    config['goalY'] = 'goalY'
    config['playerD'] = 'playerD'

    with open('config.json','w') as fw:
        json.dump(config,fw,indent=2)

if __name__ == '__main__':
    args = sys.argv
    width = int(args[1])
    not_wall_list = []
    for i in range(2,len(args)):
        not_wall_list.append(int(args[i]))

    generate_config(width, not_wall_list)