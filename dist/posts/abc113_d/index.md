# ABC113 D - Number of Amidakuji (400点)

優秀なフレンズの助言をもらいながらACできたので、忘れないうちに記事にします。

# 問題

https://atcoder.jp/contests/abc113/tasks/abc113_d

> **概要**(適当なのでちゃんと公式の問題文を読んでね)  
縦棒の長さ$H$と本数$W$が与えられる。縦棒の間に好きに横線を引いて、あみだくじを作る。$1$番目の棒の上端から, 横線があれば必ずそれを通るというルールで下へたどったときに、最終的にたどり着く縦棒の番号が$K$となるような「正しいあみだくじ」の本数を$1000000007$で割った余りを求めなさい。  
**制約**  
・$1 \leq H \leq 100$  
・$1 \leq W \leq 8$  
・$1 \leq K \leq W$

# 考察
考えの流れ
- ある高さにおける横線の引き方は高々$2^{(8-1)}$通り
- ある高さ$h$の$w$本目に至るのが何通りかわかっていたら$h+1$についても計算できるんじゃないか
  - 各高さについて分割して考えられそう
- ある高さ$h$の$w$本目に至る状態をまとめて扱えそう
- DPかな
- 計算量を見積もる。ある高さにおいて、全ての横線の引き方である$2^{(8-1)}$通りの状態を考え、それぞれがあみだくじの要件を満たしているかを計$W$本について調べる。これを全ての高さ($\leq 100$)について行うので、$O(2^7 \times 8 \times 100 = 2^{10} \times 100 \simeq 10^5)$で間に合いそう

上記のような考察でDPっぽいことがわかったので、状態と遷移を考えます。
$dp[h][w]$を、高さ$h$の$w$番目(0-indexed)に至るのに何通りあるか、と定めます。

遷移を考えます。
今、高さ$h$、$w$番目の横線にいるとします。ここに至るまでに$dp[h][w]$通り存在します。

![abc113_d_1](//images.ctfassets.net/57a83iqiwfit/6AmJkMBcMa5UdEt7RsS90S/18d367cd471ef33dd1d62008246f9dc1/1.png)

$w+1$に向かう横線があれば、$w+1$番目の横線に移動して次の高さに進みます。$dp[h+1][w+1] += dp[h][w]$

![abc113_d_2](//images.ctfassets.net/57a83iqiwfit/3xqwgFCIiauCIcAELHld75/910452d6b74b90f2e80214f1e9c18703/2.png)

$w-1$に向かう横線があれば、$w-1$番目の横線に移動して次の高さに進みます。$dp[h+1][w-1] += dp[h][w]$

![abc113_d_3](//images.ctfassets.net/57a83iqiwfit/2JABYZa1ARzbhlS2Pn5OC1/3aef42ed928ff66b11feecfb9e8dd430/3.png)

両隣に横線がなかったら、同じ$w$番目のまま次の高さに進みます。
$dp[h+1][w] += dp[h][w]$

![abc113_d_4](//images.ctfassets.net/57a83iqiwfit/5w4BR9vIutPrTz9nCXbqB9/22d55a7f930e8c3b091b582437a17cbe/4.png)

ちなみに、両隣に横線があることはありません。正しくないあみだくじだからです。そのような正しくないあみだくじは予め弾いておきます。

初期条件は$dp[0][0]=1$です。高さ$0$、すなわち、まだどの高さにも移動してないとき、$0$番目の横棒にいるのは$1$通りだからです。

```ruby {} showLineNumbers
H, W, K = gets.split.map(&:to_i)
MOD = 10 ** 9 + 7
dp = Array.new(H + 1) { Array.new(W, 0) }
dp[0][0] = 1
H.times do |h|
  # ある高さにおいて、2^(W-1)通りの横線の引き方がある
  (0...(1 << (W - 1))).each do |bit|
    # check
    # 正しくないあみだくじを弾く
    # 1が連続して2つあったらアウト
    flag = false
    (1...W).each do |i|
      if bit[i] == 1 && bit[i - 1] == 1
        flag = true
      end
    end
    next if flag
    # transition
    # 横線をそれぞれ調べて遷移
    W.times do |w|
      if w != W - 1 && bit[w] == 1
        target = w + 1
      elsif w != 0 && bit[w - 1] == 1
        target = w - 1
      else
        target = w
      end
      dp[h + 1][target] = (dp[h + 1][target] + dp[h][w]) % MOD
    end
  end
end
puts dp[H][K - 1]
```

[submission](https://atcoder.jp/contests/abc113/submissions/6530229)

# 学び
DPを使うところまで漕ぎ着ければ、DPに慣れてる人なら解けそう。
DPに至る思考として
- 分割して解けないか
- まとめて扱えないか

みたいなのがありそう。

DPの状態と遷移自体はシンプルなので教育的なDP問題だと思う。
