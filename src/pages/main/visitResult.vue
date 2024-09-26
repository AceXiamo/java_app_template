<script lang="ts" setup>
function submit() {
  toastRef.value?.success('提交成功')
}

const selectValue = ref<string | number>('')

function back() {
  uni.navigateBack()
}
</script>

<template>
  <view h-full flex flex-col>
    <VisitResultHead />
    <view h-0 flex flex-auto flex-col gap-[20rpx] p-[20rpx]>
      <MainVisitItem :show-all="true" :hide-button="true" />
      <view flex flex-col gap-[30rpx] rounded-[10rpx] bg-white p-[20rpx]>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:paper-clip-16-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              拜访结果
            </text>
          </view>
          <SelectBar v-model="selectValue" :options="[{ value: '1', label: '达成销售' }, { value: '2', label: '需要跟进' }, { value: '3', label: '无兴趣' }]" h-[60rpx] />
        </view>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:chat-bubble-left-ellipsis-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              详细描述
            </text>
          </view>
          <view box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <textarea placeholder="请输入详细描述" class="text-[26rpx]" />
          </view>
        </view>
      </view>
      <view flex justify-end gap-[20rpx]>
        <ClickButton type="primary" drop-shadow-lg @click="submit">
          提交
        </ClickButton>
        <ClickButton type="default" drop-shadow-lg @click="back">
          返回
        </ClickButton>
      </view>
    </view>
  </view>
</template>

<route lang="json">
{
  "layout": "home"
}
</route>
