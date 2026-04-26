# bashでABC153 A~DとABC154 A~Cを解いた

ABC153 A-DとABC154 A-Cの計7問をbashで解きました。
パズルみたいで面白かったです。
解く中で得た知識を備忘録として残しておきます。

まず、bashの基本知識を説明します。

# bash基本知識

## 入力の受け取り方

入力は`read`コマンドで受け取れます。

```bash
read n   
read a b # スペース区切りの入力

declare -a arr=()
read arr # 配列で受け取る
```

一応、数列とかを配列で受け取ることもできます。
でも、入力を配列にパースする処理や`for`文が遅いのでそもそも配列を使わない方向で考えた方が良さそうです。

## 変数につける括弧
変数に代入したいときや変数を展開したいときによく使う3つの括弧を雑に説明します。

- `${}`
- `$()`
- `$(())`

### `${}`: 変数を展開する

変数展開です。付けなくてもいいけど全ての変数に付けた方が変数とただの文字の区別がつくので良いです。

```bash
if [ ${n} != ${m} ]; then
  echo "NO"
else
  echo "YES"
fi
```

### `$()`: `()`内でコマンドを実行した結果を値として得る

`()`で括ったコマンドはサブシェルで実行されます。

```bash
m=$(tr ' ' '\n' | LANG=C sort -u | wc -l | tr -d ' ')
```

### `$(())`: `(())`内で数値計算した結果を値として得る

`(( ))`内で数値計算できます。

```bash
echo $((1+1))                 # 2
echo $(($(sed -e 's/ /+/g'))) # 空白区切りの文字列の空白を+に置換して計算する
```

# 解いた問題たち

`${}`は付けた方がいいと言いましたが全然付けてません。（えー

## ABC153 A - Serval vs Monster
https://atcoder.jp/contests/abc153/tasks/abc153_a

さっきの`$(())`を使います。

```bash
read h a
echo $((($h+$a-1)/$a))
```

実は`(())`内では変数の`$`を省略できるので以下のコードでもいいです。

```bash
read h a
echo $(((h+a-1)/a))
```

## ABC153 B - Common Raccoon vs Monster

https://atcoder.jp/contests/abc153/tasks/abc153_b

`sed`でスペースを+に置き換えてます。
`sed`への渡し方ですが、変数なら`echo`、ファイルなら`cat`を使います。
今回は`echo`です。

```bash
read h n
read s
a=$(($(echo $s | sed -e 's/ /+/g')))
if [ $h -le $a ]; then
  echo Yes
else
  echo No
fi
```

## ABC153 C - Fennec vs Monster

https://atcoder.jp/contests/abc153/tasks/abc153_c

$H$を降順に並べて、$1$行目から$K$行目まで削除して、改行を+に置換した文字列を計算しています。

```bash
read n k
if [ $k = 0 ]; then
    echo $(($(sed -e 's/ /+/g')))
else
    echo $(($(tr ' ' $'\n' | LANG=C sort -rn | sed -e '1,'${k}'d' | tr $'\n' '+')0))
fi
```

`sort`するためには空白区切りの文字列を改行区切りにしておく必要があります。この置換は`tr`コマンドでやりました。`sort`に`-n`を付けると数値としてソートしてくれます。これを忘れてWAった。
`LANG=C`は`sort`が速くなるおまじないです。

`sed`の条件内で変数を使う時は、シングルクオーテーションで囲みます。

## ABC153 D - Caracal vs Monster
https://atcoder.jp/contests/abc153/tasks/abc153_d

`for`文の`(())`内は`$`を省略した変数を使っています。

```bash
read h
n=0
while [ $h -gt 0 ]; do
  h=$(($h / 2))
  n=$(($n + 1))
done
ans=0
for((i=0;i<n;i++));do
  ans=$((ans + 2 ** i))
done
echo $ans
```

答えが全てのbitに1がたった数になることに気づければ、以下のコードでもいいです。

```bash
read h
n=0
while [ $h -gt 0 ]; do
  h=$(($h / 2))
  n=$(($n + 1))
done
echo $((2 ** n - 1))
```

## ABC154 A - Remaining Balls

https://atcoder.jp/contests/abc154/tasks/abc154_a

```bash
read s t
read a b
read u
if [ $s = $u ]; then
  echo "$(($a-1)) $b"
else
  echo "$a $((b-1))"
fi
```

## ABC154 B - I miss you...
https://atcoder.jp/contests/abc154/tasks/abc154_b

```bash
sed -e 's/./x/g'
```

入力は標準入力から来るので別に変数に代入しなくてもいいのです。

## ABC154 C - Distinct or Not

https://atcoder.jp/contests/abc154/tasks/abc154_c

```bash
read n
declare -a a=()
read a
m=$(echo ${a[@]} | tr ' ' '\n' | sort | uniq | wc -l | tr -d ' ')
if [ $n != $m ]; then
  echo "NO"
else
  echo "YES"
fi
```

[submission: 1030ms](https://atcoder.jp/contests/abc154/submissions/10062829)

あ、冒頭で配列を受け取ると遅いと言いましたね。
実際そのようで、配列を介さないようにしたら1030ms -> 710msになりました。
しれっと`sort | uniq`が`sort -u`になっていますがあまり速さには関係ありませんでした。

```bash
read n
m=$(tr ' ' '\n' | LANG=C sort -u | wc -l | tr -d ' ')
if [ $n != $m ]; then
  echo "NO"
else
  echo "YES"
fi
```

[submission: 710ms](https://atcoder.jp/contests/abc154/submissions/10062916)

# 最後に
bashって今後も廃れない言語だと思うので、鍛えておくと得しそうです。

# 参考

http://fj.hatenablog.jp/entry/2016/03/06/170907
