// 汎用オブジェクトの定義を記述する(ボタンなど、シーンによらず使えるもの)

// 最早決してシンプルではない
// button(this.stage)をクリックすると、accordion(this.content)が出現。
// その中にステージ開始ボタン(this.button)が含まれる
class SimpleButton {
  constructor(parent, scene, x, y, classname, id, width, height, buttonColor, text, textColor) {
    this.stage = document.createElement('div');
    this.stage.setAttribute('class', 'simple-button-div');
    this.stage.setAttribute('id', id);
    this.stage.style.width = 'auto';
    this.stage.style.height = 'auto';
    this.stage.style.backgroundColor = buttonColor;
    parent.appendChild(this.stage);

    this.input = document.createElement('input');
    this.input.setAttribute('class', 'accordion-check');
    this.input.setAttribute('id', 'accordion-check-' + id);
    this.input.setAttribute('type', 'checkbox');
    this.stage.appendChild(this.input);

    this.label = document.createElement('label');
    this.label.setAttribute('class', 'accordion-label');
    this.label.setAttribute('for', 'accordion-check-' + id);
    this.label.innerHTML = text;
    this.stage.appendChild(this.label);

    this.button = document.createElement('div');
    this.button.setAttribute('class', 'accordion-content');
    this.button.innerHTML = 'ゲームを始める';
    this.stage.appendChild(this.button);
  }
}

export default SimpleButton;
