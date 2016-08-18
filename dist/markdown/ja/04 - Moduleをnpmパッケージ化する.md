# 【SUGOSチュートリアル】 04 - Moduleをnpmパッケージ化する

[前回のチュートリアル](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/03%20-%20Browser%E9%96%93%E3%81%A7%E3%82%84%E3%82%8A%E5%8F%96%E3%82%8A%E3%81%99%E3%82%8B.md)では、Browser間の通信を実装しました。

さて、これまでのチュートリアルはActorの宣言時に、提供するModuleを毎回その場で定義していました。
しかし実際にアプリケーションを作るとなると、Moduleを使い回したくなる場合が多々あります。

そこで今回は、Moduleを単体のプロジェクトとして生成し、npmパッケージとして配布します。
機能としては簡単なKeyValueStoreにします。キーと値を渡すと、それをローカルのJSONファイルに保存するようなものです。


<a href="https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/04%20-%20Module%E3%82%92npm%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E5%8C%96%E3%81%99%E3%82%8B.md">
<img src="../../images/eyecatch-package.jpg"
     alt="eyecatch"
     height="128"
     style="height:128px"
/></a>

## 内容
- [事前準備](#事前準備)
- [実装してみる](#実装してみる)
- [まとめ](#まとめ)
- [おまけ](#おまけ)
  * [雑談: Javascriptの関数でキーワード引数みたいなことをしてみる](#雑談-javascriptの関数でキーワード引数みたいなことをしてみる)
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

## 実装してみる

### 雛形の作成

コマンドラインで`sugo-scaffold <type> <dircotry>`を実行すると対話シェルが始まり、値を入力すると雛形が生成されます。

```bash
# Create a module project
sugo-scaffold module "sugos-tutorial-04"
cd sugos-tutorial-04
npm install
npm test
```

`module_name`の部分は今回作成する"KeyValueStore"という名称にします。

<img src="../../images/tutorial-module-scaffold.png"/>

最後まで答えるとプロジェクトの雛形が生成されます。


### Moduleの実装

作成したプロジェクトに移動の中に"lib/key_value_store.js"と名前でModuleクラスのファイルが生成されています。
ここに機能を追加していきましょう。

```javascript
/**
 * KeyValueStore class
 * @class KeyValueStore
 * @augments Module
 * @param {Object} config - Configuration
 */
'use strict'

const { Module } = require('sugo-module-base')
const { name, version, description } = require('../package.json')

const co = require('co')
const { hasBin } = require('sg-check')
const debug = require('debug')('sugo:module:demo-module')

/** @lends KeyValueStore */
class KeyValueStore extends Module {
  constructor (config = {}) {
    debug('Config: ', config)
    super(config)
  }

  /**
   * Ping a message.
   * @param {string} pong
   * @returns {Promise.<string>} - Pong message
   */
  ping (pong = 'pong') {
    return co(function * pingAck () {
      return pong // Return result to a remote caller.
    })
  }

  /**
   * Assert actor system requirements.
   * @throws {Error} - System requirements failed error
   * @returns {Promise.<boolean>} - Asserted state
   */
  assert () {
    const bins = [ 'node' ] // Required commands
    return co(function * assertAck () {
      yield hasBin.assertAll(bins)
      return true
    })
  }

  /**
   * Module specification
   * @see https://github.com/realglobe-Inc/sg-schemas/blob/master/lib/module_spec.json
   */
  get $spec () {
    return {
      name,
      version,
      desc: description,
      methods: {
        ping: {
          desc: 'Test the reachability of a module.',
          params: [
            { name: 'pong', type: 'string', desc: 'Pong message to return' }
          ],
          return: {
            type: 'string',
            desc: 'Pong message'
          }
        },

        assert: {
          desc: 'Test if the actor fulfills system requirements',
          params: [],
          throws: [ {
            type: 'Error',
            desc: 'System requirements failed'
          } ],
          return: {
            type: 'boolean',
            desc: 'System is OK'
          }
        }
      },

      events: null
    }
  }
}

module.exports = KeyValueStore

```


## まとめ

+ [sugo-scaffold](https://github.com/realglobe-Inc/sugo-scaffold)で雛形が生成できる


## おまけ

### 雑談: Javascriptの関数でキーワード引数みたいなことをしてみる

例えばPythonだと[Keyword Arguments](https://docs.python.org/3/tutorial/controlflow.html#keyword-arguments)なる仕様があって、
引数がいっぱい関数をうまく記述できるようになっているのです。

```python
# Keyword-arguments example of Python
def do_something(src, dest, **keywords):
  force = keywords.pop('force', false)
  mkdirp = keywords.pop('mkdirp', true)
  print('Do something with args: ', src, dest, force)

do_something('foo.txt', 'bar.txt', force=false, mkdirp=false)
```

これと同じようなことをJavaScriptでやろうとするとそれはもう大変でした。ES2015が使えるようになるまではね。

Node.js6から導入された[ES2015のDestructuring assignment](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)機能を使うと、

```javascript
// Example JavasScript, after ES2015
function doSomething (src, dest, options = {}) {
  let {
    force = false,
    mkdirp = true
  } = options
  console.log('Do something with args: ', src, dest, force)
}
doSomething('foo.txt', 'bar.txt', { force: false, mkdirp: false })
````

といった感じで、pythonと大差ない形でかけます。
もちろん[preset-es2015でバベれ](https://babeljs.io/docs/plugins/preset-es2015/)ばブラウザでも動きます。

昔だったら

```javascript
// Example JavasScript, before ES2015
function doSomething (src, dest, options) {
  if(typeof options === 'undefined') {
    options = {}
  }
  var force = typeof options.force === 'undefined' ? false : options.force
  var mkdirp = typeof options.mkdirp === 'undefined' ? true : options.mkdirp
  console.log('Do something with args: ', src, dest, force)
}
doSomething('foo.txt', 'bar.txt', { force: false, mkdirp: false })
```

とか書いていたのに。もう携帯電話がなかった時代と同じくらい遠く感じますね。



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
