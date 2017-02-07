# 【SUGOSチュートリアル】 01 - Hello Worldしてみる

このチュートリアルでは、SUGOSを使ったもっとも簡単な例を実装します。Actor側で定義した関数をCallerから呼び出すところまでをやります。
(ActorやCallerの役割については[前回のチュートリアル](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/00%20-%20SUGOS%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81.md)に記述されています)

<a href="https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/01%20-%20Hello%20World%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md">
  <img src="../../images/eyecatch-hello-world.jpg"
       alt="eyecatch"
       height="128"
       style="height:128px"
/></a>

## 内容
- [事前準備](#%E4%BA%8B%E5%89%8D%E6%BA%96%E5%82%99)
- [実装してみる](#%E5%AE%9F%E8%A3%85%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B)
  * [プロジェクトの用意](#%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%AE%E7%94%A8%E6%84%8F)
  * [Hubサーバを立てる](#hub%E3%82%B5%E3%83%BC%E3%83%90%E3%82%92%E7%AB%8B%E3%81%A6%E3%82%8B)
  * [Moduleを宣言する](#module%E3%82%92%E5%AE%A3%E8%A8%80%E3%81%99%E3%82%8B)
  * [ActorにModuleを載せてHubにつなぐ](#actor%E3%81%ABmodule%E3%82%92%E8%BC%89%E3%81%9B%E3%81%A6hub%E3%81%AB%E3%81%A4%E3%81%AA%E3%81%90)
  * [Callerから呼び出す](#caller%E3%81%8B%E3%82%89%E5%91%BC%E3%81%B3%E5%87%BA%E3%81%99)
- [まとめ](#%E3%81%BE%E3%81%A8%E3%82%81)
- [おまけ](#%E3%81%8A%E3%81%BE%E3%81%91)
  * [雑談: standard JSを使ってコーディング標準化する](#%E9%9B%91%E8%AB%87-standard-js%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E6%A8%99%E6%BA%96%E5%8C%96%E3%81%99%E3%82%8B)
- [これも読みたい](#%E3%81%93%E3%82%8C%E3%82%82%E8%AA%AD%E3%81%BF%E3%81%9F%E3%81%84)
- [リンク](#%E3%83%AA%E3%83%B3%E3%82%AF)


## 事前準備

SUGOSは基本的にNode.js上で稼働します。 [nvm](https://github.com/creationix/nvm#node-version-manager-)などを利用して、以下の環境を事前に用意してください。

+ [Node.js >=6](https://nodejs.org/en/)
+ [npm >=4](https://docs.npmjs.com/)

<a href="https://nodejs.org/en/">
  <img src="../../images/nodejs-banner.png"
       alt="banner"
       height="40"
       style="height:40px"
  /></a>
<a href="https://docs.npmjs.com/">
  <img src="../../images/npm-banner.png"
       alt="banner"
       height="40"
       style="height:40px"
  /></a>

## 実装してみる

### プロジェクトの用意

まずはプロジェクトディレクトリを用意します。

```bash
mkdir sugos-tutorial-01
cd sugos-tutorial-01
npm init -y

```

次に、必要なパッケージをインストールします。


```bash
npm install sugo-actor sugo-caller sugo-hub co asleep -S
```

### Hubサーバを立てる

命令を中継するための[SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub)サーバを立てます。

以下のようなスクリプトを用意した後、

**hub.js**
```javascript
#!/usr/bin/env node

/**
 * Start hub server
 * @see https://github.com/realglobe-Inc/sugo-hub
 */
'use strict'

const sugoHub = require('sugo-hub')
const co = require('co')

co(function * () {
  let hub = sugoHub({})
  yield hub.listen(3000)
  console.log(`SUGO Cloud started at port: ${hub.port}`)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})

```

Nodeで実行します。

```bash
node ./hub.js
```

パフォーマンス的な理由からRedisを使うべきだという警告がでますが、ここでは無視で構いません。


### Moduleを宣言する

次にActorにつなぐためのModuleを宣言します。
ここではpingを打つとpongを返すだけの簡単なものを用意します。

**modules/table-tennis.js**
```javascript
/**
 * Sample of module with simple call-return function
 * @module tableTennis
 * @see https://github.com/realglobe-Inc/sugo-module-base#usage
 */
'use strict'

const { Module } = require('sugo-actor')
const co = require('co')
const asleep = require('asleep')

// Create a new module
const tableTennis = new Module({
  ping (message = '') {
    // Just wait 500ms and return pong.
    return co(function * () {
      yield asleep(500)
      return `pong! ${message}`
    })
  }
})

module.exports = tableTennis

```

モジュールで宣言したメソッドは後でActorを通じてCaller側に公開されます。

なお、メソッドの戻り値に[Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)オブジェクトを渡すことで非同期に処理を扱えるようになります。
ここではより直感的な記述的にするために、[co](https://github.com/tj/co#readme)パッケージを利用しています。


### ActorにModuleを載せてHubにつなぐ

Moduleが用意できたら、それを[SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor)に載せます。

接続先となるHubのhost名と、自身の識別子となる`key`項目、使うモジュールを渡してActorインスタンスを生成します。

**actor.js**
```javascript
#!/usr/bin/env node

/**
 * Connect actor
 */
'use strict'

const sugoActor = require('sugo-actor')
const co = require('co')
const tableTennis = require('./modules/table-tennis')

co(function * () {
  let actor = sugoActor({
    host: 'localhost:3000',
    key: 'my-actor-01',
    /** Modules to load */
    modules: {
      tableTennis
    }
  })

// Connect to hub
  yield actor.connect()

  console.log(`Actor connected to: ${actor.socket.io.uri}`)
}).catch((err) => console.error(err))

```

Actorのスクリプトが用意できたらそれを実行してHubにつなぎます。

```bash
node ./actor.js
```


### Callerから呼び出す

Callerからは`.connect()`メソッドに、keyを指定することで特定のActorに接続することができます。
先ほど宣言した"my-actor-01"をkeyとて渡し、そこから'tableTennis'にアクセスします。

**caller.js**
```javascript
#!/usr/bin/env node
/**
 * Use sugo caller
 * @see https://github.com/realglobe-Inc/sugo-caller#readme
 */
'use strict'

const sugoCaller = require('sugo-caller')
const co = require('co')

co(function * () {
  let caller = sugoCaller({
    host: 'localhost:3000'
  })

  // Connect to actor
  let myActor01 = yield caller.connect('my-actor-01')
  let tableTennis = myActor01.get('tableTennis')

  let pong = yield tableTennis.ping('hello world!')
  console.log(`Pong from myActor01/tableTennis: "${pong}"`)
}).catch((err) => console.error(err))


```

このスクリプトを実行し、無事pongが帰ってきたら成功です。

```bash
node ./caller.js
```

## まとめ

+ Hub / Actor / Callerの三つで最小構成となる
+ Actorはkeyによって判別される
+ Actor側で宣言された関数はCaller側で使えるようになる
+ Callerから呼び出した実行結果はPromiseで返ってくる

なお、今回出てきたSnippetは、[こちら](https://github.com/realglobe-Inc/sugos-tutorial/tree/master/example/tutorial-01)からも入手できます


## おまけ

### 雑談: standard JSを使ってコーディング標準化する

今回でてきたスクリプトを含め、SUGOSチームではコーディング規約として[standard JS](https://github.com/feross/standard#------javascript-standard-style--)を採用しています。
これはソースコードの中で「インテンドをいくつにするか」、「セミコロンをどうするか」などのルールを規程し、チェックするものです。

以前はチーム内のメンバが異なるエディタを使っているため、フォーマッタによって毎度Gitの差分が出てしまうという問題が生じていました。
standard JSでは

+ ルールが徹底している
+ 個別の設定がいらない
+ 様々なエディタに対応している

という利点があり、現在ではチーム標準となりました。オススメです。

<a href="https://github.com/feross/standard">
  <img src="../../images/standard-js-banner.png"
       alt="banner"
       height="40"
       style="height:40px"
  /></a>


## これも読みたい

+ 前回: [00 - SUGOSことはじめ](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/00%20-%20SUGOS%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81.md)
+ 次回: [02 - Event Emitしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/02%20-%20Event%20Emit%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)

## リンク

+ [SUGOS](https://github.com/realglobe-Inc/sugos)
+ [SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub)
+ [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor)
+ [SUGO-Caller](https://github.com/realglobe-Inc/sugo-caller)
+ Tutorials
  + [00 - SUGOSことはじめ](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/00%20-%20SUGOS%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81.md)
  + [01 - Hello Worldしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/01%20-%20Hello%20World%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [02 - Event Emitしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/02%20-%20Event%20Emit%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [03 - Browser間でやり取りする](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/03%20-%20Browser%E9%96%93%E3%81%A7%E3%82%84%E3%82%8A%E5%8F%96%E3%82%8A%E3%81%99%E3%82%8B.md)
  + [04 - Moduleをnpmパッケージ化する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/04%20-%20Module%E3%82%92npm%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E5%8C%96%E3%81%99%E3%82%8B.md)
