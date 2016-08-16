# 【SUGOSチュートリアル】 04 - Moduleをnpmパッケージ化する

[前回のチュートリアル](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/03%20-%20Browser%E9%96%93%E3%81%A7%E3%82%84%E3%82%8A%E5%8F%96%E3%82%8A%E3%81%99%E3%82%8B.md)では、Browser間の通信を実装しました。

さて、これまでのチュートリアルはActorの宣言時に、提供するModuleを毎回その場で定義していました。
しかし実際にアプリケーションを作るとなると、Moduleを使い回したくなる場合が多々あります。

そこで今回は、Moduleを単体のプロジェクトとして生成し、npmパッケージとして配布します。


<a href="https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/04%20-%20Module%E3%82%92npm%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E5%8C%96%E3%81%99%E3%82%8B.md">
<img src="../../images/eyecatch-package.jpg"
     alt="eyecatch"
     height="128"
     style="height:128px"
/></a>

## 内容
- [事前準備](#事前準備)
- [まとめ](#まとめ)
- [これも読みたい](#これも読みたい)
- [リンク](#リンク)


## 事前準備

まずは[sugo-scaffold](https://github.com/realglobe-Inc/sugo-scaffold)コマンドラインツールをインストールします。
これを使うと、SUGOS関連のプロジェクトの雛形が簡単に作成できます。

```bash
# Install as global module
npm install -g sugo-scaffold

# Show version to check if the installation succeeded
sugo-scaffold --version
```


( 編集中... )


## まとめ


## おまけ

### 雑談: Javascriptの関数でキーワード引数みたいなことをしてみる

例えばPythonだと[Keyword Arguments](https://docs.python.org/3/tutorial/controlflow.html#keyword-arguments)なる仕様があって、
関数の引数がいっぱいあるやつをうまく処理できるようになってたりする。

```python
def do_something(src, dest, **keywords):
  force = keywords.pop('force', false)
  mkdirp = keywords.pop('mkdirp', true)
  print('Do something with args: ', src, dest, force)

do_something('foo.txt', 'bar.txt', force=false, mkdirp=false)
```

これと同じようなことをJavaScriptでやろうとするとそれはもう大変だった。ES2015が使えるようになるまではね。

Node.js6以降で使えるようになった、[ES2015のDestructuring assignment](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)機能を使うと、

```javascript
// After ES2015
function doSomething (src, dest, options = {}) {
  let {
    force = false,
    mkdirp = true
  } = options
  console.log('Do something with args: ', src, dest, force)
}
doSomething('foo.txt', 'bar.txt', { force: false, mkdirp: false })
````

といった感じで、pythonと大差ない形でかけるようになった。もちろん[preset-es2015でバベれ](https://babeljs.io/docs/plugins/preset-es2015/)ばブラウザでも使える

昔だったら

```javascript
// Before ES2015
function doSomething (src, dest, options) {
  if(typeof options === 'undefined') {
    options = {}
  }
  var force = typeof(options.force === 'undefined') ? false: options.force
  var mkdirp = typeof(options.mkdirp === 'undefined') ? false: options.mkdirp
console.log('Do something with args: ', src, dest, force)
}
doSomething('foo.txt', 'bar.txt', { force: false, mkdirp: false })
```

とか書いていたのに。もう携帯電話がなかった時代と同じくらい遠く感じる。



## これも読みたい

+ 前回: [03 - Browser間でやり取りする](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/03%20-%20Browser%E9%96%93%E3%81%A7%E3%82%84%E3%82%8A%E5%8F%96%E3%82%8A%E3%81%99%E3%82%8B.md)
+ 次回: []()

## リンク

+ [SUGOS](https://github.com/realglobe-Inc/sugos)
+ [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor)
+ [SUGO-Scaffold](https://github.com/realglobe-Inc/sugo-scaffold)
+ Tutorials
  + [00 - SUGOSことはじめ](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/00%20-%20SUGOS%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81.md)
  + [01 - Hello Worldしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/01%20-%20Hello%20World%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [02 - Event Emitしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/02%20-%20Event%20Emit%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [03 - Browser間でやり取りする](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/03%20-%20Browser%E9%96%93%E3%81%A7%E3%82%84%E3%82%8A%E5%8F%96%E3%82%8A%E3%81%99%E3%82%8B.md)
  + [04 - Moduleをnpmパッケージ化する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/04%20-%20Module%E3%82%92npm%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E5%8C%96%E3%81%99%E3%82%8B.md)
