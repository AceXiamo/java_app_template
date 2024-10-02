<script setup lang="ts">
import { useUserStore } from '@/store/user'

const toast = ref()
const confirm = ref()
const inputConfirm = ref()
const user = useUserStore()

onMounted(() => {
  toastRef.value = toast.value
  confirmRef.value = confirm.value
  inputConfirmRef.value = inputConfirm.value
})
</script>

<template>
  <view class="h-screen flex flex-col bg-[#f5f5f5f5]">
    <view class="h-0 w-full flex-auto">
      <slot />
    </view>
    <app-footer v-if="user.token" />
    <Toast ref="toast" />
    <Confirm ref="confirm" />
    <InputConfirm ref="inputConfirm" />
  </view>
</template>
