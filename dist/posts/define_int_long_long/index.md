# #define int long longは何がいけないのか

# はじめに

C++で競技プログラミングをしていると目にする`#define int long long`。
これをするとある程度はオーバーフローを気にしなくて良くなる反面、main関数の戻り値の型をintにする工夫をしないといけなくなったり、見た目はint型の変数で`printf("%lld", hoge);`しないといけなくなったりします。

最近Twitterで`#include <bits/stdc++.h>`や`#define int long long`の是非が議論されていました。（`#include <bits/stdc++.h>`に至ってはトレンド入りするほどに！）その中で、`#define int long long`は許さない、という主張をそこそこみかけました[要出典]。さらに、`#define int long long`を使っている人でさえ、これを使うことに多少なりとも肩身が狭い思いをしているように見えました[要出典]。

冒頭で述べたように、`#define int long long`にはいくつか美しさに欠ける点があります。とはいえ、これは許されないほどの行為なのでしょうか。

# `#define int long long`の問題点

一応、`#define int long long`を使うべきでないとまで言える根拠はあります。「**キーワード（他言語でいうところのだいたい予約語）をdefineするのは未定義動作だから**」です。
そもそもintに限らず、キーワードをdefineするのは未定義動作なのです。

[Replacing text macros - cppreference.com](https://en.cppreference.com/w/cpp/preprocessor/replace)のReserved macro namesに書いてあります。

> A translation unit that uses any part of the standard library may not #define or #undef names lexically identical to:
> - keywords
> - identifiers with special meaning (since C++11)
> - any standard attribute token (since C++11)
> 
> except that likely and unlikely may be defined as function-like macros.(since C++20)
> Otherwise, the behavior is undefined.

# GCCでは許される

しかし、GCCではキーワードをdefineすることができます。

[3 Macros - GCC online documentation](https://gcc.gnu.org/onlinedocs/cpp/Macros.html#Macros)に書いてあります。

> You may define any valid identifier as a macro, even if it is a C keyword.

Clangやその他においてどうなのかはわからなかったので、ご存知の方がいたらぜひくさころ（[@9sako6](https://twitter.com/9sako6)）に教えてください。

# 結論
GCCを使っているなら`#define int long long`しても問題なさそう。あとは可読性や好みの話になるのでしょう。

# 参考
1. [Replacing text macros - cppreference.com](https://en.cppreference.com/w/cpp/preprocessor/replace)
2. [3 Macros - GCC online documentation](https://gcc.gnu.org/onlinedocs/cpp/Macros.html#Macros)
3. https://twitter.com/__KasSA/status/1247178818076299265
4. https://twitter.com/__KasSA/status/1247193760909254656

Thanks!
