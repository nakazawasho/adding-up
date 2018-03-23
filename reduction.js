'use strict';
// Node.js に用意されたモジュールを呼び出している
// fs は、FileSystem の略で、ファイルを扱うためのモジュール
const fs = require('fs');
const readline = require('readline');

// popu-pref.csv ファイルから、ファイルを読み込みを行う Stream を生成し、さらにそれを readline オブジェクトの input として設定し、 rl オブジェクトを作成している
const rs = fs.ReadStream('./popu-pref.csv');
const rl = readline.createInterface({'input': rs, 'output': {}});
// key: 都道府県 value: 集計データのオブジェクト
const map = new Map();
// rl オブジェクトで line というイベントが発生したらこの無名関数を呼んでください、という意味
// line イベントが発生したタイミングで、コンソールに引数 lineString の内容が出力されることになる
rl.on('line', (lineString) => {
    // 引数 lineString で与えられた文字列をカンマ , で分割して、それを columns という配列に
    const columns = lineString.split(',');
    // parseInt() は、文字列を整数値に変換する関数
    const year = parseInt(columns[0]);
    const prefecture = columns[2];
    const popu = parseInt(columns[7]);
    if (year === 2010 || year === 2015){
        // このコードは連想配列 map からデータを取得している。
// value の値が Falsy の場合に、value に初期値となるオブジェクトを代入する。
// その県のデータを処理するのが初めてであれば、value の値は undefined になるので、この条件を満たし、value に値が代入される
        let value = map.get(prefecture);
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 += popu;
        }
        if (year === 2015) {
            value.popu15 += popu;
        }
        map.set(prefecture, value);
    }
});
rl.resume();
rl.on('close', () => {
    // for-of 構文
    //Map や Array の中身を of の前に与えられた変数に代入して for ループと同じことができる
    for (let pair of map) {
        const value = pair[1];
        value.change = value.popu15 / value.popu10;
    }
    // 連想配列を普通の配列に変換する処理
//      Array の sort 関数を呼んで無名関数を渡しています。
// sort に対して渡すこの関数は比較関数と言い、これによって並び替えをするルールを決めることができます。
//
// 比較関数は 2 つの引数を受けとって、
// 前者の引数 pair1 を 後者の引数 pair2 より前にしたいときは、負の整数、
// pair2 を pair1 より前にしたいときは、正の整数、
// pair1 と pair2 の並びをそのままにしたいときは、 0 を返す必要があります。
// ここでは変化率の降順に並び替えを行いたいので、 pair2 が pair1 より大きかった場合、pair2 を pair1 より前にする必要があります。
//
// つまり、pair2 が pair1 より大きいときに正の整数を返すような処理を書けば良いので、ここではpair2 の変化率のプロパティから pair1 の変化率のプロパティを引き算した値を返しています。これにより、変化率の降順に並び替えが行われます。
    const rankingArray = Array.from(map).sort((pair1, pair2) => {
        return pair1[1].change - pair2[1].change;
    });
    // map 関数は、 Array の要素それぞれを、与えられた関数を適用した内容に変換するというものです。
    const rankingStrings = rankingArray.map((pair, i) => {
        return '第'+ i + '位' + pair[0] + ': ' + pair[1].popu10 + '=>' + pair[1].popu15 + ' 変化率:' + pair[1].change;
    });
    console.log(rankingStrings);
});

// Array.from( ) メソッドを用いれば、配列に似た型のもの（ここでは Map ）を普通の配列に変換することができます。
//
// map は 次のようなデータを格納する目的で作成された連想配列です。
//
//
// const map = new Map(); // key: 都道府県 value: 集計データのオブジェクト
//
//
// 各都道府県名のkey と 各集計データオブジェクトのvalue の対といえます。
//
// この連想配列 map を引数に、Array.from(map) を呼び出すと、 key と value の対を配列とし、その配列を要素とした配列（ペア配列の配列）に変換されます。
//

