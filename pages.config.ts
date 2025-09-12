import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  pages: [],
  window: {
    transparentTitle: 'always',
    navigationStyle: 'custom',
  },
  globalStyle: {
    backgroundColor: '@bgColor',
    backgroundColorBottom: '@bgColorBottom',
    backgroundColorTop: '@bgColorTop',
    backgroundTextStyle: '@bgTxtStyle',
    navigationBarBackgroundColor: '#000000',
    navigationBarTextStyle: '@navTxtStyle',
    navigationBarTitleText: 'Vitesse-Uni',
    navigationStyle: 'custom',
  },
  // tabBar: {
  //   backgroundColor: '@tabBgColor',
  //   borderStyle: '@tabBorderStyle',
  //   color: '@tabFontColor',
  //   selectedColor: '@tabSelectedColor',
  //   list: [
  //     {
  //       pagePath: 'pages/main/index',
  //       text: '首页',
  //     },
  //     {
  //       pagePath: 'pages/customer/index',
  //       text: '客户',
  //     },
  //     {
  //       pagePath: 'pages/my/index',
  //       text: '我的',
  //     },
  //   ],
  // },
})
