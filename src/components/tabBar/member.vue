<script lang="ts" setup>
const activeTab = ref(0)
const tabs = ['联创', '会员', '创客', '分享嘉宾']

const memberList = ref([
  {
    avatar: 'https://axm.moe/avatar',
    name: '姓名',
    industry: 'XXXX',
    company: 'XXXX公司',
    position: '总经理',
    tags: ['标签文案', '标签文案', '标签文案'],
  },
  {
    avatar: 'https://axm.moe/avatar',
    name: '姓名',
    industry: 'XXXX',
    company: 'XXXX公司',
    position: '总经理',
    tags: ['标签文案', '标签文案', '标签文案'],
  },
])

const showMobile = ref(false)
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto>
    <PageMemberHead />
    <view h-0 flex-1 overflow-y-auto>
      <!-- 搜索框 -->
      <view class="px-[30rpx] pt-[30rpx]">
        <view class="flex items-center border border-[#DADADA] rounded-full border-solid px-[20rpx] py-[12rpx]">
          <view i-heroicons-magnifying-glass-20-solid text-lg text-gray-400 />
          <input
            type="text"
            placeholder="请输入搜索关键词"
            class="ml-2 flex-1 text-[26rpx]"
          >
        </view>
      </view>

      <!-- 主题标签栏 -->
      <view class="hide-scrollbar mt-[35rpx] flex overflow-x-auto border-b border-gray-100 px-[30rpx]">
        <view
          v-for="(tab, index) in tabs"
          :key="index"
          class="relative w-[25%] flex-none pb-[20rpx] text-center text-[#847855]"
          :class="{ '!text-[#091722] font-bold': activeTab === index }"
          @tap="activeTab = index"
        >
          <text class="text-[28rpx]">
            {{ tab }}
          </text>
          <view
            class="absolute bottom-0 left-0 right-0 mx-auto h-[4rpx] w-[40rpx] translate-y-[calc(-100%+10rpx)] rounded-[10rpx] bg-[#3A3A3A] opacity-0"
            :class="{ '!opacity-100 !-translate-y-full': activeTab === index }"
            transition="all 0.3s"
          />
        </view>
      </view>

      <view mt-[30rpx] flex flex-col gap-[30rpx]>
        <view
          v-for="(member, index) in memberList"
          :key="index"
          class="member-card mx-[30rpx] border border-[#F2F2F2] rounded-lg border-solid bg-white p-[30rpx]"
          style="box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2)"
        >
          <view class="h-[180rpx] flex items-start">
            <image
              :src="member.avatar"
              class="h-[180rpx] w-[180rpx] rounded-lg object-cover"
            />
            <view class="box-border h-full flex flex-1 flex-col items-end px-[30rpx] py-[15rpx]">
              <text class="text-[36rpx] text-[#3A3A3A] font-medium">
                {{ member.name }}
              </text>
              <text class="mt-auto text-[24rpx] text-gray-500">
                行业：{{ member.industry }}
              </text>
              <text class="mt-[10rpx] text-[24rpx] text-gray-500">
                {{ member.company }} {{ member.position }}
              </text>
            </view>
          </view>
          <view class="mt-[20rpx] flex">
            <text
              v-for="(tag, tagIndex) in member.tags"
              :key="tagIndex"
              class="mr-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500"
            >
              {{ tag }}
            </text>
          </view>
          <view class="mt-[30rpx] flex justify-end border-t border-t-[#F2F2F2] border-t-solid pt-[24rpx]">
            <view class="rounded-full bg-[#C6A95D] px-4 py-2 text-sm text-white" @tap="showMobile = true">
              查看联系方式
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
  <CenterDialog :visible="showMobile" :show-header="false" @close="showMobile = false" @update:visible="showMobile = $event">
    <view flex flex-col pt-[20rpx]>
      <view text-center>
        <text text-[30rpx] text-[#3a3a3a]>
          办理会员即可查看联创 / 会员联系方式
        </text>
      </view>
      <view flex justify-between mt-[80rpx] gap-[20rpx]>
        <view w-max flex-1 py-[20rpx] rounded-[50rpx] border border-solid border-[#E6E6E6] box-border text-center @tap="showMobile = false">
          <text text-[#737373] text-[28rpx]>我知道了</text>
        </view>
        <view w-max flex-1 py-[20rpx] rounded-[50rpx] bg-[#C6A95D] text-center>
          <text text-white text-[28rpx]>办理会员</text>
        </view>
      </view>
    </view>
  </CenterDialog>
</template>
