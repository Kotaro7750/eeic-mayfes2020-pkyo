//block definition
//light switch block - turn color on or off
Blockly.Blocks['lightswitch'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Turn")
            .appendField(new Blockly.FieldDropdown([
                ["red", "red"],
                ["blue", "blue"]
            ]), "lightcolor")
            .appendField(new Blockly.FieldDropdown([
                ["on", "T"],
                ["off", "F"]
            ]), "switch");
        this.setColour(270);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.JavaScript['lightswitch'] = function(block) {
    var dropdown_lightcolor = block.getFieldValue('lightcolor');
    console.log(dropdown_lightcolor);
    var dropdown_switch = block.getFieldValue('switch');
    // TODO: Assemble JavaScript into code variable.
    if (dropdown_switch == "F") {
        var code = 'document.getElementById("circle").style.backgroundColor="white";\n';
        return code;
    } else {
        var code = 'document.getElementById("circle").style.backgroundColor="' + dropdown_lightcolor + '";\n';
        return code;
    }
};