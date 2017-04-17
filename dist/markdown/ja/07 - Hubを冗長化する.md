# 【SUGOSチュートリアル】 07 - Hubを冗長化する


今回は[SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub#readme)をスケールアウトしてみます。
複数のHubインスタンスを同一のRedisサーバに接続することによって、CallerやActorからHubの違いを意識せずに済むようになります。



<a href="https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/07%20-%20Hub%E3%82%92%E5%86%97%E9%95%B7%E5%8C%96%E3%81%99%E3%82%8B.md">
    <img src="../../images/eyecatch-spread.jpg"
         alt="eyecatch"
         height="128"
         style="height:128px"
    /></a>

## 内容
- [実装してみる](#%E5%AE%9F%E8%A3%85%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B)
  * [Redisサーバを立てる](#redis%E3%82%B5%E3%83%BC%E3%83%90%E3%82%92%E7%AB%8B%E3%81%A6%E3%82%8B)
  * [Hubサーバを立てる](#hub%E3%82%B5%E3%83%BC%E3%83%90%E3%82%92%E7%AB%8B%E3%81%A6%E3%82%8B)
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


```bash
npm install sugo-actor sugo-caller sugo-hub sugo-observer co asleep -S
```

### Redisサーバを立てる

ローカルで[Redis](https://github.com/realglobe-Inc/sugos)を実行します。デフォルトで6379ポートをlistenします

```bash
redis-server
```


### Hubサーバを立てる

今回は異なる二つのportそれぞれに大してhubサーバを立てます

**hub.js**

```javascript
#!/usr/bin/env node

'use strict'

const sugoHub = require('sugo-hub')
const co = require('co')

const ports = [ 3000, 3001 ]

co(function * () {
  // Start hub server for each ports
  for (let port of ports) {
    let hub = sugoHub({
      storage: {
        // Use redis as storage
        // See https://github.com/realglobe-Inc/sugo-hub#using-redis-server
        redis: {
          host: 'localhost',
          port: '6379',
          db: 1
        }
      }
    })
    yield hub.listen(port)
    console.log(`SUGO Cloud started at port: ${hub.port}`)
  }
}).catch((err) => {
  console.error(err)
  process.exit(1)
})

```
```bash
node ./hub.js
```

### Actorを用意する

それぞれのサーバに大してactorを用意します。

**actor.js**

```javascript
#!/usr/bin/env node

'use strict'

const sugoActor = require('sugo-actor')
const { Module } = sugoActor
const co = require('co')
const asleep = require('asleep')

const HUB_O1 = 'localhost:3000'
const HUB_O2 = 'localhost:3001'

co(function * () {
  const tableTennis = () => new Module({
    ping (message = '') {
      // Just wait 500ms and return pong.
      return co(function * () {
        yield asleep(500)
        return `pong! ${message}`
      })
    }
  })

  // Prepare actors for each hubs
  let actors = [
    sugoActor({
      host: HUB_O1,
      key: 'my-actor-07@hub01',
      modules: { tableTennis: tableTennis() }
    }),
    sugoActor({
      host: HUB_O2,
      key: 'my-actor-07@hub02',
      modules: { tableTennis: tableTennis() }
    })
  ]

  for (let actor of actors) {
    // Connect to hub
    yield actor.connect()

    console.log(`Actor connected to: ${actor.socket.io.uri}`)
  }
}).catch((err) => console.error(err))

```

```bash
node ./actor.js
```


### Callerを用意する

Callerから先に用意した二つのactorに接続します。


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

const HUB_O1 = 'localhost:3000'

co(function * () {
  let caller = sugoCaller({
    host: HUB_O1
  })

  // Try actors on each hub
  let actorKeys = [
    'my-actor-07@hub01',
    'my-actor-07@hub02'
  ]

  for (let actorKey of actorKeys) {
    // Connect to actor
    let myActor07 = yield caller.connect(actorKey)
    let tableTennis = myActor07.get('tableTennis')

    let pong = yield tableTennis.ping('hello world!')
    console.log(`Pong from ${actorKey}/tableTennis: "${pong}"`)
  }
}).catch((err) => console.error(err))


```

```bash
node ./caller.js
```

Callerそのものは3000ポートのhub01に接続しているにも関わらず、3001ポートのhub02上のactorにも接続できることが確認できます



### まとめ

+ Redisを使うことでSUGO-Hubを冗長化できる
+ ActorやCallerからは、どのHubインスタンスいるかを気にしなくて良い



## これも読みたい

+ 前回: [06 - Observerを使ってみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/06%20-%20Observer%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%8B.md)
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
+ [05 - ActorやCallerを認証する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/05%20-%20Actor%E3%82%84Caller%E3%82%92%E8%AA%8D%E8%A8%BC%E3%81%99%E3%82%8B.md)
+ [06 - Observerを使ってみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/06%20-%20Observer%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%8B.md)
+ [07 - Hubを冗長化する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/07%20-%20Hub%E3%82%92%E5%86%97%E9%95%B7%E5%8C%96%E3%81%99%E3%82%8B.md)
