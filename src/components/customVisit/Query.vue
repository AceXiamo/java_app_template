<script lang="ts" setup>
import { type TenantDept, options } from '@/api/dept'

defineEmits(['search'])

const queryForm = ref({
  searchValue: '',
  deptId: -1,
  recordStatus: -1,
})
const optionsList = ref<TenantDept[]>([])
const deptOptions = computed(() => {
  return [
    { value: -1, label: '全部' },
    ...optionsList.value.map(item => ({ value: item.id!, label: item.deptName! })),
  ]
})

const statusOptions = [
  { value: -1, label: '全部' },
  { value: 0, label: '待审核' },
  { value: 1, label: '已通过' },
  { value: 2, label: '已完成' },
  { value: 3, label: '已驳回' },
]

onMounted(() => {
  options().then((res) => {
    optionsList.value = res.data
  })
})
</script>

<template>
  <view class="flex-warp flex items-center gap-[20rpx] px-[20rpx]">
    <view box-border w-[200rpx] rounded-[10rpx] bg-white py-[5rpx] text-[24rpx]>
      <input
        v-model="queryForm.searchValue"
        type="text"
        class="box-border w-full px-[10rpx]"
        placeholder="输入内容以筛选"
      >
    </view>
    <template v-if="deptOptions.length > 1">
      <SelectBar v-model="queryForm.deptId" :options="deptOptions" placeholder="请选择部门" w-[210rpx] />
    </template>
    <SelectBar v-model="queryForm.recordStatus" :options="statusOptions" placeholder="请选择状态" w-[170rpx] />
    <ClickButton
      size="medium"
      bg-color="white"
      font-color="#1A89FA"
      @click="$emit('search', queryForm)"
    >
      <view i-heroicons:magnifying-glass-16-solid mr-[5rpx] text-[20rpx] />
    </ClickButton>
  </view>
</template>
