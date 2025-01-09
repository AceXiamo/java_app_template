<script lang="ts" setup>
import { host } from '@/utils/alioss'

const props = withDefaults(defineProps<{
  label: string
  required?: boolean
  modelValue?: string
  disabled?: boolean
  placeholder?: string
  type?: 'text' | 'number' | 'textarea'
  limit?: number
}>(), {
  disabled: false,
  type: 'text',
  limit: 3,
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
  <view flex flex-col justify-center gap-[20rpx]>
    <view ml-[20rpx] flex items-center gap-[10rpx]>
      <view i-heroicons:photo-16-solid text-[26rpx] text-emerald-500 />
      <text text-[26rpx] text-[#333]>
        {{ label }}
      </text>
    </view>
    <view bw-full grid grid-cols-3 gap-[20rpx]>
      <view
        v-for="url, index in images" :key="index" box-border aspect-square w-full flex items-center justify-center overflow-hidden border border-gray-300 rounded-[10rpx] border-solid @click="handleImageClick(url)" @longpress="handleDeleteImage(index)"
      >
        <image :src="url" mode="aspectFill" class="h-full w-full" />
      </view>
      <template v-if="images.length < limit">
        <view
          box-border aspect-square w-full flex items-center justify-center border border-gray-300 rounded-[10rpx] border-solid
          @click="handleAddImage"
        >
          <view i-heroicons:plus text-[30rpx] text-gray-500 />
        </view>
      </template>
    </view>
  </view>
</template>
