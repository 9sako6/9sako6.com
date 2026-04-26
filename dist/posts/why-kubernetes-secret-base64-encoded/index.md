# なぜ Kubernetes の Secret は base64 エンコードするのか

# 結論と経緯

テキストデータだけでなく、バイナリデータも扱いたいからだと思われます。
base64 エンコードすればどんなデータでも文字列にすることができるので、例えばバイナリデータを扱うこともできます。

しかし、新たな疑問が湧いてきました。
バイナリデータを扱いたいなら、バイナリデータを扱うときに base64 エンコードして使えばいいのであって、エンコードが不要なテキストデータに対してもわざわざ毎回 base64 エンコードすることを求める必要があるんでしょうか。

2015年、Secret が実装されたらしき頃の PR にヒントとなるコメントを見つけました。

https://github.com/kubernetes/kubernetes/pull/4514#discussion_r25192003

PR の作者がコメントにて、全てを base64 エンコードする必要はないのではないかと考えている、と述べています。
バイナリであることを示すフラグを用意して、バイナリのときは base64 エンコードし、文字列ならそのまま渡せばいいのではないかという案です。

> @thockin @bgrant0607, I was thinking about the Data field this weekend -
> I think there's a case to be made for using a list of a type like:
>
> ```
> type SecretCell struct {
>     Name  string
>     Value string
>     Binary bool
> ```
>
> I don't think you should have to base64 encode everything - it makes for
> kind of a crummy experience IMO, especially when the serialized form is a
> string anyway. The binary bit would indicate whether the string is just a
> normal string or base64 encoded binary data.

これに対しての返事で、「常に base64 エンコードするくどさ」が「時々 base64 エンコードするくどさ」より悪いとは思わないと述べられています。

> I'm not sure that the "always base64" crumminess is worse than the "sometimes base64" crumminess :)

現在の API からわかる通り、最終的にはすべてのデータを base64 エンコードするという方針が採用されました。
base64 エンコードしたりしなかったりして混乱するよりは、全て base64 する方向に統一する一貫性を選んだんでしょうね。

# 余談

後に ConfigMap にはバイナリを扱うための `binaryData` フィールドが追加されましたが、これは 2018年のことでした。

https://github.com/kubernetes/kubernetes/pull/57938

個人的に、ConfigMap は Secret とは違って非機密データを扱うものですから、デフォルトでテキストデータを扱い、別の選択肢として `binaryData` が生えていることに違和感はありません。
