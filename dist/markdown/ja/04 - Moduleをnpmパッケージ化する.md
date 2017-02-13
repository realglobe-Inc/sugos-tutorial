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
- [事前準備](#%E4%BA%8B%E5%89%8D%E6%BA%96%E5%82%99)
- [実装してみる](#%E5%AE%9F%E8%A3%85%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B)
  * [雛形の作成](#%E9%9B%9B%E5%BD%A2%E3%81%AE%E4%BD%9C%E6%88%90)
  * [Moduleの実装](#module%E3%81%AE%E5%AE%9F%E8%A3%85)
  * [Moduleのテスト](#module%E3%81%AE%E3%83%86%E3%82%B9%E3%83%88)
- [まとめ](#%E3%81%BE%E3%81%A8%E3%82%81)
- [おまけ](#%E3%81%8A%E3%81%BE%E3%81%91)
  * [雑談: Javascriptの関数でキーワード引数みたいなことをしてみる](#%E9%9B%91%E8%AB%87-javascript%E3%81%AE%E9%96%A2%E6%95%B0%E3%81%A7%E3%82%AD%E3%83%BC%E3%83%AF%E3%83%BC%E3%83%89%E5%BC%95%E6%95%B0%E3%81%BF%E3%81%9F%E3%81%84%E3%81%AA%E3%81%93%E3%81%A8%E3%82%92%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B)
- [これも読みたい](#%E3%81%93%E3%82%8C%E3%82%82%E8%AA%AD%E3%81%BF%E3%81%9F%E3%81%84)
- [リンク](#%E3%83%AA%E3%83%B3%E3%82%AF)


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

すでに二つのメソッドが実装されていますね。

生存確認用の`.ping()`メソッドと、稼働環境の確認用の`.assert()`メソッドです。

`npm test`を実行すると、実際にこれらのメソッドを動かすことができます。

また、最後の部分には
`get $spec () { /* ... */ }`
というgetterが定義されており、そこにこのモジュールの情報が描写されています。
これは任意の付加情報であり、実は書かなくても動くのですが、単体パッケージにするようなModuleの場合はきちんと書くことが推奨されます。


さて、ここにKeyValueStoreっぽいメソッドを追加していきましょう。

```javascript
/** ... */
'use strict'

const { Module } = require('sugo-module-base')
const { name, version, description } = require('../package.json')

const co = require('co')
const fs = require('fs')
const { hasBin } = require('sg-check')
const debug = require('debug')('sugo:module:demo-module')

/** @lends KeyValueStore */
class KeyValueStore extends Module {

  // Add "filename" parameter on constructor

  constructor (config = {}) {
    let { filename = 'kv.json' } = config
    debug('Config: ', config)
    super(config)
    const s = this
    s.filename = filename
  }

  /** ... */
  ping (pong = 'pong') { /* ... */ }

  /** ... */
  assert () { /* ... */ }

  // Define methods for Key-vale store

  set (key, value) {
    const s = this
    return co(function * () {
      let data = yield s._read().catch(() => ({}))
      data[ key ] = value
      return yield s._write(data)
    })
  }

  get (key) {
    const s = this
    return co(function * () {
      let data = yield s._read()
      return data[ key ]
    })
  }

  del (key) {
    const s = this
    return co(function * () {
      let data = yield s._read()
      delete data[ key ]
      return yield s._write(data)
    })
  }

  // Private function to read data file
  // Methods with "_" is not exposed to remote caller
  _read () {
    let { filename } = this
    return new Promise((resolve, reject) =>
      fs.readFile((filename), (err, content) => err ? reject(err) : resolve(content))
    ).then(JSON.parse)
  }

  // Private function to write data file
  // Methods with "_" is not exposed to remote caller
  _write (data) {
    let { filename } = this
    return new Promise((resolve, reject) =>
      fs.writeFile(filename, JSON.stringify(data), (err) => err ? reject(err) : resolve())
    )
  }

  /** ... */
  get $spec () { /* ... */ }
}

module.exports = KeyValueStore

```

まずはconstructorの引数に`filename`を追加しました。keyValueのデータを保存する先です。

次にファイルアクセス用の`._read()`と`._write(data)`メソッドを用意します。
アンダースコアで始まる名前はプライベートとして扱われ、 Actorに渡してもCallerには共有されません。
ここではconstructorで渡されたファイルにJSONとしての読み書きをし、Promiseインターフェイスを提供するようなものにします。

そして、それらを利用する`.set(key, value)`、`.get(key)`、`.del(key)`を実装すれば、単純なKeyValueStoreの完成です。


実装したら忘れずに`$spec`も記述しましょう

```javascript
/** ... */
'use strict'

const { Module } = require('sugo-module-base')
const { name, version, description } = require('../package.json')

const co = require('co')
const fs = require('fs')
const { hasBin } = require('sg-check')
const debug = require('debug')('sugo:module:demo-module')

/** @lends KeyValueStore */
class KeyValueStore extends Module {
  constructor (config = {}) { /* ... */ }

  /** ... */
  ping (pong = 'pong') { /* ... */ }

  /** ... */
  assert () { /* ... */ }

  set (key, value) { /* ... */ }

  get (key) { /* ... */ }

  del (key) { /* ... */ }

  // Private function to read data file
  // Methods with "_" is not exposed to remote caller
  _read () { /* ... */ }

  // Private function to write data file
  // Methods with "_" is not exposed to remote caller
  _write (data) { /* ... */ }

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
        ping: { /* ... */ },

        assert: { /* ... */ },

        set: {
          desc: 'Set key value',
          params: [
            { name: 'key', type: 'string', desc: 'Key to set' },
            { name: 'value', type: 'string', desc: 'value to set' }
          ]
        },

        get: {
          desc: 'Get by key ',
          params: [
            { name: 'key', type: 'string', desc: 'Key to set' }
          ],
          return: { type: 'string', desc: 'Found value' }
        },

        del: {
          desc: 'Delete by key ',
          params: [
            { name: 'key', type: 'string', desc: 'Key to set' }
          ]
        }
      },
      events: null
    }
  }
}

module.exports = KeyValueStore

```


### Moduleのテスト

次にテストを追加します。自動生成された"test/key_value_store_test.js"にはすでに幾つかのテストが書かれています。

```javascript
/**
 * Test case for demoModule.
 * Runs with mocha.
 */
'use strict'

const KeyValueStore = require('../lib/key_value_store.js')
const assert = require('assert')
const co = require('co')
const { EventEmitter } = require('events')
const sgSchemas = require('sg-schemas')
const sgValidator = require('sg-validator')

describe('demo-module', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Get module spec', () => co(function * () {
    let module = new KeyValueStore({ $emitter: new EventEmitter() })
    assert.ok(module)

    let { $spec } = module
    let specError = sgValidator(sgSchemas.moduleSpec).validate($spec)
    assert.ok(!specError)
  }))

  it('Try ping-pong', () => co(function * () {
    let module = new KeyValueStore({ $emitter: new EventEmitter() })
    let pong = yield module.ping('pong')
    assert.equal(pong, 'pong')
  }))

  it('Do assert', () => co(function * () {
    let module = new KeyValueStore({ $emitter: new EventEmitter() })
    let caught
    try {
      yield module.assert({})
    } catch (err) {
      caught = err
    }
    assert.ok(!caught)
  }))

  it('Compare methods with spec', () => co(function * () {
    let module = new KeyValueStore({ $emitter: new EventEmitter() })
    let { $spec } = module
    let implemented = Object.getOwnPropertyNames(KeyValueStore.prototype)
      .filter((name) => !/^[\$_]/.test(name))
      .filter((name) => !~[ 'constructor' ].indexOf(name))
    let described = Object.keys($spec.methods).filter((name) => !/^[\$_]/.test(name))
    for (let name of implemented) {
      assert.ok(!!~described.indexOf(name), `${name} method should be described in spec`)
    }
    for (let name of described) {
      assert.ok(!!~implemented.indexOf(name), `${name} method should be implemented`)
    }
  }))
})

/* global describe, before, after, it */

```

ここに作成した機能に関するテストを追加します。

```javascript
/**
 * Test case for demoModule.
 * Runs with mocha.
 */
'use strict'

const KeyValueStore = require('../lib/key_value_store.js')
const assert = require('assert')
const co = require('co')
const { EventEmitter } = require('events')
const sgSchemas = require('sg-schemas')
const sgValidator = require('sg-validator')

describe('demo-module', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Get module spec', () => co(function * () { /* ... */ }))

  it('Try ping-pong', () => co(function * () { /* ... */ }))

  it('Do assert', () => co(function * () { /* ... */ }))

  it('Compare methods with spec', () => co(function * () { /* ... */ }))

  it('Do get/set/del', () => co(function * () {
    let module = new KeyValueStore({
      filename: `${__dirname}/../testing-store.json`,
      $emitter: new EventEmitter()
    })
    yield module.set('foo', 'This is foo')
    {
      let foo = yield module.get('foo')
      assert.equal(foo, 'This is foo')
    }
    yield module.del('foo')
    {
      let foo = yield module.get('foo')
      assert.equal(foo, undefined)
    }
  }))
})

/* global describe, before, after, it */

  ```


```bash
npm test
```

で無事テストが通れば成功です。

あとは`npm publish`すればnpmレジストリに登録されます。

そしたら他のプロジェクトから以下のように使えるようになります

```javascript
#!/usr/bin/env node

/**
 * Example usage to register module on actor
 * @see https://github.com/realglobe-Inc/sugo-actor
 */
'use strict'

const { KeyValueStore } = require('sugos-tutorial-04')
const sugoActor = require('sugo-actor')
const co = require('co')

co(function * () {
  let actor = sugoActor('http://my-sugo-cloud.example.com/actors', {
    key: 'my-actor-01',
    modules: {
      // Register the module
      kvs: new KeyValueStore({
        filename: 'kv.json'
      })
    }
  })
  yield actor.connect()
}).catch((err) => console.error(err))

```


## まとめ

+ [sugo-scaffold](https://github.com/realglobe-Inc/sugo-scaffold)で雛形が生成できる
+ `$spec`でModule自身を描写できる
+ アンダースコアで始まるメソッドはプライベート扱いになり、Callerには共有されない
+ ActorやHubがなくてもテストできる

なお、今回出てきたSnippetは、[こちら](https://github.com/realglobe-Inc/sugos-tutorial/tree/master/example/tutorial-04)からも入手できます

## おまけ

### 雑談: Javascriptの関数でキーワード引数みたいなことをしてみる

例えばPythonだと[Keyword Arguments](https://docs.python.org/3/tutorial/controlflow.html#keyword-arguments)なる仕様があって、
引数の多い関数をうまく記述できるようになっているのです。

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
+ 次回: [05 - ActorやCallerを認証する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/05%20-%20Actor%E3%82%84Caller%E3%82%92%E8%AA%8D%E8%A8%BC%E3%81%99%E3%82%8B.md)

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
