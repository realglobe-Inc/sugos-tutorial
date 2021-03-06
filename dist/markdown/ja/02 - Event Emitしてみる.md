# 【SUGOSチュートリアル】 02 - Event Emitしてみる

[前回のチュートリアル](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/01%20-%20Hello%20World%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)では、簡単な関数のCall/Returnを実装しました。

今回はEmit/Listen形式でのイベント駆動を実装してみます。
Actor側からEventを発火し、Caller側でそれを受け取ります。


<a href="https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/02%20-%20Event%20Emit%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md">
  <img src="../../images/eyecatch-event-emit.jpg"
       alt="eyecatch"
       height="128"
       style="height:128px"
  /></a>

## 内容
- [実装してみる](#%E5%AE%9F%E8%A3%85%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B)
  * [プロジェクトの用意](#%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%AE%E7%94%A8%E6%84%8F)
  * [Hubサーバを立てる](#hub%E3%82%B5%E3%83%BC%E3%83%90%E3%82%92%E7%AB%8B%E3%81%A6%E3%82%8B)
  * [Eventを発火するModuleを宣言する](#event%E3%82%92%E7%99%BA%E7%81%AB%E3%81%99%E3%82%8Bmodule%E3%82%92%E5%AE%A3%E8%A8%80%E3%81%99%E3%82%8B)
  * [Actorに載せてHubにつなぐ](#actor%E3%81%AB%E8%BC%89%E3%81%9B%E3%81%A6hub%E3%81%AB%E3%81%A4%E3%81%AA%E3%81%90)
  * [Callerから呼び出す](#caller%E3%81%8B%E3%82%89%E5%91%BC%E3%81%B3%E5%87%BA%E3%81%99)
  * [まとめ](#%E3%81%BE%E3%81%A8%E3%82%81)
- [おまけ](#%E3%81%8A%E3%81%BE%E3%81%91)
  * [雑談: SUGOSの正式名称とそれが目指す世界](#%E9%9B%91%E8%AB%87-sugos%E3%81%AE%E6%AD%A3%E5%BC%8F%E5%90%8D%E7%A7%B0%E3%81%A8%E3%81%9D%E3%82%8C%E3%81%8C%E7%9B%AE%E6%8C%87%E3%81%99%E4%B8%96%E7%95%8C)
- [これも読みたい](#%E3%81%93%E3%82%8C%E3%82%82%E8%AA%AD%E3%81%BF%E3%81%9F%E3%81%84)
- [リンク](#%E3%83%AA%E3%83%B3%E3%82%AF)


## 実装してみる

### プロジェクトの用意

前回と同様に、まずはプロジェクトディレクトリを用意します。

```bash
mkdir sugos-tutorial-02
cd sugos-tutorial-02
npm init -y

```

次に、必要なパッケージをインストールします。

```bash
npm install sugo-actor sugo-caller sugo-hub co asleep -S
```

### Hubサーバを立てる

ここは前回と同様で、

**hub.js**
```javascript
#!/usr/bin/env node

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

を用意してNodeから実行

```bash
node ./hub.js
```

### Eventを発火するModuleを宣言する

次にModuleを用意します。ここでは一秒ごとにtickを発火し、最後にboomするものを用意します

**modules/time-bomb.js**
```javascript
/**
 * Sample of module with event emitting
 * @module tableTennis
 */
'use strict'

const { Module } = require('sugo-actor')
const co = require('co')
const asleep = require('asleep')

const timeBomb = new Module({
  countDown (count) {
    const s = this
    return co(function * () {
      let abort = () => { count = -1 }
      s.on('abort', abort) // Listen to events from the caller
      while (count > 0) {
        count--
        s.emit('tick', { count }) // Emit an event to the caller
        yield new Promise((resolve) =>
          setTimeout(() => resolve(), 1000)
        )
      }
      s.off('abort', abort) // Remove event listener
      let isAborted = count === -1
      return isAborted ? 'hiss...' : 'booom!!!'
    })
  }
})

module.exports = timeBomb

```

Moduleのメソッドにおける`this`はEventEmitterを継承しており、
`.on`, `.off`でListerの登録・解除、`.emit()`で発火を行なえます。


### Actorに載せてHubにつなぐ

前回と同様にActorに登録し、

**actor.js**
```javascript
#!/usr/bin/env node

'use strict'

const sugoActor = require('sugo-actor')
const co = require('co')
const timeBomb = require('./modules/time-bomb')

co(function * () {
  let actor = sugoActor({
    host: 'localhost:3000',
    key: 'my-actor-02',
    /** Modules to load */
    modules: {
      timeBomb
    }
  })

// Connect to hub
  yield actor.connect()

  console.log(`Actor connected to: ${actor.socket.io.uri}`)
}).catch((err) => console.error(err))

```

実行します。

```bash
node ./actor.js
```

### Callerから呼び出す

先に定義したtimeBomb ModuleをCaller側から呼びます。

Caller側で`.get()`したModuleもやはり同様にEventEmitterです

**caller.js**
```javascript
#!/usr/bin/env node
'use strict'

const sugoCaller = require('sugo-caller')
const co = require('co')

co(function * () {
  let caller = sugoCaller({
    host: 'localhost:3000'
  })

  // Connect to actor
  let myActor02 = yield caller.connect('my-actor-02')
  let timeBomb = myActor02.get('timeBomb')
  let tick = (data) => console.log(`tick: ${data.count}`)
  timeBomb.on('tick', tick) // Add listener
  let booom = yield timeBomb.countDown(10)
  console.log(booom)
  timeBomb.off('tick', tick) // Remove listener
}).catch((err) => console.error(err))

```

`yield timeBomb.countDown(10)`の部分はcountが全て終わるまで(Actor側でreturnが走るまで）その次の処理に進まない、という点に留意してください。
内部的にはPromiseがpending状態になっており、Actor側のreturnを受けて処理が再開します。

このスクリプトを実行し、カウントダウンが確認できたら成功です。

```bash
node ./caller.js
```

### まとめ

+ Moduleのメソッド内の`this`はEventEmitter
+ `.on()`, `.off()`, `.emit()`メソッドでイベントをやり取りする
+ Actor側のPromiseがpendingの間はCaller側もそれを待つ

なお、今回出てきたSnippetは、[こちら](https://github.com/realglobe-Inc/sugos-tutorial/tree/master/example/tutorial-02)からも入手できます


## おまけ

### 雑談: SUGOSの正式名称とそれが目指す世界

SUGOSというのは略称です。それでは正式名称は？Super Ultra Gorgeous Outstanding Specialです。
そうです。スーパー・ウルトラ・ゴージャース・アウトスタンディング・スペシャルです。略してスゴす。

びっくりするほど薄っぺらい名称ですね。しかしこれが開発チームの認めた公式名称です。

背景を説明しますと、もともと「なんかスゲーの作ろうぜ」から始まったプロジェクトでした。「なんかスゲー」がなんなのかよく分からないまま走りはじめました。
そのため、後で方向転換できるように名称は極力抽象的にしよう、でかい野望を表せる名前にしよう、ということになり、甚だしさを表す形容詞を並べただけの名称が採用されました。

さて、その後そのでかい野望はどうなったのか？

健在です。 現状、SUGOSはRPC(Remote Procedure Call)フレームワークとして説明されていますが、遠隔呼び出しはSUGOSが目指す世界の第一段階に過ぎません。
目指す世界とは、万物のAPI化です。関数化という手段を持ってリソースを機能の集まりとして再定義し、用途に合わせて組み合わせることでそこに意味と役割を与えることを可能にするのです。
そして、何かしらの実体を持つ「モノ」をそれが成す「コト」として捉えた時に、それが如何に目的に合致するかの度合いがすなわち価値です。
最終的にはSUGOSと基盤の上ではその価値創造がこの上なく容易に成ることでしょう。それまでと比べて、甚だしく価値を生み出すことでしょう。
そう、スーパーで、ウルトラで、ゴージャースで、アウトスタンディングな、スペシャルを。（言いたいだけ）


## これも読みたい

+ 前回: [01 - Hello Worldしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/01%20-%20Hello%20World%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
+ 次回: [03 - Browser間でやり取りする](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/03%20-%20Browser%E9%96%93%E3%81%A7%E3%82%84%E3%82%8A%E5%8F%96%E3%82%8A%E3%81%99%E3%82%8B.md)

## リンク

+ [SUGOS](https://github.com/realglobe-Inc/sugos)
+ [SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub)
+ [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor)
+ [SUGO-Caller](https://github.com/realglobe-Inc/sugo-caller)
+ Tutorials
  + [00 - SUGOSことはじめ](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/00%20-%20SUGOS%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81.md)
  + [01 - Hello Worldしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/01%20-%20Hello%20World%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [02 - Event Emitしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/02%20-%20Event%20Emit%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [03 - Browser間でやり取りする](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/03%20-%20Browser%E9%96%93%E3%81%A7%E3%82%84%E3%82%8A%E5%8F%96%E3%82%8A%E3%81%99%E3%82%8B.md)
  + [04 - Moduleをnpmパッケージ化する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/04%20-%20Module%E3%82%92npm%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E5%8C%96%E3%81%99%E3%82%8B.md)
  + [05 - ActorやCallerを認証する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/05%20-%20Actor%E3%82%84Caller%E3%82%92%E8%AA%8D%E8%A8%BC%E3%81%99%E3%82%8B.md)
  + [06 - Observerを使ってみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/06%20-%20Observer%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [07 - Hubを冗長化する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/07%20-%20Hub%E3%82%92%E5%86%97%E9%95%B7%E5%8C%96%E3%81%99%E3%82%8B.md)
