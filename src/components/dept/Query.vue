<script lang="ts" setup>
import { save } from '@/api/dept'

const emit = defineEmits(['search', 'reload'])

function toAdd() {
  inputConfirmRef.value?.show({
    title: '新增部门',
    type: 'info',
    placeholder: '请输入部门名称',
    onConfirm: (value) => {
      save({ deptName: value }).then(() => {
        toastRef.value?.success('新增成功')
        emit('reload')
      })
    },
  })
}
</script>

<template>
  <view class="flex-warp flex items-center gap-[20rpx] px-[20rpx]">
    <ClickButton size="medium" bg-color="white" font-color="#1A89FA" @click="toAdd">
      <view i-heroicons:plus-16-solid mr-[5rpx] text-[20rpx] />
      <text>
        新增
      </text>
    </ClickButton>
  </view>
</template>
