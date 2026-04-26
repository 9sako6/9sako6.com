# なぜ不変なオブジェクトを useEffect, useCallback, useMemo の依存配列に含めるのか: react-hooks/exhaustive-deps のフェイルセーフ

ESLint の `react-hooks/exhaustive-deps` ルールを使っているときにフェイルセーフの大切さを見出す場面があったので書き記しておきます。

# 不変のオブジェクトは依存配列に含める必要がない

ESLint で`react-hooks/exhaustive-deps` ルールを有効にすると、`useEffect` や `useCallback` 、`useMemo` といったフックの依存配列に漏れがある場合に検知してくれます。

ただし、これらのフックの依存先に不変のオブジェクトがあるとき、不変のオブジェクトを依存配列に含める必要はありません。
例えば、以下の `useCallback` では `setCount` を使っていますが、`setCount`（`useState` が返す set 関数）は再レンダリング間で不変[^1]なので依存配列に含める必要はありません。
そして `react-hooks/exhaustive-deps` は賢いので、この場合は依存配列に含めてなくても怒られません。

```tsx
const [count, setCount] = useState(0);
const handleClick = useCallback(() => {
  setCount((prev) => prev + 1);
}, []); // Lint に怒られない
```

# 不変でも検知してフェイルセーフにしてくれる

次は、不要なはずの不変オブジェクトを依存配列に含めるように言われる例を見てみましょう。
set 関数をカスタムフックから返すと、set 関数は不変なはずですが依存配列に含めるように言われます。

```tsx
// 現実にこんなコードはあってほしくないですが、認知負荷を下げるために簡単な例を出しています。
const useCount = () => {
  const [count, setCount] = useState(0);
  return [count, setCount] as const;
};

export const Counter = () => {
  const [count, setCount] = useCount();
  const handleClick = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);
```

```bash
demo/Counter.tsx
  14:6  error  React Hook useCallback has a missing dependency: 'setCount'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
```

技術的に依存配列に含める必要がないオブジェクトを、依存配列に含めるように言われてしまいました。
想像に難くないですが、カスタムフックやコンテキストで不変オブジェクトを渡された場合、流石に Linter はそれを検知できるほどの力を持っていないでしょう。
加えて、本当に不変オブジェクトであるならば、依存配列に含まれていたって動作には何の問題もありません。
例に挙げた `useCallback` は依存配列の要素に変更があったときにキャッシュではなく新しい関数を返すようになるわけで、不変オブジェクトが依存配列に含まれていたところで変更とは見なされないので害はありません。
`react-hooks/exhaustive-deps` はなるべく依存配列への記入漏れを検知することにより、コードが安全になるようにしてくれているわけですね。

# 最後に

フェイルセーフってとっても大事ですね。
React を使う際はぜひ `react-hooks/exhaustive-deps` ルールを有効にしましょう。

# 検証環境

- eslint-plugin-react-hooks@4.6.0
- eslint-plugin-react@7.33.2
- eslint@8.56.0
- react-dom@18.2.0
- react@18.2.0

# 参考

https://github.com/facebook/react/issues/14920#issuecomment-471070149

[^1]: 期限切れとなった古い方のドキュメントには書いてあった。https://legacy.reactjs.org/docs/hooks-reference.html > React guarantees that setState function identity is stable and won’t change on re-renders. This is why it’s safe to omit from the useEffect or useCallback dependency list. / 現在も不変であることを確かめる場合は、コンポーネントの外で `let lastSetState` を定義して `setState` をレンダリングのたびに保存しておいて、`lastSetState === setState` をするといいでしょう
