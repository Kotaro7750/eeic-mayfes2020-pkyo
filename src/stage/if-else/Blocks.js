import Blockly from 'blockly';

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
          this.player.dir = '${turnDirection === '1' ? 'down' : 'up'}';
          break;
        case 'right':
          this.player.dir = '${turnDirection === '1' ? 'up' : 'down'}';
          break;
        case 'up':
          this.player.dir = '${turnDirection === '1' ? 'left' : 'right'}';
          break;
        case 'down':
          this.player.dir = '${turnDirection === '1' ? 'right' : 'left'}';
      }
      this.cmdDelta = 35;
      yield "${block.id.replace('"', '\\"')}";
    }
    `;
  },
  block_ifwallfront: (block) => {
    const codeIf = Blockly.JavaScript.statementToCode(block, 'IF');
    const codeElse = Blockly.JavaScript.statementToCode(block, 'ELSE');
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
      if (this.mapDat.isWall[nextGY][nextGX]) {
        this.cmdDelta = 35;
        yield true;
        ${codeIf}
      } else {
        this.cmdDelta = 35;
        yield true;
        ${codeElse}
      }
    }
    `;
  },
  block_ifwallright: (block) => {
    const codeIf = Blockly.JavaScript.statementToCode(block, 'IF');
    const codeElse = Blockly.JavaScript.statementToCode(block, 'ELSE');
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
      const rightDir = [3, 2, 0, 1][dir];
      const nextGX = this.player.gridX + dx[rightDir];
      const nextGY = this.player.gridY + dy[rightDir];
      if (this.mapDat.isWall[nextGY][nextGX]) {
        this.cmdDelta = 35;
        yield true;
        ${codeIf}
      } else {
        this.cmdDelta = 35;
        yield true;
        ${codeElse}
      }
    }
    `;
  },
};