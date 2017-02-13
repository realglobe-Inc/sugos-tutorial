sugos-tutorial
=============

[![Build Status][bd_travis_shield_url]][bd_travis_url]

[bd_travis_url]: http://travis-ci.org/realglobe-Inc/sugos-tutorial
[bd_travis_shield_url]: http://img.shields.io/travis/realglobe-Inc/sugos-tutorial.svg?style=flat
[bd_travis_com_url]: http://travis-ci.com/realglobe-Inc/sugos-tutorial
[bd_travis_com_shield_url]: https://api.travis-ci.com/realglobe-Inc/sugos-tutorial.svg?token=aeFzCpBZebyaRijpCFmm

Tutorial for SUGOS


日本語コンテンツ
---------

+ [00 - SUGOSことはじめ](dist/markdown/ja/00%20-%20SUGOS%E3%81%93%E3%81%A8%E3%81%AF%E3%81%98%E3%82%81.md)
+ [01 - Hello Worldしてみる](dist/markdown/ja/01%20-%20Hello%20World%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
+ [02 - Event Emitしてみる](dist/markdown/ja/02%20-%20Event%20Emit%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B.md)
+ [03 - Browser間でやり取りする](dist/markdown/ja/03%20-%20Browser%E9%96%93%E3%81%A7%E3%82%84%E3%82%8A%E5%8F%96%E3%82%8A%E3%81%99%E3%82%8B.md)
+ [04 - Moduleをnpmパッケージ化する](dist/markdown/ja/04%20-%20Module%E3%82%92npm%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E5%8C%96%E3%81%99%E3%82%8B.md)


English Contents
---------

+ [00 - Let us begin with SUGOS](dist/markdown/en/00%20-%20Let%20us%20begin%20with%20SUGOS.md)
+ [01 - Hello World, as always](dist/markdown/en/01%20-%20Hello%20World%2C%20as%20always.md)
+ [02 - Using Event Emit](dist/markdown/en/02%20-%20Using%20Event%20Emit.md)
+ [03 - Communication betweein Browsers](dist/markdown/en/03%20-%20Communication%20betweein%20Browsers.md)
+ [04 - Module as npm package](dist/markdown/en/04%20-%20Module%20as%20npm%20package.md)



Contributing
-----------

This project itself is a npm package.


To contributing, checkout this project to your local and install dependencies.

```bash
git clone git@github.com:realglobe-Inc/sugos-tutorial.git
cd sugos-tutorial
npm install
```

Then, edit articles under `src` directory and run

```bash
./ci/build.js
```

This will render articles into `dist` directory.


Links
-----------

+ [SUGOS](https://github.com/realglobe-Inc/sugos)