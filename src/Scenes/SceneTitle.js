import Phaser from "phaser";

class SceneTitle extends Phaser.Scene {
    
    constructor ()
    {
        super();
    }

    create(){
        var rect;
        rect = new Phaser.Geom.Rectangle(50, 200, 300, 50);
        this.add.graphics({ fillStyle: { color: 0x0000ff } }).fillRectShape(rect);
        this.add.text(50, 200, 'Here We Go', {fontSize: 50});
        
    }
}

export default SceneTitle;