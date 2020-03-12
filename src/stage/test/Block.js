export default {
  hoge: (block) => {
    const dropdownDirection = block.getFieldValue('move_direction');
    return `this.tryMove(this.player, ${dropdownDirection});\
                this.cmdDelta=35;\
                yield true;\n`;
  }
}
