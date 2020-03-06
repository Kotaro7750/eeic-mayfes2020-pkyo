# 五月祭 2020 プログラミング教室 プロダクト

## js 開発環境

### require

- node

### build javascript

```
npm install
npm run build
```

### 実行
そのままではCORS(CrossOriginRsourceSharing)制約に引っかかって画像とかが読み込めないので、簡易的にWebサーバーを立てる必要があります。
Chromeなら「Web Server for Chrome」という拡張機能があり、それを使ってもよさそう。ですが、webpack-dev-serverというものがあり、「編集後ファイル保存時に自動でコンパイル→ブラウザ更新」までしてくれるお手軽機能付きの開発環境が手に入ります！
```
npm start
```
上のコマンドを実行後、`localhost:8080`にアクセスしてください。

### What happens?

基本的には
`src/index.js`
の内容を
`public/bundle.js`
にコピーしているだけ。

**じゃあ何がうれしいの？**

- 他のファイルからの関数などの import が簡単にできる。
- など
