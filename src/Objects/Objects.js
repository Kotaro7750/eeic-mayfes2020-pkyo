// 汎用オブジェクトの定義を記述する(ボタンなど、シーンによらず使えるもの)

// rectangle+textによる単純なボタンの生成
// 左上座標・大きさ・色・文章、文字色を指定
class SimpleButton {
  constructor(parent, scene, x, y, classname, id, width, height, buttonColor, text, textColor) {
    this.button = document.createElement('div');
    this.button.setAttribute('class', 'simple_button');
    this.button.setAttribute('class', classname);
    this.button.setAttribute('id', id);
    this.button.style.position = 'absolute';
    this.button.style.left = x + 'px';
    this.button.style.top = y + 'px';
    this.button.style.width = width + 'px';
    this.button.style.height = height + 'px';
    this.button.style.backgroundColor = buttonColor;
    this.button.style.color = textColor;
    this.button.innerHTML = text;
    parent.appendChild(this.button);
  }
}

export default SimpleButton;
