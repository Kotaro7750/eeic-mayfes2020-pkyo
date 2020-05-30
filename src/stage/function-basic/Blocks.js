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
      if (this.mapDat.mapStr[nextGY][nextGX] !== '#') {
        this.player.targetX += dx[dir] * this.mapDat.tileWidth * this.map2Img;
        this.player.gridX = nextGX;
        this.player.targetY += dy[dir] * this.mapDat.tileHeight * this.map2Img;
        this.player.gridY = nextGY;
      }
      this.cmdDelta = 35;
      yield "${block.id.replace('"', '\\"')}";

      if (this.mapDat.mapStr[this.player.gridY][this.player.gridX] === 'H') {
        return 'failed';
      }
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
      this.setDir();
      this.cmdDelta = 35;
      yield "${block.id.replace('"', '\\"')}";
    }
    `;
  },
  block_ifelse: (block) => {
    const cond = Blockly.JavaScript.statementToCode(block, 'COND');
    const codeIf = Blockly.JavaScript.statementToCode(block, 'IFCODE');
    const codeElse = Blockly.JavaScript.statementToCode(block, 'ELSECODE');
    return `{
      this.cmdDelta = 35;
      yield "${block.id.replace('"', '\\"')}";
      if(${cond}) {
        ${codeIf}
      } else {
        ${codeElse}
      }
    }`;
  },
  block_iswallfront: (block) => {
    return `
    (function() {
      const dirToNum = {
        right: 0,
        left: 1,
        up: 2,
        down: 3
      };
      const dir = dirToNum[this.player.dir];
      const dx = [1, -1, 0, 0];
      const dy = [0, 0, -1, 1];
      const nextGX = this.player.gridX + dx[dir];
      const nextGY = this.player.gridY + dy[dir];
      return this.mapDat.mapStr[nextGY][nextGX] === '#';
    }.bind(this))()
    `;
  },
  block_iswallright: (block) => {
    return `
    (function() {
      const dirToNum = {
        right: 0,
        left: 1,
        up: 2,
        down: 3
      };
      const dir = dirToNum[this.player.dir];
      const dx = [1, -1, 0, 0];
      const dy = [0, 0, -1, 1];
      const rightDir = [3, 2, 0, 1][dir];
      const nextGX = this.player.gridX + dx[rightDir];
      const nextGY = this.player.gridY + dy[rightDir];
      return this.mapDat.mapStr[nextGY][nextGX] === '#';
    }.bind(this))()
    `;
  },
  block_fronthole: (block) => {
    return `
    (function() {
      const dirToNum = {
        right: 0,
        left: 1,
        up: 2,
        down: 3
      };
      const dir = dirToNum[this.player.dir];
      const dx = [1, -1, 0, 0];
      const dy = [0, 0, -1, 1];
      const nextGX = this.player.gridX + dx[dir];
      const nextGY = this.player.gridY + dy[dir];
      return this.mapDat.mapStr[nextGY][nextGX] === 'H';
    }.bind(this))()
    `;
  },
  block_jumphole: (block) => {
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
      const nextGX = this.player.gridX + dx[dir];
      const nextGY = this.player.gridY + dy[dir];
      if (this.mapDat.mapStr[nextGY][nextGX] === 'H') {
        const targetX = nextGX + dx[dir];
        const targetY = nextGY + dy[dir];
        if (this.mapDat.mapStr[targetY][targetX] !== '#') {
          this.player.targetX += 2 * dx[dir] * this.mapDat.tileWidth * this.map2Img;
          this.player.gridX = targetX;
          this.player.targetY += 2 * dy[dir] * this.mapDat.tileHeight * this.map2Img;
          this.player.gridY = targetY;
        }
      }
      this.cmdDelta = 35;
      yield "${block.id.replace('"', '\\"')}";

      if (this.mapDat.mapStr[this.player.gridY][this.player.gridX] == 'H') {
        return null;
      }
    }
    `;
  },
  block_function: (block) => {
    const group = 'group-' + block.getFieldValue('GROUPID');
    console.log(block, group);
    const code = Blockly.JavaScript.statementToCode(block, 'CODE');
    return `
    funcs['${group}'] = function*() {
      ${code}
    }.bind(this);
    this.cmdDelta = 1;
    yield null;
    `;
  },
  block_functioncall: (block) => {
    const group = 'group-' + block.getFieldValue('GROUPID');
    return `{
      let tmp_gen = funcs['${group}']();
      this.cmdDelta = 35;
      yield "${block.id.replace('"', '\\"')}";
      while(true) {
        let gen_res = tmp_gen.next();
        console.log(gen_res);
        if(gen_res.done) {
          if(gen_res.value === 'failed') {
            return 'failed';
          }
          break;
        }
        else {
          yield gen_res.value;
        }
      }
    }`;
  },
};
