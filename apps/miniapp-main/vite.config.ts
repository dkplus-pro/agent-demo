import { defineConfig } from 'vite';
import uniPlugin from '@dcloudio/vite-plugin-uni';
import UniPages from '@uni-helper/vite-plugin-uni-pages';
import { fileURLToPath, URL } from 'node:url';
import { uniWorkspaceMirrorPlugin } from '../../scripts/uni-workspace-mirror-plugin';

type GeneratedSubdirectory = 'components/shared-ui' | 'workspace-utils';
type SubpackagePlacement = 'local' | 'async';

const uni = (uniPlugin as unknown as { default?: typeof uniPlugin }).default ?? uniPlugin;

const getPath = (path: string) => fileURLToPath(new URL(path, import.meta.url));
// 分包根目录列表，每次新增分包时需要在此处添加
const subpackageRootList = [
  'src/subpackages/demo',
  'src/subpackages/demo2',
  'src/subpackages/async-ui',
] as const;
// 异步分包根目录集合，每次新增异步分包时需要在此处添加
const asyncSubpackageRootSet = new Set(['src/subpackages/async-ui']);

// 创建生成目标列表
function createGeneratedTargetList(
  generatedSubdirectory: GeneratedSubdirectory,
  subpackagePlacement: SubpackagePlacement,
) {
  return subpackageRootList
    .filter((subpackageRoot) => {
      const isAsyncSubpackage = asyncSubpackageRootSet.has(subpackageRoot);

      if (subpackagePlacement === 'async') {
        return isAsyncSubpackage;
      }

      return !isAsyncSubpackage;
    })
    .map((subpackageRoot) => ({
      root: getPath(`./${subpackageRoot}`),
      generatedDir: getPath(`./${subpackageRoot}/${generatedSubdirectory}`),
    }));
}

export default defineConfig({
  plugins: [
    UniPages({
      dir: 'src/pages',
      subPackages: [...subpackageRootList],
      outDir: 'src',
      // Generated workspace mirrors under subpackages are not routable pages.
      exclude: [
        'node_modules',
        '.git',
        '**/__*__/**',
        '**/components/shared-ui/**',
        '**/workspace-utils/**',
      ],
    }),
    // UI组件镜像
    uniWorkspaceMirrorPlugin({
      // 需要镜像的源码根目录
      sourceRootDir: getPath('../../packages/ui/src'),
      // 主包生成目标目录
      generatedDir: getPath('./src/components/shared-ui'),
      // 分包生成目标列表
      subpackages: createGeneratedTargetList('components/shared-ui', 'local'),
      // 异步分包生成目标列表
      asyncSubpackages: createGeneratedTargetList('components/shared-ui', 'async'),
      // 需要镜像的源码入口列表
      entries: [
        {
          prefix: '@ai-mind-clone/ui/base/',
          sourceDir: 'base',
          outputDir: 'base',
          placement: 'main',
        },
        {
          prefix: '@ai-mind-clone/ui/feature/',
          sourceDir: 'feature',
          outputDir: 'feature',
          placement: 'local',
        },
        {
          prefix: '@ai-mind-clone/ui/async/',
          sourceDir: 'async',
          outputDir: 'async',
          placement: 'async-subpackage',
        },
      ],
    }),
    // 工具函数镜像
    uniWorkspaceMirrorPlugin({
      sourceRootDir: getPath('../../packages/utils/src'),
      generatedDir: getPath('./src/workspace-utils'),
      subpackages: createGeneratedTargetList('workspace-utils', 'local'),
      asyncSubpackages: createGeneratedTargetList('workspace-utils', 'async'),
      entries: [
        {
          prefix: '@ai-mind-clone/utils/base/',
          sourceDir: 'base',
          outputDir: 'base',
          placement: 'main',
        },
        {
          prefix: '@ai-mind-clone/utils/feature/',
          sourceDir: 'feature',
          outputDir: 'feature',
          placement: 'local',
        },
        {
          prefix: '@ai-mind-clone/utils/async/',
          sourceDir: 'async',
          outputDir: 'async',
          placement: 'async-subpackage',
        },
      ],
    }),
    uni(),
  ],
});
