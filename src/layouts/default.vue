<script setup lang="ts">
const toast = ref()
const confirm = ref()
const inputConfirm = ref()

function refInit() {
  toastRef.value = toast.value
  confirmRef.value = confirm.value
  inputConfirmRef.value = inputConfirm.value
}
onMounted(refInit)

onShow(refInit)
</script>

<template>
  <view class="h-screen flex flex-col bg-[#FFF]">
    <view class="h-0 w-full flex-auto">
      <slot />
    </view>
    <app-footer />
    <Toast ref="toast" />
    <Confirm ref="confirm" />
    <InputConfirm ref="inputConfirm" />
  </view>
</template>
