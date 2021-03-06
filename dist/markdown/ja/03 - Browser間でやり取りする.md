# 【SUGOSチュートリアル】 03 - Browser間でやり取りする

[前回のチュートリアル](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/02%20-%20Event%20Emit%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)では、Caller/Actorのやり取りをNode.js上で行ないました。

今回はブラウザ間での呼び出しを実装してみます。Actorが動いているブラウザをCallerが動いているブラウザから操るサンプルです。
一方のウィンドウでテキストボックスにHTML文字列を打ち込むと、別のウィンドウにリアルタイムでレンダリングされて表示される、というものを作ります。


<a href="https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/03%20-%20Browser%E9%96%93%E3%81%A7%E3%82%84%E3%82%8A%E5%8F%96%E3%82%8A%E3%81%99%E3%82%8B.md">
  <img src="../../images/eyecatch-browser.png"
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
  * [Buildする](#build%E3%81%99%E3%82%8B)
  * [ブラウザから確認する](#%E3%83%96%E3%83%A9%E3%82%A6%E3%82%B6%E3%81%8B%E3%82%89%E7%A2%BA%E8%AA%8D%E3%81%99%E3%82%8B)
- [まとめ](#%E3%81%BE%E3%81%A8%E3%82%81)
- [おまけ](#%E3%81%8A%E3%81%BE%E3%81%91)
  * [雑談: SUGOSにおけるCallbackサポートを諦めた理由](#%E9%9B%91%E8%AB%87-sugos%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8Bcallback%E3%82%B5%E3%83%9D%E3%83%BC%E3%83%88%E3%82%92%E8%AB%A6%E3%82%81%E3%81%9F%E7%90%86%E7%94%B1)
- [これも読みたい](#%E3%81%93%E3%82%8C%E3%82%82%E8%AA%AD%E3%81%BF%E3%81%9F%E3%81%84)
- [リンク](#%E3%83%AA%E3%83%B3%E3%82%AF)


## 実装してみる

### プロジェクトの用意

前回と同様に、まずはプロジェクトディレクトリを用意します。

```bash
mkdir sugos-tutorial-03
cd sugos-tutorial-03
npm init -y

```

次に、必要なパッケージをインストールします。

今回はUIを作成するので、SUGOSに加え、

+ [React.js](https://facebook.github.io/react/)
+ [Babel](https://babeljs.io/docs/setup/)
+ [Browserify](https://github.com/substack/node-browserify)

等を利用します。

```bash
# Install dependencies
npm install -S sugo-actor sugo-caller sugo-hub co asleep react react-dom babel-polyfill
# Install dev dependencies
npm install -D browserify browserify-incremental xtend babelify babel-preset-es2015 babel-preset-react
```

### Hubサーバを立てる

Hubサーバは前回とほぼ同様ですが、新たに`static`オプションを追加します。
ここにディレクトリ名を指定することで、静的ファイルの配布が可能になります。

**hub.js**
```javascript
#!/usr/bin/env node

'use strict'

const sugoHub = require('sugo-hub')
const co = require('co')

co(function * () {
  let hub = sugoHub({
    /** Directory name for static files */
    static: [ 'public' ]
  })
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

### Actorを用意する

Actor側のブラウザ用スクリプトを用意します。
`componentDidMount`のタイミングでActorのインスタンスを作成し、その中で`dynamicHTML`という名前でモジュールを宣言しています。
このモジュールはComponentのstateにアクセスすることで、動的にHTMLを書き換える機能を持ちます。

**public/actor.jsx**
```jsx
/**
 * Sample JSX script for actor
 */
'use strict'

import 'babel-polyfill'
import sugoActor, {Module} from 'sugo-actor'
import React, {PropTypes as types} from 'react'
import ReactDOM from 'react-dom'

const ActorWorkspace = React.createClass({
  propTypes: {
    /** Key for actor */
    actorKey: types.string
  },

  getInitialState () {
    return {
      html: `
<h3>This is <b>sample</b> dynamic html</h3>
<p>You can edit the contents from <a href="./caller.html">Caller page</a></p>
`
    }
  },

  render () {
    const s = this
    let { state } = s
    return (
      <div className='actor-workspace'>
        <div dangerouslySetInnerHTML={ { __html: state.html } }></div>
      </div>
    )
  },

  componentDidMount () {
    const s = this
    let { actorKey } = s.props
    let actor = sugoActor({
      key: actorKey,
      modules: {
        // Define a module to handle HTML
        dynamicHTML: new Module({
          // Read HTML string
          read () {
            return s.state.html
          },
          // Write HTML string
          write (html) {
            s.setState({ html })
          }
        })
      }
    })
    actor.connect()
    s.actor = actor
  },

  componentWillUnmount () {
    const s = this
    let { actor } = s
    actor.disconnect()
  }

})

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <ActorWorkspace actorKey='my-actor-01'/>,
    document.getElementById('actor-mount-root')
  )
})

```

今回はHub自身がHTMLの配布するので、Actorの宣言時に`host`などの設定は不要です 。
`location`オブジェクトの情報から自動的に接続先を見つけます。

次に、このスクリプトを走らせるためのHTMLを用意します。

**public/actor.html**
```html
<!DOCTYPE html>
<html>
<head>
  <title>[Tutorial-03] Actor Page</title>
  <meta name="viewport" content="width=device-width">
  <script src="./actor.js"></script>
  <style>
    body {
      color: #555;
      font-family: monospace;
      padding: 50px;
    }

    h1 {
      padding: 4px;
      border-bottom: 2px solid #DEC010;
      color: #5a4e07;
      margin: 0 0 16px;
    }

    a {
      color: #DEC010;
    }

    .container {
      max-width: 1024px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
<header>
  <div class="container">
    <h1>[Tutorial-03] Actor Page</h1>
  </div>
</header>
<main>
  <div class="container">
    <div id="actor-mount-root"><!-- Mount root for react --></div>
  </div>
</main>
</body>
</html>
```


### Callerを用意する

Caller側のブラウザ用スクリプトを用意します。

テキストボックスに入力が変更されたらその内容を、先程Actorで宣言した`dynamicHTML`の`.write()`メソッドに渡します。
これにより、編集内容をリアルタイムに反映するということが実現します。


**public/caller.jsx**
```jsx
/**
 * Sample JSX script for caller
 */
'use strict'

import 'babel-polyfill'
import sugoCaller, {Module} from 'sugo-caller'
import React, {PropTypes as types} from 'react'
import co from 'co'
import ReactDOM from 'react-dom'

const CallerWorkspace = React.createClass({
  propTypes: {
    /** Key for caller */
    actorKey: types.string
  },

  getInitialState () {
    return {
      html: ''
    }
  },

  render () {
    const s = this
    let { state } = s
    return (
      <div className='caller-workspace'>
        <textarea name="html"
                  placeholder="HTML to Write"
                  value={ state.html }
                  onChange={ (e) => s.updateHTML(e.target.value) }
        ></textarea>
        <fieldset>
          <legend>Preview</legend>
          <div dangerouslySetInnerHTML={ { __html: state.html } }></div>
        </fieldset>
      </div>
    )
  },

  componentDidMount () {
    const s = this
    let { actorKey } = s.props

    co(function * () {
      let caller = sugoCaller({})
      // Access to actor
      let actor = yield caller.connect(actorKey).catch((err) => {
        alert(`Failed to connect actor: ${actorKey}`)
      })
      // Get dynamic html module
      let dynamicHTML = actor.get('dynamicHTML')
      s.caller = caller
      s.dynamicHTML = dynamicHTML

      let html = yield dynamicHTML.read()
      s.setState({ html })
      s.forceUpdate()
    }).catch((err) => console.error(err))
  },

  componentWillUnmount () {
    const s = this
    let { caller } = s
    caller.disconnect()
  },

  updateHTML (html) {
    const s = this
    s.setState({ html })
    // Apply HTML to remote
    s.dynamicHTML.write(html)
    console.log('html', html)
  }

})

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <CallerWorkspace actorKey='my-actor-01'/>,
    document.getElementById('caller-mount-root')
  )
})

```

こちらもHTMLを用意します。

**public/caller.html**
```html
<!DOCTYPE html>
<html>
<head>
  <title>[Tutorial-03] Caller Page</title>
  <meta name="viewport" content="width=device-width">
  <script src="./caller.js"></script>
  <style>
    html {
      background: #DEC010;
    }

    body {
      color: #555;
      font-family: monospace;
      padding: 50px;
    }

    h1 {
      padding: 4px;
      border-bottom: 2px solid #DEC010;
      color: #5a4e07;
      margin: 0 0 16px;
    }

    a {
      color: #DEC010;
    }

    .container {
      max-width: 1024px;
      margin: 0 auto;
    }

    textarea {
      width: 100%;
      min-height: 94px;
      box-sizing: border-box;
      outline-color: #DEC010;
    }

    fieldset {
      background: white;
    }
  </style>
</head>
<body>
<header>
  <div class="container">
    <h1>[Tutorial-03] Caller Page</h1>
  </div>
</header>
<main>
  <div class="container">
    <div id="caller-mount-root"><!-- Mount root for react --></div>
  </div>
</main>
</body>
</html>
```


### Buildする

用意したJSXファイルはそのままではブラウザで実行できません。BabelとBrowserifyを使ってコンパイル・バンドルします。


**build.js**
```js
#!/usr/bin/env node

/**
 * Build script
 */
'use strict'

const fs = require('fs')
const co = require('co')
const browserify = require('browserify')
const browserifyInc = require('browserify-incremental')
const xtend = require('xtend')

function bundle (src, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Bundling ${src}...`)
    let b = browserify(src, xtend(browserifyInc.args, {
      // your custom opts
    })).transform('babelify', {
      babelrc: false,
      presets: [ 'es2015', 'react' ]
    })

    browserifyInc(b, { cacheFile: './tmp/browserify-cache.json' })

    b
      .bundle()
      .pipe(fs.createWriteStream(dest))
      .on('error', (err) => {
        console.error(err)
        reject(err)
      })
      .on('close', () => {
        console.log(`File bundled: ${dest}`)
        resolve()
      })
  })
}

co(function * () {
  yield bundle('public/actor.jsx', 'public/actor.js')
  yield bundle('public/caller.jsx', 'public/caller.js')
})


```


```bash
node ./build.js
```

### ブラウザから確認する

Hubが起動している状態で、Actor側HTMLをブラウザから開きます。

[http://localhost:3000/actor.html](http://localhost:3000/actor.html)


続いて、Caller側HTMLをブラウザの別タブで開きます。

[http://localhost:3000/caller.html](http://localhost:3000/caller.html)

Caller側のテキストエリアを編集すると、Actorブラウザにリアルタイムで反映されていることが確認できたら成功です。


<img src="../../images/tutorial-browser.png"/>


## まとめ

+ CallerとActorはBrowser上で動かせる
+ Hubの`static`オプションで静的ファイルの配布ができる
+ ブラウザ上の場合、CallerやActorの宣言時にHostを省略すると、`location`オブジェクトから自動的に解釈する

なお、今回出てきたSnippetは、[こちら](https://github.com/realglobe-Inc/sugos-tutorial/tree/master/example/tutorial-03)からも入手できます

## おまけ

### 雑談: SUGOSにおけるCallbackサポートを諦めた理由

SUGOSを使うと他のクライアント(Actor)で宣言した関数がいきなり使える！のですが現状は制限があります。

Callbackが渡せないのです。`doSomething(() => console.log('done'!))`のような書き方ができません。

理由は、それを実現する術が見つけられなかったため。
引数として関数を渡すこと自体は擬似的に実現可能なのですが、その後、参照を解放する方法が発見できませんでした。
呼び出し側（Caller)でのメモリリークを防ぐために、用済みなったCallbackは適切に処分する必要があります。
しかしES2015時点のJavaScriptでは、Weak参照やポインタ数の取得といった機能が提供されておらず、
Actor側で用済みになったかどうかをCallerから判定する術がありません。

そのため、2016年現在、SUGOSではPromiseベースでのやり取りを必須としています。無念。。。


## これも読みたい

+ 前回: [02 - Event Emitしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/02%20-%20Event%20Emit%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
+ 次回: [04 - Moduleをnpmパッケージ化する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/04%20-%20Module%E3%82%92npm%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E5%8C%96%E3%81%99%E3%82%8B.md)

## リンク

+ [SUGOS](https://github.com/realglobe-Inc/sugos)
+ [SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub)
+ [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor)
+ [SUGO-Caller](https://github.com/realglobe-Inc/sugo-caller)
+ [React](https://facebook.github.io/react/)
+ [Babel](https://babeljs.io/docs/setup/)
+ [Browserify](https://github.com/substack/node-browserify)
+ Tutorials
  + [00 - SUGOSことはじめ](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/00%20-%20SUGOS%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81.md)
  + [01 - Hello Worldしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/01%20-%20Hello%20World%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [02 - Event Emitしてみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/02%20-%20Event%20Emit%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [03 - Browser間でやり取りする](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/03%20-%20Browser%E9%96%93%E3%81%A7%E3%82%84%E3%82%8A%E5%8F%96%E3%82%8A%E3%81%99%E3%82%8B.md)
  + [04 - Moduleをnpmパッケージ化する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/04%20-%20Module%E3%82%92npm%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E5%8C%96%E3%81%99%E3%82%8B.md)
  + [05 - ActorやCallerを認証する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/05%20-%20Actor%E3%82%84Caller%E3%82%92%E8%AA%8D%E8%A8%BC%E3%81%99%E3%82%8B.md)
  + [06 - Observerを使ってみる](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/06%20-%20Observer%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%8B.md)
  + [07 - Hubを冗長化する](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/ja/07%20-%20Hub%E3%82%92%E5%86%97%E9%95%B7%E5%8C%96%E3%81%99%E3%82%8B.md)
