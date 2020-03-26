export default {
  block_move: (block) => {
    const dropdownDirection = block.getFieldValue('move_direction');
    return `this.tryMove(this.player, ${dropdownDirection});\
                this.cmdDelta=35;\
                yield true;\n`;
  },
  block_movemove: (block) => {
    const dropdownDirection = block.getFieldValue('move_direction');
    return `this.tryMove(this.player, ${dropdownDirection});\
                this.cmdDelta=35;\
                yield true;\n`;
  },
  block_new_block: (block) => {
    const value_num_input = block.getFieldValue('num_input');
    return `alert(${value_num_input});\
                yield true;\n`;
  },
};
