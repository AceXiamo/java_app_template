<script lang="ts" setup>
const showEditDialog = ref(false)

function toList() {
  uni.navigateTo({
    url: '/pages/activity/list',
  })
}
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto>
    <PageActivityReleaseHead />
    <view h-0 flex-1 overflow-y-auto>
      <view p-[30rpx]>
        <FormImage label="活动主图" :required="true" :limit="1" />
        <FormInput label="活动主题" placeholder=" " :required="true" />
        <FormDate label="活动时间" :required="true">
          <template #suffix>
            <view i-heroicons:chevron-down-16-solid />
          </template>
        </FormDate>
        <FormDate label="报名截止时间" :required="true">
          <template #suffix>
            <view i-heroicons:chevron-down-16-solid />
          </template>
        </FormDate>
        <FormSelect label="是否上架" :required="true" :options="[{ label: '上架', value: 1 }, { label: '下架', value: 0 }]">
          <template #suffix>
            <view i-heroicons:chevron-down-16-solid />
          </template>
        </FormSelect>
        <FormInput label="活动介绍" :required="true" type="textarea" />
        <FormInput label="注意事项" type="textarea" />
        <view my-[30rpx] w-full flex items-center gap-[5rpx]>
          <text text-[26rpx] text-[#3a3a3a] font-bold>
            显式评论
          </text>
          <view ml-auto>
            <view i-heroicons:plus-circle text-[40rpx] text-[#C4AA5E] @click="showEditDialog = true" />
          </view>
        </view>
        <view flex gap-[20rpx] border border-gray-200 rounded-[10rpx] border-solid p-[30rpx]>
          <view flex flex-col items-center>
            <image src="https://axm.moe/avatar" h-[116rpx] w-[116rpx] rounded-full />
            <text mt-[10rpx] text-[24rpx] text-[#3A3A3A]>
              林倩如
            </text>
            <view flex flex-auto items-center gap-[2rpx]>
              <ARating :max-stars="5" :model-value="4" />
            </view>
          </view>
          <view flex flex-col>
            <text text-[24rpx] text-[#12121260]>
              活动：XXX美容活动
            </text>
            <text mt-[10rpx] text-[26rpx] text-[#121212]>
              组织方太棒了，特别喜欢，希望下次还有机会
            </text>
            <view grid grid-cols-3 mt-[20rpx] gap-[20rpx]>
              <view
                aspect-square w-full rounded-[10rpx] bg-cover bg-center :style="{
                  backgroundImage: 'url(https://axm.moe/avatar)',
                }"
              />
              <view
                aspect-square w-full rounded-[10rpx] bg-cover bg-center :style="{
                  backgroundImage: 'url(https://axm.moe/avatar)',
                }"
              />
              <view
                aspect-square w-full rounded-[10rpx] bg-cover bg-center :style="{
                  backgroundImage: 'url(https://axm.moe/avatar)',
                }"
              />
            </view>
          </view>
        </view>
        <view mt-[40rpx] flex gap-[20rpx] border border-gray-200 rounded-[10rpx] border-solid p-[30rpx]>
          <view flex flex-col items-center>
            <image src="https://axm.moe/avatar" h-[116rpx] w-[116rpx] rounded-full />
            <text mt-[10rpx] text-[24rpx] text-[#3A3A3A]>
              林倩如
            </text>
            <view flex flex-auto items-center gap-[2rpx]>
              <AIcon icon="star" :size="32" />
              <AIcon icon="star" :size="32" />
              <AIcon icon="star" :size="32" />
              <AIcon icon="star_empty" :size="32" />
              <AIcon icon="star_empty" :size="32" />
            </view>
          </view>
          <view flex flex-col>
            <text text-[24rpx] text-[#12121260]>
              活动：XXX美容活动
            </text>
            <text mt-[10rpx] text-[26rpx] text-[#121212]>
              组织方太棒了，特别喜欢，希望下次还有机会
            </text>
            <view grid grid-cols-3 mt-[20rpx] gap-[20rpx]>
              <view
                aspect-square w-full rounded-[10rpx] bg-cover bg-center :style="{
                  backgroundImage: 'url(https://axm.moe/avatar)',
                }"
              />
              <view
                aspect-square w-full rounded-[10rpx] bg-cover bg-center :style="{
                  backgroundImage: 'url(https://axm.moe/avatar)',
                }"
              />
              <view
                aspect-square w-full rounded-[10rpx] bg-cover bg-center :style="{
                  backgroundImage: 'url(https://axm.moe/avatar)',
                }"
              />
            </view>
          </view>
        </view>
        <view my-[30rpx] flex items-center gap-[5rpx]>
          <text text-[26rpx] text-[#3a3a3a] font-bold>
            设定价格
          </text>
          <text text-[26rpx] text-[#fc243b]>
            *
          </text>
        </view>
        <FormInput label="总票数" type="number" placeholder=" " />
        <FormInput label="早鸟票" type="number" placeholder=" " />
        <FormInput label="数量" type="number" placeholder=" " />
        <FormInput label="双人票" type="number" placeholder=" " />
        <FormInput label="原票价" type="number" placeholder=" " />
        <FormInput label="初始销量" type="number" placeholder=" " />
        <FormInput label="推广人分润比例" type="number" placeholder=" ">
          <template #suffix>
            <text text-[26rpx] text-[#3a3a3a]>
              %
            </text>
          </template>
        </FormInput>
        <FormInput label="初始人分润比例" type="number" placeholder=" ">
          <template #suffix>
            <text text-[26rpx] text-[#3a3a3a]>
              %
            </text>
          </template>
        </FormInput>
        <FormInput label="平台分润比例" type="number" placeholder=" ">
          <template #suffix>
            <text text-[26rpx] text-[#3a3a3a]>
              %
            </text>
          </template>
        </FormInput>
        <FormImage label="推广海报(默认右下角需留空白显示二维码)" :required="true" :limit="1" layout="vertical" :show-bottom-line="false" />
        <view my-[30rpx] flex gap-[30rpx]>
          <view box-border flex flex-1 items-center justify-center border border-gray-200 rounded-[50rpx] border-solid py-[20rpx] @click="toList">
            <text text-[26rpx] text-gray-500 font-bold>
              活动列表
            </text>
          </view>
          <view flex flex-1 items-center justify-center rounded-[50rpx] bg-[#c6a95c] py-[20rpx]>
            <text text-[26rpx] text-white font-bold>
              发布
            </text>
          </view>
        </view>
      </view>
    </view>
    <CenterDialog title="编辑评论" :show-header="true" :visible="showEditDialog" @close="showEditDialog = false" @update:visible="showEditDialog = $event">
      <view flex flex-col>
        <FormImage label="头像" :limit="1" />
        <FormInput label="姓名" />
        <FormInput label="评论" type="textarea" />
        <FormImage label="评论图片" :limit="3" layout="vertical" :show-bottom-line="false" />
        <view flex items-center justify-between>
          <text text-[26rpx] text-[#3a3a3a]>
            评分
          </text>
          <ARating label="评分" :max-stars="5" :model-value="4" />
        </view>
        <view mt-[40rpx] flex items-center justify-center gap-[20rpx] rounded-[10rpx] bg-[#c4aa5e] p-[20rpx] @click="showEditDialog = false">
          <text text-[26rpx] text-white font-bold>
            提交
          </text>
        </view>
        <view mt-[20rpx] box-border flex items-center justify-center gap-[20rpx] border border-gray-200 rounded-[10rpx] border-solid p-[20rpx] @click="showEditDialog = false">
          <text text-[26rpx] text-[#3a3a3a] font-bold>
            取消
          </text>
        </view>
      </view>
    </CenterDialog>
  </view>
</template>

<route lang="json">
  {
    "layout": "home"
  }
  </route>
