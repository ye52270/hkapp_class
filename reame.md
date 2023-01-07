# MIXIN

## Mixin function

> 관계를 유연하게 가져갈 수 있고 다중 상속방식을 구현할 수 있다.(JS는 다중 상속이 안된다)

```js
function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);

      if (descriptor) {
        Object.defineProperty(derivedCtor.prototype, name, descriptor);
      }
    });
  });
}
```
