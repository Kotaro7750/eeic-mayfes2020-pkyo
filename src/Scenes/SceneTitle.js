import Phaser from "phaser";
import SimpleButton from "../Objects/Objects.js";

class SceneTitle extends Phaser.Scene {
    
    constructor ()
    {
        super({ key: 'title'});
    }

    preload(){}

    create(){
        this.add.text(0, 0, "Really\nReally\nCool Title", {fontSize: 50, color:"white"});
        var button0 = new SimpleButton(this,50,200,200,50,0x0000ff,'start',"red");
        var button1 = new SimpleButton(this,50,280,200,50,0xffff00,'dummy',"green");
        var button2 = new SimpleButton(this,50,360,200,50,0x00ffff,'dummy',"blue");
        button0.button.on('pointerdown', function(){
            //シーンの遷移にエフェクトを加えたいならここの処理を変更する
            this.scene.start('game');
        }.bind(this));
    }

    update(){}
}

export default SceneTitle;