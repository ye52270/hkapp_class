# HK App typescript 적용

## 준비사항

### 1) 확장자 js 파일을 ts 파일로 변경한다

### 2) tsconfig.json 파일을 root 에 생성한다

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES5",
    "module": "E55",
    "alwaysStrict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "sourceMap": true,
    "downlevelIteration": true
  }
}
```

> strict : typescript 의 엄격성 적용

> noImplicitAny : any 를 사용하지 못하고 명확하게 타입을 지정

> target : JS 버전(ES5)

> module : import, export 를 사용할지

> sourceMap : dist 폴더(ts 컴파일러가 변환한 결과를 출력) 안의 ~.js.map 파일, ~js파일 을 매핑해주는 역할.
> 디버깅 등 ts파일의 오류를 찾을 때 브라우저가 js파일을 ts파일과 매핑해서 쉽게 디버깅 하게 해준다
> 개발환경과 실행환경을 동일하게 맞춰주는 설정
