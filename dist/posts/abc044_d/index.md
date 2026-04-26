# ABC044 D - 桁和 / Digit Sum (500点)

# 問題

https://atcoder.jp/contests/abc044/tasks/arc060_b

# 考察
$n$,$s$に対して以下の変形ができます。

$n = a_0b^0 + a_1b^1 + ... + a_mb^m$

$s = a_0 + a_1 + ... + a_m$

$b$が大きくなるほど$m$は小さくなります。
なぜなら$m$は$n$を$b$で何回割れるかみたいなことを表す値だからです。

$m = floor(\log_b n)$

$b$と$m$の関係を追ってみます。

- $b \leq \sqrt{n}$のとき、$m \geq 2$
- $b > \sqrt{n}$のとき、$m < 2$

$2 \leq b \leq \sqrt{n}$のとき、$O(\sqrt{n})$で$b$を全探索すれば良いです。

以降、$b > \sqrt{n}$の場合を考えます。このとき、

$$
\begin{array}{c}

n = a_0 + a_1b \, ...(1)\\

s = a_0 + a_1  \, ...(2)

\end{array}
$$

とかけます。$(1)$式から、$n = a_0 + a_1b \geq a_1b > a_1 \sqrt{n}$より、$\sqrt{n} > a_1$を得ます。

また、$(1, 2)$式から、$b = (n - s) / a_1 + 1$です。

よって、$\sqrt{n} > a_1 \geq 1$となる$a_1$を全探索すれば$b$が求まります。

ちなみに、$s > n$を満たす$b$は無く、$s = n$を満たす$b$は$n+1$です。

[submission(Ruby)](https://atcoder.jp/contests/abc044/submissions/8314781)

# 学び
割り算が出たら$\sqrt{n}$を考えるというのは典型っぽい？
今回の場合だと$b$を$\sqrt{n}$で場合分けすることによって探索が$O(\sqrt{n})$でできるようになりました。頭いい。

# 参考
1. [editorial.pdf](http://arc060.contest.atcoder.jp/data/arc/060/editorial.pdf)
1. [ARC060_D - 桁和 / Digit Sum - seica_atの日記](http://seica-at.hatenablog.com/entry/2017/12/29/132244)
