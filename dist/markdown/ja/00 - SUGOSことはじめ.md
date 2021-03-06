# 【SUGOSチュートリアル】 00 - SUGOSことはじめ


フレームワーク[SUGOS](https://github.com/realglobe-Inc/sugos)のチュートリアル。

そんなのいいから取りあえずソースコードを！と言う方は[こちらの実装例](https://github.com/realglobe-Inc/sugos-tutorial/tree/master/example)を参照。


## 内容
- [SUGOSとは](#sugos%E3%81%A8%E3%81%AF)
- [できること](#%E3%81%A7%E3%81%8D%E3%82%8B%E3%81%93%E3%81%A8)
- [どういう仕組みか](#%E3%81%A9%E3%81%86%E3%81%84%E3%81%86%E4%BB%95%E7%B5%84%E3%81%BF%E3%81%8B)
  * [主なコンポネーント](#%E4%B8%BB%E3%81%AA%E3%82%B3%E3%83%B3%E3%83%9D%E3%83%8D%E3%83%BC%E3%83%B3%E3%83%88)
- [まとめ](#%E3%81%BE%E3%81%A8%E3%82%81)
- [これも読みたい](#%E3%81%93%E3%82%8C%E3%82%82%E8%AA%AD%E3%81%BF%E3%81%9F%E3%81%84)
- [リンク](#%E3%83%AA%E3%83%B3%E3%82%AF)


## SUGOSとは

+ 遠隔関数呼び出し（RPC: Remote Procedure Call）を実現するフレームワーク
+ 関数定義を動的に共有することで、ネットワーク越しであることを意識しなくて良くなる
+ 主に[Node.js](https://nodejs.org/en/)で実装されている
+ [EventEmitter](https://nodejs.org/api/events.html#events_events)形式でのイベント駆動な記述も可能
+ [株式会社リアルグローブ](http://realglobe.jp/)が開発している

<a href="https://github.com/realglobe-Inc/sugos">
  <img src="../../images/sugos-banner.png"
       alt="Banner"
       height="40"
  />
</a>
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
<a href="http://realglobe.jp/">
  <img src="../../images/realglboe-logo.png"
       alt="banner"
       height="40"
       style="height:40px"
  /></a>


## できること

SUGOSを使うと、あるクライアント上で定義した関数が、他のクライアントからいきなり使えるようになります。
HTTPやWebSocketといった中間のプロトコルを意識することなく、遠隔呼び出しが可能になるのです。

<img src="../../images/sugos-overview.png"
     alt="Overview"
/>


例えば、関数を提供する側のクライアント（Actor) において、

+ メソッドを持つModuleを宣言 ( `tableTennis#ping` )
+ クライアント名(key)を宣言し、仲介となるhubサーバに接続 ( `my-actor-01@example.sugo-hub.com` )

```javascript
'use strict'

const co = require('co')
const sugoActor = require('sugo-actor')
const { Module } = sugoActor

co(function * () {
  // Define a module with methods
  let tableTennis = new Module({
    ping (pong) {
      return `"${pong}" from actor!`
    }
  })

  // Create an actor client instance
  let actor = sugoActor({
    host: 'example.sugo-hub.com',
    key: 'my-actor-01',
    modules: { tableTennis }
  })

  // Connect to hub server
  yield actor.connect()
}).catch((err) => console.error(err))

```

すると、

関数を呼び出す側クライアント (Caller)から、Actorが提供するModuleにアクセスできるようになります。


```javascript
'use strict'

const sugoCaller = require('sugo-caller')
const co = require('co')

co(function * () {
  let caller = sugoCaller({
    host: 'example.sugo-hub.com'
  })
  // Connect to an actor with key
  let actor01 = yield caller.connect('my-actor-01')

  {
    // Get a module of the actor
    let tableTennis = actor01.get('tableTennis')
    let pong = yield tableTennis.ping('hey!')
    console.log(pong) // -> `"hey!" from call!`
  }
}).catch((err) => console.error(err))

```

`.ping()`自体はCaller側のJavascriptではどこにも宣言されていませんが、Actorから受け取った定義を基にして動的に生成されます。

また、一方的な関数呼び出しだけではなく、 Node.jsの[EventEmitter](https://nodejs.org/api/events.html#events_events)を用いたイベント駆動もサポートしています。
`.on()`や`.emit()`となどの書き方で、Actor側からCaller側に通知が出せます。


## どういう仕組みか

### 主なコンポネーント

| コンポーネント | 役割 |
| ------------ | --- |
| [SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub) | ActorとCallerの通信をとり持つサーバ。内部的には[Socket.IO](http://socket.io/)と[Koa](https://github.com/koajs/koa)を利用している |
| [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor) | 関数実行を担うクライアント。`key`によって一意に識別される。 |
| [SUGO-Caller](https://github.com/realglobe-Inc/sugo-caller) | 関数呼び出しを担うクライアント。接続先のActorに合わせて動的にJavascriptの関数を生成する |


ActorとCallerはそれぞれWebSocketでHubと接続します。


&nbsp;&nbsp;&nbsp;&nbsp;**Caller** **<----->** **Hub** **<----->** **Actor**


Callerは接続時にActorからModuleの定義情報を受け取り、それを元にJavascript関数を動的に生成します。

Caller側で関数を実行すると、関数名や引数などの情報が裏でJSONに変換され、Hubを介して接続先のActorに届きます。
Actor側では受けとった情報を元に対象の関数を呼び出し、その結果をまたCaller側に返します。

それぞれの関数はJavascriptの[async/await](https://github.com/yortus/asyncawait#guide-to-asyncawait-v10)に沿って実装されており、
ネットワークの時差をあまり意識せずにプログラムがかけるようになっています。

## まとめ

+ SUGOSは遠隔呼び出しを実現するフレームワーク
+ あるクライアント側で宣言した関数を別のクライアントから呼べる
+ 呼び出し側のJavascript上では関数が動的に作られる
+ HTTPやWebSocketをほとんど意識なくて良い


## これも読みたい

+ 次回: [01 - Hello Worldしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/01%20-%20Hello%20World%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)


## リンク

+ [SUGOS](https://github.com/realglobe-Inc/sugos)
+ [SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub)
+ [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor)
+ [SUGO-Caller](https://github.com/realglobe-Inc/sugo-caller)
+ [Realglobe Inc](http://realglobe.jp/)
+ Tutorials
  + [00 - SUGOSことはじめ](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/00%20-%20SUGOS%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81.md)
  + [01 - Hello Worldしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/01%20-%20Hello%20World%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [02 - Event Emitしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/02%20-%20Event%20Emit%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [03 - Browser間でやり取りする](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/03%20-%20Browser%E9%96%93%E3%81%A7%E3%82%84%E3%82%8A%E5%8F%96%E3%82%8A%E3%81%99%E3%82%8B.md)
  + [04 - Moduleをnpmパッケージ化する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/04%20-%20Module%E3%82%92npm%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E5%8C%96%E3%81%99%E3%82%8B.md)
  + [05 - ActorやCallerを認証する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/05%20-%20Actor%E3%82%84Caller%E3%82%92%E8%AA%8D%E8%A8%BC%E3%81%99%E3%82%8B.md)
  + [06 - Observerを使ってみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/06%20-%20Observer%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [07 - Hubを冗長化する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/07%20-%20Hub%E3%82%92%E5%86%97%E9%95%B7%E5%8C%96%E3%81%99%E3%82%8B.md)
