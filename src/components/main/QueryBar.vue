<script lang="ts" setup>
interface QueryType {
  label: string
  key: 'ongoing' | 'signing-up'
}

const active = ref<'ongoing' | 'signing-up'>('ongoing')
const types: QueryType[] = [
  {
    label: '进行中比赛',
    key: 'ongoing',
  },
  {
    label: '正在报名中',
    key: 'signing-up',
  },
]
const indexOfActive = computed(() => types.findIndex(item => item.key === active.value))
</script>

<template>
  <view relative flex>
    <view
      rounded="t-[20rpx]" absolute left-0 top-0 z-0 h-[82rpx] w-[210rpx] bg-white transition-all duration-200 :style="{
        transform: `translateX(calc(${indexOfActive} * 100%))`,
      }"
    />
    <view
      v-for="item, index in types"
      :key="index"
      z-1 h-[82rpx] w-[210rpx] flex items-center justify-center text-[30rpx] font-bold transition-all duration-200 :style="{
        ...(active === item.key ? {
          color: '#F97316',
        } : {
          color: '#00000070',
        }),
      }"
      @tap="active = item.key"
    >
      <text>
        {{ item.label }}
      </text>
    </view>
  </view>
</template>
