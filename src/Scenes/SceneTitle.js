import Phaser from "phaser";

class SceneTitle extends Phaser.Scene {
    
    constructor ()
    {
        super({ key: 'title'});
    }

    preload(){}

    create(){
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

//後で然るべき場所に移す
//rectangle+textによる単純なボタンの生成
//左上座標・大きさ・色・文章、文字色を指定
class SimpleButton{
    constructor(scene,x,y,width,height,buttonColor,text,textColor){
        this.button = scene.add.rectangle(
            x+width/2,
            y+height/2,
            width,
            height,
            buttonColor);
        this.text = scene.add.text(x, y, text, {fontSize: height,color:textColor});
        this.button.setInteractive();
    }
}

export default SceneTitle;