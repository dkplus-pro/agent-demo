import { defineConfig } from 'vite';
import uniPlugin from '@dcloudio/vite-plugin-uni';
import { fileURLToPath, URL } from 'node:url';
import { uniWorkspaceMirrorPlugin } from '../../scripts/uni-workspace-mirror-plugin';

const uni = (uniPlugin as unknown as { default?: typeof uniPlugin }).default ?? uniPlugin;
const generatedUiDir = fileURLToPath(new URL('./src/components/shared-ui', import.meta.url));
const generatedUtilsDir = fileURLToPath(new URL('./src/workspace-utils', import.meta.url));

export default defineConfig({
  plugins: [
    uniWorkspaceMirrorPlugin({
      generatedDir: generatedUiDir,
      sourceRootDir: fileURLToPath(new URL('../../packages/ui/src', import.meta.url)),
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
    uniWorkspaceMirrorPlugin({
      generatedDir: generatedUtilsDir,
      sourceRootDir: fileURLToPath(new URL('../../packages/utils/src', import.meta.url)),
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
