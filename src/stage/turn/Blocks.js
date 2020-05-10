export default {
  block_move: (block) => {
    return `
    {
      const dirToNum = {
        right: 0,
        left: 1,
        up: 2,
        down: 3
      };
      const dir = dirToNum[this.player.dir];
      const dx = [1, -1, 0, 0];
      const dy = [0, 0, -1, 1];
      console.log(this.player);
      const nextGX = this.player.gridX + dx[dir];
      const nextGY = this.player.gridY + dy[dir];
      console.log(nextGX, nextGY)
      if (!this.mapDat.isWall[nextGY][nextGX]) {
        this.player.targetX += dx[dir] * this.mapDat.tileWidth * this.map2Img;
        this.player.gridX = nextGX;
        this.player.targetY += dy[dir] * this.mapDat.tileHeight * this.map2Img;
        this.player.gridY = nextGY;
      }
      this.cmdDelta = 35;
      yield "${block.id.replace('"', '\\"')}";
    }
    `;
  },
  block_turn: (block) => {
    const turnDirection = block.getFieldValue('turn_direction');
    return `
    {
      switch (this.player.dir) {
        case 'left':
          this.player.dir = '${turnDirection ? 'down' : 'up'}';
          break;
        case 'right':
          this.player.dir = '${turnDirection ? 'up' : 'down'}';
          break;
        case 'up':
          this.player.dir = '${turnDirection ? 'left' : 'right'}';
          break;
        case 'down':
          this.player.dir = '${turnDirection ? 'right' : 'left'}';
      }
      this.cmdDelta = 35;
      yield "${block.id.replace('"', '\\"')}";
    }
    `;
  },
};
