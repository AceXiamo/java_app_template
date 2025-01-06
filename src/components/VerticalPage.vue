<script lang="ts" setup>
import { debounce } from '@/utils/tool'
import { useSettingStore } from '@/store/setting'

const props = withDefaults(
  defineProps<{
    status: LoadPageDataStatus
  }>(),
  {
    status: 'hide',
  },
)
const emits = defineEmits(['scrolltolower'])
const settingStore = useSettingStore()

const lowerDebounce = debounce(() => {
  emits('scrolltolower')
}, 50)

function scrolltolower() {
  if (props.status === 'nomore')
    return

  lowerDebounce()
}
</script>

<template>
  <scroll-view :scroll-y="true" class="h-0 flex flex-1 flex-col snap-y" @scrolltolower="scrolltolower">
    <slot />
    <view
      class="relative h-max flex justify-center pt-[30rpx]" :class="[
        props.status !== 'hide' && 'show-loading',
        props.status === 'hide' && 'hide-loading',
      ]"
      :style="{ paddingBottom: settingStore.isAppleAndHasLine ? `30rpx` : `calc(env(safe-area-inset-bottom) + 30rpx)` }"
    >
      <view class="w-max animate-spin transition-all duration-100" :style="{ opacity: props.status === 'loading' ? '1' : '0' }">
        <view i-heroicons:sun text-[32rpx] />
      </view>
      <view
        class="absolute w-max transition-all duration-100"
        :style="{ opacity: props.status === 'nomore' ? '1' : '0' }"
      >
        <text class="text-[24rpx] text-gray-300">
          没有更多了~
        </text>
      </view>
    </view>
  </scroll-view>
</template>

<style scoped>
.show-loading {
  animation: loadingAni 0.4s linear forwards;
}

.hide-loading {
  animation: loadingAni 0.4s linear forwards reverse;
}

@keyframes loadingAni {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
