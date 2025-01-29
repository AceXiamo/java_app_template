<script lang="ts" setup>
import { host } from '@/utils/alioss'

const props = withDefaults(defineProps<{
  label?: string
  required?: boolean
  modelValue?: string
  disabled?: boolean
  placeholder?: string
  type?: 'text' | 'number' | 'textarea'
  limit?: number
  showBottomLine?: boolean
  layout?: 'horizontal' | 'vertical'
}>(), {
  disabled: false,
  type: 'text',
  limit: 3,
  showBottomLine: true,
  layout: 'horizontal',
})

const emits = defineEmits(['update:modelValue'])

const images = ref<string[]>([])

function handleAddImage() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      images.value.push(...res.tempFilePaths)
      emits('update:modelValue', images.value.map(url => url.replace(host, '')).join(','))
    },
  })
}

function handleDeleteImage(index: number) {
  uni.vibrateShort({
    success: () => {
      images.value.splice(index, 1)
      emits('update:modelValue', images.value.map(url => url.replace(host, '')).join(','))
    },
  })
}

function handleImageClick(url: string) {
  uni.previewImage({
    urls: [url],
  })
}

watch(() => props.modelValue, (value) => {
  if (value) {
    images.value = value.split(',').map((url: string) => {
      if (url.includes('tmp'))
        return url
      else
        return `${host}${url}`
    })
  }
  else {
    images.value = []
  }
})
</script>

<template>
  <view relative flex items-start gap-[20rpx] py-[20rpx] :class="[layout === 'vertical' ? 'flex-col' : '']">
    <view flex items-center gap-[5rpx] text-[26rpx]>
      <slot name="icon" />
      <text text-[#333]>
        {{ $props.label }}
      </text>
      <text v-if="$props.required" text-[30rpx] text-red-500>
        *
      </text>
    </view>
    <view
      flex-auto justify-end gap-[20rpx]
      :class="[layout === 'vertical' ? 'grid grid-cols-3 w-full' : 'flex']"
    >
      <view
        v-for="url, index in images" :key="index" box-border aspect-square flex flex-none items-center justify-center overflow-hidden border border-gray-300 rounded-[10rpx] border-solid :class="[layout === 'vertical' ? 'w-full' : 'w-[33.3%]']" @click="handleImageClick(url)"
        @longpress="handleDeleteImage(index)"
      >
        <image :src="url" mode="aspectFill" class="h-full w-full" />
      </view>
      <template v-if="images.length < limit">
        <view
          box-border aspect-square flex flex-none items-center justify-center border border-gray-300 rounded-[10rpx] border-dashed
          :class="[layout === 'vertical' ? 'w-full' : 'w-[33.3%]']"
          @click="handleAddImage"
        >
          <view i-heroicons:plus text-[30rpx] text-gray-500 />
        </view>
      </template>
    </view>
    <view v-if="$props.showBottomLine" absolute bottom-0 left-0 right-0 h-[1px] bg-gray-300 />
  </view>
</template>
