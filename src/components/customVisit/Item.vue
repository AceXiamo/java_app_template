<script lang="ts" setup>
import { type CustomerVisit, saveCustomerVisit } from '@/api/customerVisit'

const props = defineProps<{
  item: CustomerVisit
}>()

const emit = defineEmits<{
  (e: 'reload'): void
  (e: 'assignTo', item: CustomerVisit): void
}>()

const statusMap: any = {
  0: { text: '待审核', color: 'bg-yellow-500' },
  1: { text: '已通过', color: 'bg-green-500' },
  2: { text: '已完成', color: 'bg-blue-500' },
  3: { text: '已驳回', color: 'bg-red-500' },
}

function assignTo() {
  emit('assignTo', props.item)
}

function reject() {
  confirmRef.value?.show({
    type: 'warning',
    title: '驳回记录',
    content: '确定驳回该记录吗？',
    onConfirm: () => {
      saveCustomerVisit({
        id: props.item.id,
        recordStatus: 3,
      }).then(() => {
        emit('reload')
        toastRef.value?.success('驳回成功')
      })
    },
  })
}

function toDetail() {
  setJumpData('customerVisit', props.item)
  uni.navigateTo({
    url: '/pages/my/customVisitDetail',
  })
}
</script>

<template>
  <view flex flex-col overflow-hidden rounded-[10rpx] bg-white>
    <view flex flex-col p-[20rpx] shadow-md>
      <view flex items-center>
        <text text-[28rpx] font-bold>
          {{ item.customerName }}
        </text>
        <view
          :class="statusMap[item.recordStatus ?? 0].color"
          ml-[10rpx] w-max rounded-[10rpx] px-[10rpx] py-[5rpx] text-[22rpx] text-white
        >
          {{ statusMap[item.recordStatus ?? 0].text }}
        </view>
        <view ml-auto flex items-center gap-[10rpx]>
          <ClickButton type="primary" size="medium" @click="toDetail">
            <view i-heroicons:information-circle mr-[10rpx] />
            <text>详情</text>
          </ClickButton>
          <template v-if="item.recordStatus === 0">
            <ClickButton size="medium" type="primary" @click="assignTo">
              指派
            </ClickButton>
            <ClickButton size="medium" type="danger" @click="reject">
              驳回
            </ClickButton>
          </template>
          <template v-else-if="item.recordStatus === 1">
            <ClickButton size="medium" type="primary" @click="assignTo">
              变更指派
            </ClickButton>
          </template>
        </view>
      </view>
    </view>
    <view bg-gray-200 p-[20rpx]>
      <view class="item" flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:building-office-2-solid text-[22rpx] text-gray-400 />
          <text>公司:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.customerCompany }}
        </text>
      </view>
      <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:phone-solid text-[22rpx] text-gray-400 />
          <text>联系电话:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.customerPhone }}
        </text>
      </view>
      <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:calendar-solid text-[22rpx] text-gray-400 />
          <text>访问时间:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.visitBegin }} - {{ item.visitEnd }}
        </text>
      </view>
      <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:document-text-solid text-[22rpx] text-gray-400 />
          <text>访问描述:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.visitDesc }}
        </text>
      </view>
      <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:user-solid text-[22rpx] text-gray-400 />
          <text>负责人:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.nickname }}
        </text>
      </view>
      <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:clock-solid text-[22rpx] text-gray-400 />
          <text>创建时间:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.createTime }}
        </text>
      </view>
    </view>
  </view>
</template>
