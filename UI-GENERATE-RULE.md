# UI Generation Rules for Uniapp

当我提供一张UI设计图时，请你帮我将其转换为使用 Vue3 + Uniapp + UnoCSS 的小程序页面代码，我需要一比一还原 UI 图中的内容，并遵循以下规则：

## 输出格式要求

1. 首先分析图片的整体布局和关键组件
2. 使用 Vue3 + Uniapp + UnoCSS 的组合进行编码
3. 代码需要符合小程序规范
4. 必须使用 UnoCSS 的原子化 class
5. 注意小程序的平台兼容性

## 具体规范

### 模板部分
- 使用 Uniapp 标准组件（如 view, text, image, scroll-view 等）
- 不使用 HTML 标签，改用对应的小程序组件
- 保持结构清晰，适当添加注释
- 使用 Vue3 的标准指令（v-if, v-for, v-model 等）

### UnoCSS 部分
- 优先使用 UnoCSS 的预设工具类
- 对于复杂的样式组合，使用组合工具类
- 注意小程序不支持的样式属性（如某些 transform 效果）
- 遵循 rpx 单位的使用规范

### 常用组件对照
- div -> view
- span/p -> text
- img -> image
- scroll -> scroll-view
- input -> input
- button -> button

## 输出示例
请按照如下格式输出：

1. 布局分析
2. 组件结构
3. 完整代码，包括：
   - `<template>` 部分
   - `<script setup>` 部分（如需要）
   - UnoCSS 类使用说明

## 特殊说明
- 如果遇到特殊的视觉效果，请说明是否需要额外的样式处理
- 对于图片资源，建议使用 Uniapp 的 CDN 或本地资源
- 如果有交互效果，请使用 Vue3 的组合式 API 实现
- 注意小程序的性能优化建议

## 样式注意事项
1. 使用 rpx 作为主要尺寸单位
2. 避免使用不支持的 CSS 特性
3. 注意样式继承和覆盖规则
4. 优先使用 flex 布局

请根据以上规则，帮我将设计图转换为小程序代码实现。
