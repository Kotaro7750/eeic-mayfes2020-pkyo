import Blockly from 'blockly';

export default {
  common_block_loop: (block) => {
    const code = Blockly.JavaScript.statementToCode(block, 'LOOP');
    return `
    const funcs = {};
    while (true) {
      this.cmdDelta=1;
      yield true;
      ${code}
    }
    `;
  },
};
