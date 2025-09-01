<script lang="ts" setup>
const props = defineProps<{
  maxStars?: number
  modelValue?: number
  editable?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const maxStars = computed(() => props.maxStars || 5)
const currentStars = ref(props.modelValue || maxStars.value)

watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined) {
    currentStars.value = newValue
  }
})

function setStars(index: number) {
  if (props.editable) {
    currentStars.value = index + 1
    emit('update:modelValue', currentStars.value)
  }
}
</script>

<template>
  <view class="flex gap-[2rpx]">
    <AIcon
      v-for="index in maxStars"
      :key="index"
      :size="32"
      :icon="index <= currentStars - 1 ? 'star' : 'star_empty'"
      @click="setStars(index)"
    />
  </view>
</template>
