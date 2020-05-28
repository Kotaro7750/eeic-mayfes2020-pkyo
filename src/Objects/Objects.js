// 汎用オブジェクトの定義を記述する(ボタンなど、シーンによらず使えるもの)

// 最早決してシンプルではない: ステージ詳細記述用
// button(this.stage)をクリックすると、accordion(this.content)が出現。
// その中にステージ開始ボタン(this.button)が含まれる
export class SimpleButton {
  constructor(parent, scene, x, y, classname, id, width, buttonColor, text, textColor, img, message) {
    this.stage = document.createElement('div');
    this.stage.setAttribute('class', 'simple-button-div');
    this.stage.setAttribute('id', id);
    this.stage.style.width = width + 'px';
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

    this.content = document.createElement('div');
    this.content.setAttribute('class', 'accordion-content');
    this.stage.appendChild(this.content);

    this.image = document.createElement('img');
    this.image.setAttribute('src', img);
    this.content.appendChild(this.image);

    this.message = document.createElement('div');
    this.message.innerHTML = message;
    this.content.appendChild(this.message);

    this.buttonFrame = document.createElement('div');
    this.buttonFrame.setAttribute('class', 'title-box');
    this.button = document.createElement('div');
    this.button.setAttribute('class', 'title-button');
    this.button.innerHTML = 'ゲームを<ruby>始<rp>(</rp><rt>はじ</rt><rp>)</rp></ruby>める';
    this.buttonFrame.appendChild(this.button);
    this.content.appendChild(this.buttonFrame);
  }
};

export class FlipButton {
  constructor(parent, text, left, top, width, height) {
    this.div = document.createElement('div');
    this.div.style.position = 'absolute';
    this.div.style.left = left + 'px';
    this.div.style.top = top + 'px';
    this.frame = document.createElement('div');
    this.frame.setAttribute('class', 'title-box');
    this.button = document.createElement('div');
    this.button.setAttribute('class', 'title-button');
    this.content = document.createElement('div');
    this.content.style.width = width + 'px';
    this.content.style.height = height + 'px';
    this.content.innerHTML = text;
    this.button.appendChild(this.content);
    this.div.appendChild(this.frame);
    this.frame.appendChild(this.button);
    parent.appendChild(this.div);
  }
};

export class FlipFlexButton {
  constructor(parent, text) {
    this.div = document.createElement('div');
    this.div.setAttribute('class', 'title-box');
    this.button = document.createElement('div');
    this.button.setAttribute('class', 'title-button');
    this.content = document.createElement('div');
    this.content.innerHTML = text;
    this.button.appendChild(this.content);
    this.div.appendChild(this.button);
    parent.appendChild(this.div);
  }
};
