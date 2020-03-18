export default {
  block_move: (block) => {
    const dropdownDirection = block.getFieldValue('move_direction');
    return `this.tryMove(this.player, ${dropdownDirection});\
                this.cmdDelta=35;\
                yield "${block.id}";\n`;
  },
};
