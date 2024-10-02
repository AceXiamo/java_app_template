<script lang="ts" setup>
import { ref } from 'vue'

const options = ref<ConfirmOptions>({})
const open = ref<boolean>(false)
const forVShow = ref<boolean>(false)
const inputValue = ref<string>('')

interface ConfirmOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  remark?: string
  remarkColor?: string
  placeholder?: string
  value?: string
  title?: string
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
  onConfirm?: (value: string) => void
  onCancel?: () => void
}

function show(props: ConfirmOptions) {
  options.value = {
    title: '提示',
    type: 'info',
    showCancel: true,
    confirmText: '确定',
    cancelText: '取消',
    ...props,
    onConfirm: () => {
      open.value = false
      setTimeout(() => {
        forVShow.value = false
        props.onConfirm?.(inputValue.value)
        inputValue.value = ''
      }, 250)
    },
    onCancel: () => {
      open.value = false
      setTimeout(() => {
        forVShow.value = false
        props.onCancel?.()
        inputValue.value = ''
      }, 200)
    },
  }
  if (props.value)
    inputValue.value = props.value
  forVShow.value = true
  setTimeout(() => open.value = true)
}

function close() {
  open.value = false
  setTimeout(() => {
    forVShow.value = false
  }, 200)
}

defineExpose({
  show,
})
</script>

<template>
  <view
    v-if="forVShow"
    class="opaciry-0 fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50 transition-all duration-200"
    :style="{
      opacity: open ? '1' : '0',
      pointerEvents: open ? 'auto' : 'none',
    }"
    @click="close"
  >
    <view class="min-w-[70%] flex flex-col rounded-md bg-white px-[28rpx] py-[18rpx] shadow-lg" @click.stop>
      <view class="flex items-center gap-[10rpx]">
        <template v-if="options.type === 'success'">
          <view i-heroicons:check-circle-solid text-[26rpx] text-emerald-500 />
        </template>
        <template v-if="options.type === 'error'">
          <view i-heroicons:x-circle-solid text-[26rpx] text-red-500 />
        </template>
        <template v-if="options.type === 'warning'">
          <view i-heroicons:exclamation-circle-solid text-[26rpx] text-yellow-500 />
        </template>
        <template v-if="options.type === 'info'">
          <view i-heroicons:exclamation-circle-solid text-[26rpx] text-blue-500 />
        </template>
        <text class="text-[26rpx] font-bold">
          {{ options.title }}
        </text>
      </view>
      <veiw mt-[40rpx] flex flex-col>
        <view box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[4rpx_15rpx]>
          <input v-model="inputValue" type="text" :placeholder="options.placeholder" class="text-[26rpx]">
        </view>
        <text v-if="options.remark" class="mt-[10rpx] text-[26rpx]" :style="{ color: options.remarkColor }">
          {{ options.remark }}
        </text>
      </veiw>
      <view class="mt-[40rpx] flex justify-end gap-[20rpx]">
        <view class="flex-none rounded-[6rpx] bg-blue-500 px-[15rpx] py-[5rpx] text-white leading-[35rpx]" @click="options.onConfirm">
          <text class="text-[22rpx]">
            {{ options.confirmText }}
          </text>
        </view>
        <view class="flex-none rounded-[6rpx] bg-gray-400 px-[15rpx] py-[5rpx] text-white leading-[35rpx]" @click="options.onCancel">
          <text class="text-[22rpx]">
            {{ options.cancelText }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
