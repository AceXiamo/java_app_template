<script lang="ts" setup>
function back() {
  uni.navigateBack()
}
</script>

<template>
  <view a-container>
    <PageMyProfileHead />
    <view a-content p-[30rpx]>
      <FormInput label="姓名" :required="true" />
      <FormInput label="公司/品牌名称" :required="true" />
      <FormInput label="职位" :required="true" />
      <FormInput label="手机号码" :required="true" />
      <FormInput label="微信号" :required="true" />
      <FormInput label="身份证号码" :required="true" />
      <FormInput label="行业" />
      <FormInput label="个人介绍" type="textarea" :show-bottom-line="false" />
      <FormInput label="所需的资源/能提供的价值" type="textarea" :show-bottom-line="false" />
      <view mb-[50rpx] mt-[150rpx] flex gap-[30rpx]>
        <view box-border flex flex-1 items-center justify-center border border-gray-200 rounded-[50rpx] border-solid py-[20rpx] @click="back">
          <text text-[26rpx] text-gray-500 font-bold>
            取消
          </text>
        </view>
        <view flex flex-1 items-center justify-center rounded-[50rpx] bg-[#c6a95c] py-[20rpx]>
          <text text-[26rpx] text-white font-bold>
            保存
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json">
  {
    "layout": "home"
  }
  </route>
