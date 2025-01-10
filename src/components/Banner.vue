<script lang="ts" setup>
withDefaults(defineProps<{
  images?: string[]
}>(), {
  images: () => [],
})

const current = ref(0)

function onChange(e: any) {
  current.value = e.detail.current
}
</script>

<template>
  <view relative w-full>
    <swiper
      :autoplay="true"
      :circular="true"
      :interval="3000"
      class="h-[300rpx] w-full"
      @change="onChange"
    >
      <swiper-item v-for="(image, index) in images" :key="index">
        <image :src="image" mode="aspectFill" class="h-full w-full" />
      </swiper-item>
    </swiper>
    <view absolute bottom-[20rpx] left="50%" flex translate-x-[-50%] items-center gap-[10rpx]>
      <view
        v-for="(_, index) in images"
        :key="index"
        h-[10rpx] w-[10rpx] rounded-full transition-all duration-300
        :class="current === index ? 'bg-white w-[20rpx]' : 'bg-white/50'"
      />
    </view>
  </view>
</template>
