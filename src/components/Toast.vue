<script lang="ts" setup>
import { ref } from 'vue'

const message = ref<Message>({})
const open = ref<boolean>(false)
const timeout = ref()

interface Message {
  text?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

function show(msg: string | Message) {
  if (timeout.value)
    clearTimeout(timeout.value)

  message.value = typeof msg === 'string' ? { text: msg } : msg
  open.value = true

  timeout.value = setTimeout(() => {
    open.value = false
  }, message.value.duration || 2000)
}

function error(msg: string) {
  console.log(msg)
  show({ text: msg, type: 'error' })
}

function success(msg: string) {
  show({ text: msg, type: 'success' })
}

function warning(msg: string) {
  show({ text: msg, type: 'warning' })
}

function info(msg: string) {
  show({ text: msg, type: 'info' })
}

defineExpose({
  error,
  success,
  warning,
  info,
  show,
})
</script>

<template>
  <view
    v-if="open"
    class="opaciry-0 pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-[9999] flex flex-col items-center justify-center transition-all duration-300"
    :style="{ opacity: open ? '1' : '0' }"
  >
    <view class="flex items-center gap-10rpx rounded-md bg-white px-28rpx py-18rpx text-26rpx shadow-lg">
      <template v-if="message.type === 'success'">
        <view i-heroicons:check-circle-solid text-[26rpx] text-emerald-500 />
      </template>
      <template v-if="message.type === 'error'">
        <view i-heroicons:x-circle-solid text-[26rpx] text-red-500 />
      </template>
      <template v-if="message.type === 'warning'">
        <view i-heroicons:exclamation-circle-solid text-[26rpx] text-yellow-500 />
      </template>
      <text>{{ message.text }}</text>
    </view>
  </view>
</template>
