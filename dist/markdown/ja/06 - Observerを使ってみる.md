# 【SUGOSチュートリアル】 06 - Observerを使ってみる

[SUGO-Observer](https://github.com/realglobe-Inc/sugo-observer#readme)を使うと、ActorやCallerの接続状態をクライアント側から監視できます。
これにより、例えばActorがHubで繋がったタイミングで動的にCallerを繋げる、といった処理が可能になります。

今回はActorやCallerの接続時にログを出すだけの簡単な実装をしてみます。


<a href="https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/06%20-%20Observer%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%8B.md">
    <img src="../../images/eyecatch-dynamic.jpg"
         alt="eyecatch"
         height="128"
         style="height:128px"
    /></a>

## 内容
- [実装してみる](#%E5%AE%9F%E8%A3%85%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B)
  * [Hubサーバを立てる](#hub%E3%82%B5%E3%83%BC%E3%83%90%E3%82%92%E7%AB%8B%E3%81%A6%E3%82%8B)
  * [Observerを用意する](#observer%E3%82%92%E7%94%A8%E6%84%8F%E3%81%99%E3%82%8B)
  * [Actorを用意する](#actor%E3%82%92%E7%94%A8%E6%84%8F%E3%81%99%E3%82%8B)
  * [Callerを用意する](#caller%E3%82%92%E7%94%A8%E6%84%8F%E3%81%99%E3%82%8B)
  * [まとめ](#%E3%81%BE%E3%81%A8%E3%82%81)
- [これも読みたい](#%E3%81%93%E3%82%8C%E3%82%82%E8%AA%AD%E3%81%BF%E3%81%9F%E3%81%84)
- [リンク](#%E3%83%AA%E3%83%B3%E3%82%AF)


## 実装してみる

いつも通り、まずはプロジェクトディレクトリを用意し、


```bash
mkdir sugos-tutorial-06
cd sugos-tutorial-06
npm init -y

```

必要なパッケージをインストール。sugo-actorやsugo-callerに加え、sugo-observerもインストールします

```bash
npm install sugo-actor sugo-caller sugo-hub sugo-observer co asleep -S
```

### Hubサーバを立てる

ここはいつも通り

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
```bash
node ./hub.js
```

### Observerを用意する

SUGO-Observerのファクトリーメソッド（`.sugoObserver(handler, config)`）を利用して、インスタンスを作成します。


**observer.js**

```javascript
#!/usr/bin/env node
/**
 * Use sugo observer
 * @see https://github.com/realglobe-Inc/sugo-observer#readme
 */
'use strict'

const sugoObserver = require('sugo-observer')
const asleep = require('asleep')
const co = require('co')

co(function * () {
  let observer = sugoObserver(({ event, data }) => {
    switch (event) {
      case 'actor:setup': {
        let { key } = data
        console.log(`New actor joined: ${key}`)
        break
      }
      case 'caller:join': {
        let { actor } = data
        console.log(`New called joined to actor: ${actor.key}`)
        break
      }
      default:
        break
    }
  }, {
    host: 'localhost:3000'
  })

  yield observer.start() // Start observing
  /* ... */
  yield asleep(200000)
  yield observer.stop() // Stop observing

}).catch((err) => console.error(err))

```

```bash
node ./observer.js
```


### Actorを用意する

**actor.js**

```javascript
#!/usr/bin/env node

'use strict'

const sugoActor = require('sugo-actor')
const { Module } = sugoActor
const co = require('co')
const asleep = require('asleep')

co(function * () {
  let actor = sugoActor({
    host: 'localhost:3000',
    key: 'my-actor-06',
    /** Modules to load */
    modules: {
      tableTennis: new Module({
        ping (message = '') {
          // Just wait 500ms and return pong.
          return co(function * () {
            yield asleep(500)
            return `pong! ${message}`
          })
        }
      })
    }
  })

// Connect to hub
  yield actor.connect()

  console.log(`Actor connected to: ${actor.socket.io.uri}`)
}).catch((err) => console.error(err))

```

```bash
node ./actor.js
```

実行すると、observer側のメッセージが表示されます。

### Callerを用意する


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
  let myActor06 = yield caller.connect('my-actor-06')
  let tableTennis = myActor06.get('tableTennis')

  let pong = yield tableTennis.ping('hello world!')
  console.log(`Pong from myActor06/tableTennis: "${pong}"`)
}).catch((err) => console.error(err))


```

```bash
node ./caller.js
```

実行すると、observer側のメッセージが表示されます。


### まとめ

+ SUGO-Observerを使うことで、クライアントからHubを監視できる
+ ActorやCallerの接続を検知できる



## これも読みたい

+ 前回: [05 - ActorやCallerを認証する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/05%20-%20Actor%E3%82%84Caller%E3%82%92%E8%AA%8D%E8%A8%BC%E3%81%99%E3%82%8B.md)
+ 次回: [07 - Hubを冗長化する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/07%20-%20Hub%E3%82%92%E5%86%97%E9%95%B7%E5%8C%96%E3%81%99%E3%82%8B.md)

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
  + [05 - ActorやCallerを認証する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/05%20-%20Actor%E3%82%84Caller%E3%82%92%E8%AA%8D%E8%A8%BC%E3%81%99%E3%82%8B.md)
  + [06 - Observerを使ってみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/06%20-%20Observer%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [07 - Hubを冗長化する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/07%20-%20Hub%E3%82%92%E5%86%97%E9%95%B7%E5%8C%96%E3%81%99%E3%82%8B.md)
