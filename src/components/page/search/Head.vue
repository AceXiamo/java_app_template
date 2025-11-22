<script lang="ts" setup>
import { computed } from 'vue'
import HeadBar from '@/components/HeadBar.vue'

// 定义组件属性
const props = withDefaults(defineProps<{
  selectedCategoryName?: string
}>(), {
  selectedCategoryName: ''
})

// 计算动态标题
const dynamicTitle = computed(() => {
  if (props.selectedCategoryName) {
    return `${props.selectedCategoryName}`
  }
  return '全部车型搜索结果'
})

// 返回上一页
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <HeadBar bg-color="white">
    <view class="relative h-full flex items-center">
      <!-- 返回按钮 -->
      <view class="absolute left-0 z-10 h-full w-[80rpx] flex items-center justify-center" @tap="goBack">
        <text class="i-material-symbols:arrow-back-ios text-[36rpx] text-black" />
      </view>

      <!-- 页面标题 -->
      <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
        {{ dynamicTitle }}
      </text>
    </view>
  </HeadBar>
</template>
