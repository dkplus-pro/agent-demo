/// <reference types="@dcloudio/types" />
/// <reference types="@uni-helper/vite-plugin-uni-pages/client" />
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<object, object, unknown>;
  export default component;
}
