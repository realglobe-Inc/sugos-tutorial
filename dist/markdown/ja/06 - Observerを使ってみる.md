# 【SUGOSチュートリアル】 

[Sugo Observer](https://github.com/realglobe-Inc/sugo-observer#readme)を使うと、ActorやCallerの接続状態をクライアント側から監視できます。
これにより、例えばActorがHubで繋がったタイミングで動的にCallerを繋げる、といった処理が可能になります。

今回はActorやCallerの接続時にログを出すだけの簡単な実装をしてみます。


<a href="">
    <img src="../../images/eyecatch-dynamic.jpg"
         alt="eyecatch"
         height="128"
         style="height:128px"
    /></a>



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

observerのファクトリーメソッド（`.sugoObserver(handler, config)`）を利用して、インスタンスを作成します。


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

実行すると、observer側のメッセージが表示されます。