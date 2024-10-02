<script lang="ts" setup>
const selectValue = ref('1')

function submit() {
  console.log('submit')
}

function back() {
  uni.navigateBack()
}
</script>

<template>
  <view h-full flex flex-col>
    <EditUserHead />
    <view h-0 flex flex-auto flex-col gap-[20rpx] overflow-y-auto px-[20rpx] pb-[20rpx]>
      <view mt-[20rpx] flex flex-col gap-[30rpx] rounded-[10rpx] bg-white p-[20rpx]>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:phone-16-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              姓名
            </text>
            <text text-[30rpx] text-red-500>
              *
            </text>
          </view>
          <view box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <input type="text" placeholder="请输入姓名" class="text-[26rpx]">
          </view>
        </view>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:user-16-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              账号
            </text>
            <text text-[30rpx] text-red-500>
              *
            </text>
          </view>
          <view box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <input type="text" placeholder="请输入用户名" class="text-[26rpx]">
          </view>
        </view>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:lock-closed-16-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              密码
            </text>
            <text text-[30rpx] text-red-500>
              *
            </text>
          </view>
          <view box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <input type="text" placeholder="请输入密码" class="text-[26rpx]">
          </view>
        </view>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:adjustments-vertical-20-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              角色
            </text>
            <text text-[30rpx] text-red-500>
              *
            </text>
          </view>
          <SelectBar v-model="selectValue" :options="[{ value: '1', label: '管理员' }, { value: '2', label: '员工' }]" h-[76.78rpx] />
        </view>
      </view>
      <view flex flex-col gap-[10rpx]>
        <text text-[24rpx] text-gray-500>
          提示：管理员拥有所有权限，员工不可管理用户且拜访记录仅能产看到由自己产生的记录
        </text>
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
