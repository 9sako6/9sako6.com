# yukicoder No.909 たぴの配置 (★2)

# 問題

https://yukicoder.me/problems/no/909

# 考察

求める最大距離は$d = \min_{1 \leq i \leq N}(X_i + Y_i)$です。

これ以上大きな$d_{NG} > \min_{1 \leq i \leq N}(X_i + Y_i)$にはできません。
なぜなら、たぴ$0$とたぴ$N+1$を$d_{NG}$離して配置すると、例えば$\min_{1 \leq i \leq N}(X_i + Y_i)$をみたすたぴ$i_{min}$をどのように配置しても、たぴ$0$から$X_{i_{min}}$より大きく離れるか、たぴ$N+1$から$Y_{i_{min}}$より大きく離れるからです。

一方、$d = \min_{1 \leq i \leq N}(X_i + Y_i)$は以下の構成で達成できます。

たぴ$0$を$0$に配置します。
たぴ$N+1$を$d$に配置します。

たぴ$i (1 \leq i \leq N)$について、

- $d \leq X_i$のとき$d$に配置します。こうすればたぴ$0$から$X_i$以下であり、たぴ$N+1$からの距離は$0$なので$Y_i$も自然と満たされます。

- $d > X_i$のとき、$X_i$に配置します。このとき、たぴ$N+1$から$Y_i$以下という条件もみたしています。なぜなら、$X_i + Y_i \geq d$より、$Y_i \geq d - X_i$だからです。


https://yukicoder.me/submissions/397044
