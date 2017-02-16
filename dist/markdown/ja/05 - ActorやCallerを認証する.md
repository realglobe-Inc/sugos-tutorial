# 【SUGOSチュートリアル】 05 - ActorやCallerを認証する

実践的なアプリケーションを作る際に、必須になってくるのが認証機能。

今回はHub上で接続してきたActorとCallerを認証します。


<a href="https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/05%20-%20Actor%E3%82%84Caller%E3%82%92%E8%AA%8D%E8%A8%BC%E3%81%99%E3%82%8B.md">
    <img src="../../images/eyecatch-auth.jpg"
         alt="eyecatch"
         height="128"
         style="height:128px"
    /></a>


## 内容
- [実装してみる](#%E5%AE%9F%E8%A3%85%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B)
  * [プロジェクトの用意](#%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%AE%E7%94%A8%E6%84%8F)
  * [Hubサーバを立てる](#hub%E3%82%B5%E3%83%BC%E3%83%90%E3%82%92%E7%AB%8B%E3%81%A6%E3%82%8B)
  * [Actorを用意する](#actor%E3%82%92%E7%94%A8%E6%84%8F%E3%81%99%E3%82%8B)
  * [Callerを用意する](#caller%E3%82%92%E7%94%A8%E6%84%8F%E3%81%99%E3%82%8B)
  * [まとめ](#%E3%81%BE%E3%81%A8%E3%82%81)
- [これも読みたい](#%E3%81%93%E3%82%8C%E3%82%82%E8%AA%AD%E3%81%BF%E3%81%9F%E3%81%84)
- [リンク](#%E3%83%AA%E3%83%B3%E3%82%AF)


## 実装してみる

### プロジェクトの用意

いつも通り、まずはプロジェクトディレクトリを用意します。

```bash
mkdir sugos-tutorial-05
cd sugos-tutorial-05
npm init -y

```

次に、必要なパッケージをインストールします。

```bash
npm install sugo-actor sugo-caller sugo-hub co debug asleep -S
```

### Hubサーバを立てる

Hubの作成時に`authenticate`オプションを追加します。
ここに独自の認証関数を渡すことで、接続してくるsocketを受け入れ、もしくは拒否することができます。

今回は事前に登録してあるパスワードハッシュと合致するかどうかを持って認証しますことにします。

**hub.js**

```javascript
#!/usr/bin/env node

'use strict'

const sugoHub = require('sugo-hub')
const co = require('co')
const crypto = require('crypto')

// Password hash function
const toHash = (password) => crypto.createHash('sha512').update(password).digest('hex')

co(function * () {
  /**
   * Password hashes for auth
   */
  const passwordHashes = {
    actors: {
      'the-actor-for-tutorial-05': toHash('BigBigApplePie')
    },
    callers: {
      'the-caller-for-tutorial-05': toHash('LittleLittleOrange')
    }
  }

  let hub = sugoHub({
    /**
     * Custom auth function.
     * @param {Object} socket - A socket connecting
     * @param {Object} data - Socket auth data
     * @returns {Promise.<boolean>} - OK or not
     */
    authenticate (socket, data) {
      let { id, type, hash } = data
      switch (type) {
        case 'actor': {
          // Check actor hash
          let ok = passwordHashes.actors[ id ] === hash
          if (ok) {
            console.log(`Auth succeeded with actor: ${id}`)
          }
          return Promise.resolve(ok)
        }
        case 'caller': {
          // Check caller hash
          let ok = passwordHashes.callers[ id ] === hash
          if (ok) {
            console.log(`Auth succeeded with caller: ${id}`)
          }
          return Promise.resolve(ok)
        }
        default:
          console.warn(`Unknown type: ${type}`)
          return false
      }
    }
  })
  yield hub.listen(3000)
  console.log(`SUGO Cloud started at port: ${hub.port}`)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})

```
```bash
DEBUG=sugos:tutorial:* node ./hub.js
```


### Actorを用意する

Actorの作成時に`auth`オプションを追加し、認証情報をObject型で渡します。
ここで私た内容はhub側の`authenticate`の呼び出し時の第二引数となります。

**actor.js**

```javascript
#!/usr/bin/env node

'use strict'

const sugoActor = require('sugo-actor')
const { Module } = sugoActor
const co = require('co')
const asleep = require('asleep')
const crypto = require('crypto')

// Password hash function
const toHash = (password) => crypto.createHash('sha512').update(password).digest('hex')

co(function * () {
  let actor = sugoActor({
    host: 'localhost:3000',
    key: 'my-actor-05',
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
    },

    /**
     * Authenticate data of this actor
     */
    auth: {
      id: 'the-actor-for-tutorial-05',
      type: 'actor',
      hash: toHash('BigBigApplePie')
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

このActorスクリプトを実行すると、hub側で認証成功のメッセージが出ることが確認できます


### Callerを用意する

Caller側も同様です。`auth`オプションを追加し、認証情報をObject型で渡すことで、認証ができます

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
const crypto = require('crypto')

// Password hash function
const toHash = (password) => crypto.createHash('sha512').update(password).digest('hex')

co(function * () {
  let caller = sugoCaller({
    host: 'localhost:3000',
    /**
     * Authenticate data of this caller
     */
    auth: {
      id: 'the-caller-for-tutorial-05',
      type: 'caller',
      hash: toHash('LittleLittleOrange')
    }
  })

  // Connect to actor
  let myActor05 = yield caller.connect('my-actor-05')
  let tableTennis = myActor05.get('tableTennis')

  let pong = yield tableTennis.ping('hello world!')
  console.log(`Pong from myActor05/tableTennis: "${pong}"`)
}).catch((err) => console.error(err))


```

```bash
node ./caller.js
```

### まとめ

+ Hubの`authenticate`に関数を渡すことで接続してくるCallerやActorを認証できる
+ 認証関数のシグネチャは`(socket, data) -> Promise.<Boolean/>`である
+ ActorやCallerの`auth`オプションに、認証情報を渡す



## これも読みたい

+ 前回: [04 - Moduleをnpmパッケージ化する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/04%20-%20Module%E3%82%92npm%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E5%8C%96%E3%81%99%E3%82%8B.md)
+ 次回: [06 - Observerを使ってみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/06%20-%20Observer%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%8B.md)

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
