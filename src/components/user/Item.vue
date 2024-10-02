<script lang="ts" setup>
function toEdit() {
  uni.navigateTo({
    url: '/pages/my/editUser',
  })
}

function handleDelete() {
  confirmRef.value?.show({
    type: 'warning',
    title: '删除用户',
    content: '确定删除该用户吗？',
    onConfirm: () => {
      logger.success('删除成功')
    },
  })
}

function changePassword() {
  inputConfirmRef.value?.show({
    title: '修改密码',
    type: 'info',
    placeholder: '请输入新密码',
    onConfirm: (value) => {
      logger.success(value)
    },
  })
}
</script>

<template>
  <view flex flex-col overflow-hidden rounded-[10rpx] bg-white>
    <view item-center flex p-[20rpx] shadow-md>
      <view i-heroicons:user-circle-16-solid mr-[10rpx] text-[30rpx] text-blue-500 />
      <text text-[28rpx] font-bold>
        AceXiamo
      </text>
      <view ml-[10rpx]>
        <view w-max rounded-[10rpx] bg-emerald-500 px-[10rpx] py-[5rpx] text-[22rpx] text-white>
          管理员
        </view>
      </view>
      <view ml-auto flex items-center gap-[10rpx]>
        <ClickButton size="medium" type="warning" @click="changePassword">
          重置密码
        </ClickButton>
        <ClickButton size="medium" type="primary" @click="toEdit">
          编辑
        </ClickButton>
        <ClickButton size="medium" type="danger" @click="handleDelete">
          删除
        </ClickButton>
      </view>
    </view>
    <view bg-gray-200 p-[20rpx]>
      <view class="item" flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:phone-solid text-[22rpx] text-gray-400 />
          <text>联系电话:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          12312341234
        </text>
      </view>
      <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-carbon:location-filled text-[22rpx] text-gray-400 />
          <text>创建时间:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          2024-05-01 12:00:00
        </text>
      </view>
    </view>
  </view>
</template>
