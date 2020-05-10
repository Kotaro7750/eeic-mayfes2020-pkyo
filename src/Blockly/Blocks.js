import Blockly from 'blockly';

export default {
  common_block_loop: (block) => {
    const code = Blockly.JavaScript.statementToCode(block, 'LOOP');
    return `
    while (true) {
      this.cmdDelta=1;
      yield true;
      ${code}
    }
    `;
  },
};
