# TypeScript の satisfies 演算子は何に役立つのか

# `satisfies` 演算子とは

[TypeScript 4.9 で導入された](https://devblogs.microsoft.com/typescript/announcing-typescript-4-9-beta/#the-satisfies-operator) `satisfies` 演算子は、`式 satisfies 型` のようにして使い、式 が 型にマッチするかどうかをチェックします。

`satisfies` は、

- 式がある型にマッチすることを保証しつつ、文脈的に型付けする
- 式 が 型にマッチするかどうかをチェックし、型アノテーションとは違い、型推論結果を保つ

という演算子です。

```typescript
type User = { email: string };
// OK
const jane = { email: "jane@example.com" } satisfies User;
// Error
const john = { email: "john@example.com", id: 1 } satisfies User;
//                                        ~~ Object literal may only specify
// known properties, and 'id' does not exist in type 'User'.

// Type annotation
const taro: User = { email: "taro@example.com" };
```

上記の例で、`jane` は `{ email: string }` 型です。一方、型アノテーションをつけた `taro` は `User` 型です。
`satisfies` を使った場合はオブジェクトリテラルの型がそのまま保持されています。型推論結果を保つ、という特徴の便利さは、以降ご紹介するシナリオでも実感いただけると思います。

# 結局何に使うの？

`satisfies` が輝くシナリオを紹介していきます。

- オブジェクトのキーが充足しているかチェックする
- 型推論を残して型の可読性を高める

# オブジェクトのキーが充足しているかチェックする

オブジェクトのキーが、あらかじめ定義された集合から成ることをチェックしたい場合、
`satisfies` を使うとオブジェクトのキーが全て揃っていることをチェックできます。

```typescript
type Color = "red" | "green" | "blue";

// OK
const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: "#0000ff",
} satisfies Record<Color, unknown>;
```

`satisfies` を使えば、キーが足りない場合は型エラーになります。

```typescript
// キーが足りない
const wip_palette = {
  red: [255, 0, 0],
  green: "#00ff00",
} satisfies Record<Color, unknown>;
// ~~~~~~~~
// Property 'blue' is missing
```

余分なキーがある場合も型エラーになります。

```typescript
// 余分なキーがある
const rainbow = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: "#0000ff",
  orange: "#ffa500",
  //  ~~~~~~ Object literal may only specify known properties,
  // and 'orange' does not exist in type 'Record<Color, unknown>'.
} satisfies Record<Color, unknown>;
```

型アノテーションでもプロパティのキーが充足しているかをチェックできますが、`satisfies` を使うと型推論が保持されるのが特徴です。
したがって、`red` が `number[]` 型であることが保持されるので、`palette.red` を配列として扱うことができます。

```typescript
type Color = "red" | "green" | "blue";

const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: "#0000ff",
} satisfies Record<Color, unknown>;

const r = palette.red[0];
```

型アノテーションの場合は各キーで取得した値が `unknown` 型になるので、同じようにはいきません。
`Record<Color, string | number[]>` を型アノテーションしたとて、値は `string | number[]` 型になるので、型を絞り込まないと配列として扱うことはできません。

以上のように、`satisfies` は型推論を保持しつつ、オブジェクトのキーが充足しているかチェックするのに役立ちます。

もう一つ実用的な例を出しておきます。
広い型を受け取る関数にオブジェクトリテラルを渡す際、`satisfies` で型チェックをすることができます。
例えば、[Zod](https://github.com/colinhacks/zod) のようなランタイムでの validator にオブジェクトを渡す場合です。

```typescript
const post = PostSchema.parse({
  title: "Lorem Ipsum",
  description: "Neque porro quisquam est",
} satisfies PostSchema);
```

その他にも、例えば Firestore のようなスキーマレスのデータストアに保存するオブジェクトリテラルに型チェックをすることができます。

```typescript
type User = {
  name: string;
  age: number;
};

await db
  .collection("users")
  .doc("2ddb6c99-be69-4ef1-9375-93c05d11462d")
  .set({
    name: "Jane Doe",
    age: 18,
  } satisfies User);
```

# 型推論を残して型の可読性を高める

`satisfies` を使うことにより、型推論しつつ、読みやすい推論結果を残すことができます。
実例を添えて説明してみます。Puppeteer のコードを説明に使わせていただきます。

https://github.com/puppeteer/puppeteer/blob/58e9c64f6364fc1663995d4136445cdc8fab9292/packages/puppeteer-core/src/api/Input.ts#L292

`satisfies` を使わない場合の問題を考えるために、以下のような `MouseButton` を考えます。

```typescript
export const MouseButton: Record<string, Protocol.Input.MouseButton> =
  Object.freeze({
    Left: "left",
    Right: "right",
    Middle: "middle",
    Back: "back",
    Forward: "forward",
  });
```

型アノテーションがついており、`MouseButton` は `Record<string, Protocol.Input.MouseButton>` 型です。
プロパティの値は `Protocol.Input.MouseButton` 型である必要があるので、例えば `forwrad` のようなミスをしても型エラーになってくれます。
今のところ何も問題なさそうですね。

では、エディタで `MouseButton` にカーソルを当てて表示される型はどうなっているでしょうか。
やってみると以下のようになります。

![](/images/why-typescript-satisfies-operator-bad.png)

何も間違ってはいませんが、型定義にジャンプしない限りは中身がどうなっているのかわかりません。

もちろん `{Left: 'left'; Right: 'right'; Middle: 'middle'; Back: 'back'; Forward: 'forward';}` 型をアノテーションすれば問題なくなりますが、Union 型で値の集合を定義しておきたいという本来の意図から外れてしまします。

今度は型アノテーションではなく、`satisfies` を使ってみましょう。

```typescript
export const MouseButton = Object.freeze({
  Left: "left",
  Right: "right",
  Middle: "middle",
  Back: "back",
  Forward: "forward",
}) satisfies Record<string, Protocol.Input.MouseButton>;
```

型アノテーションした場合と同様に、`forwrad` みたいなタイポをしていたら型エラーになります。

さらに、`satisfies` が型推論を保持する性質がここで効いてきます。
エディタで `MouseButton` にカーソルを当てると、型の中身がわかります。

![](/images/why-typescript-satisfies-operator-good.png)

`satisfies` を使うことにより、型推論しつつ、読みやすい推論結果を残すことができました。

ちなみに、これは VSCode の拡張機能 Prettify TypeScript でも実現することができます。Prettify TypeScript は、エディタ上でホバーしたときの型を整形して、以下のように表示してくれます。

![Prettify TypeScript example](/images/why-typescript-satisfies-operator-extension.png)

https://marketplace.visualstudio.com/items?itemName=MylesMurphy.prettify-ts

# 参考

https://devblogs.microsoft.com/typescript/announcing-typescript-4-9-beta/#the-satisfies-operator

https://github.com/microsoft/TypeScript/issues/47920
