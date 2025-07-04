import {
  defineConfig,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

import { presetUni } from '@uni-helper/unocss-preset-uni'

export default defineConfig({
  presets: [
    presetUni(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  shortcuts: [
    ['a-content', 'h-0 flex-1 overflow-y-auto'],
    ['a-container', 'relative h-full flex flex-col overflow-y-auto'],
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
