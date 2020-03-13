import Blockly from 'blockly';

export default {
  common_block_loop: (block) => {
    const code = Blockly.JavaScript.statementToCode(block, 'LOOP');
    return 'while (true) {\n' +
                'this.cmdDelta=1;' +
                'yield true;\n' +
                code +
                '}\n';
  },
};
