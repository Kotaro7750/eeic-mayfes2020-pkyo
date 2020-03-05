import Phaser from "phaser";

class SceneTitle extends Phaser.Scene {
    
    constructor ()
    {
        super({ key: 'title'});
    }

    create(){
        var button0 = new SimpleButton(this,50,200,200,50,0x0000ff,'start',"red");
        var button1 = new SimpleButton(this,50,280,200,50,0xffff00,'dummy',"green");
        var button2 = new SimpleButton(this,50,360,200,50,0x00ffff,'dummy',"blue");
        button0.button.on('pointerdown', function(){
            this.scene.start('game');
        }.bind(this));
    }
}

//後で然るべき場所に移す
class SimpleButton{
    constructor(scene,x,y,width,height,buttonColor,text,textColor){
        var rect={x:x,y:y,width:width,height:height};
        this.button = scene.add.rectangle(
            rect.x+rect.width/2,
            rect.y+rect.height/2,
            rect.width,
            rect.height,
            buttonColor);
        this.text = scene.add.text(rect.x, rect.y, text, {fontSize: rect.height,color:textColor});
        this.button.setInteractive();
    }
}

export default SceneTitle;