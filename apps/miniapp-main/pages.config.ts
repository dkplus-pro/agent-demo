import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages';

/** 复用：主包 / 普通分包页上的异步分包占位组件声明 */
const asyncPlaceholderStyle = {
  usingComponents: {
    'async-demo-card': '/subpackages/async-ui/components/shared-ui/async/AsyncDemoCard',
    'async-stats-card': '/subpackages/async-ui/components/shared-ui/async/AsyncStatsCard',
  },
  componentPlaceholder: {
    'async-demo-card': 'view',
    'async-stats-card': 'view',
  },
};

export default defineUniPages({
  globalStyle: {
    navigationBarTextStyle: 'black',
    navigationBarTitleText: 'Mind Clone',
    navigationBarBackgroundColor: '#ffffff',
    backgroundColor: '#f7f8fa',
  },
  pages: [
    {
      path: 'pages/index/index',
      style: {
        navigationBarTitleText: 'Mind Clone',
        ...asyncPlaceholderStyle,
      },
    },
  ],
  subPackages: [
    {
      root: 'subpackages/demo',
      pages: [
        {
          // 需与 vite-plugin-uni-pages 扫描到的 path 一致（相对 src 目录），否则无法合并 style
          path: 'subpackages/demo/pages/index/index',
          style: {
            navigationBarTitleText: 'Subpackage Demo',
            ...asyncPlaceholderStyle,
          },
        },
        {
          path: 'subpackages/demo/pages/second/index',
          style: {
            navigationBarTitleText: 'Subpackage Second',
            ...asyncPlaceholderStyle,
          },
        },
      ],
    },
    {
      root: 'subpackages/demo2',
      pages: [
        {
          path: 'subpackages/demo2/pages/index/index',
          style: {
            navigationBarTitleText: 'Subpackage Demo 2',
            ...asyncPlaceholderStyle,
          },
        },
      ],
    },
    {
      root: 'subpackages/async-ui',
      pages: [
        {
          path: 'subpackages/async-ui/pages/placeholder/index',
          style: {
            navigationBarTitleText: 'Async UI',
          },
        },
      ],
    },
  ],
});
