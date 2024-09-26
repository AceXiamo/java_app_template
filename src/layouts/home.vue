<script setup lang="ts">
const toast = ref()
const confirm = ref()

function refInit() {
  toastRef.value = toast.value
  confirmRef.value = confirm.value
}

onMounted(refInit)

onShow(refInit)
</script>

<template>
  <view class="h-screen flex flex-col bg-[#f5f5f5f5]">
    <view class="h-0 w-full flex-auto">
      <slot />
    </view>
    <Toast ref="toast" />
    <Confirm ref="confirm" />
  </view>
</template>
