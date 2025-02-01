<script lang="ts" setup>
function toProfile() {
  uni.navigateTo({
    url: '/pages/my/profile',
  })
}

function toPoint() {
  uni.navigateTo({
    url: '/pages/my/point',
  })
}

function toOrder() {
  uni.navigateTo({
    url: '/pages/my/order',
  })
}

function toActivity() {
  uni.navigateTo({
    url: '/pages/my/activity',
  })
}

function toMember() {
  uni.navigateTo({
    url: '/pages/my/member',
  })
}

const visibleProfileCard = ref(false)
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto bg-[#EDEDED]>
    <PageMyHead />
    <view h-0 flex flex-1 flex-col gap-[20rpx] overflow-y-auto>
      <view relative px-[30rpx] pt-[30rpx]>
        <view h="[calc(50%+15rpx)]" absolute left-0 top-0 z-1 w-full bg-[#2e2e2e] />
        <view relative z-2 overflow-hidden rounded-lg bg-white pb-[30rpx]>
          <view flex items-center>
            <view w-max flex rounded-br-lg bg-[#c4aa5e] px-[20rpx] py-[12rpx] text-white>
              <text text-[24rpx]>
                联合创始人
              </text>
            </view>
            <view relative h-[58rpx] flex flex-auto items-center justify-end rounded-tl-lg pr-[30rpx]>
              <view absolute inset-0 z-[1] bg-[#c4aa5e] />
              <view absolute inset-0 z-[2] rounded-tl-[10rpx] bg-white />
              <view relative z-[3] flex gap-[50rpx] text-[24rpx] text-[#777777]>
                <text @click="toProfile">
                  编辑个人资料
                </text>
                <text @click="visibleProfileCard = true">
                  查看个人名片
                </text>
              </view>
            </view>
          </view>
          <view flex pl-[30rpx] pt-[30rpx]>
            <image src="https://axm.moe/avatar" h-[180rpx] w-[180rpx] rounded-full />
            <view ml-[30rpx] box-border h-[180rpx] flex flex-col py-[10rpx]>
              <view flex items-center>
                <text text-[32rpx]>
                  麦辰飞
                </text>
                <view
                  ml-[10rpx] h-[44rpx] w-[118rpx] flex scale-80 items-center justify-center bg-cover bg-center
                  class="bg-[url(https://joint-dev.oss-cn-shenzhen.aliyuncs.com/icon/my_background.png)]"
                >
                  <text text-[24rpx] text-white>
                    已实名
                  </text>
                </view>
              </view>
              <view mt-[10rpx] flex items-center gap-[30rpx] text-[26rpx] text-[#3a3a3a]>
                <text max-w-[240rpx] truncate>
                  Future Radio
                </text>
                <text>CEO</text>
              </view>
              <view mt-auto flex items-center gap-[15rpx]>
                <view flex border border-[#f2f2f2] rounded-[25rpx] border-solid px-[16rpx] py-[5rpx]>
                  <text text-[24rpx] text-[#9D9D9D]>
                    标签
                  </text>
                </view>
                <view flex border border-[#f2f2f2] rounded-[25rpx] border-solid px-[16rpx] py-[5rpx]>
                  <text text-[24rpx] text-[#9D9D9D]>
                    标签
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view mx-[30rpx] flex rounded-[8rpx] bg-white px-[30rpx] py-[26rpx] @click="toPoint">
        <AIcon icon="my_point" :size="40" />
        <text ml-[20rpx] text-[28rpx] text-[#3A3A3A]>
          我的积分
        </text>
        <AIcon icon="my_right" :size="40" ml-auto />
      </view>
      <view mx-[30rpx] flex rounded-[8rpx] bg-white px-[30rpx] py-[26rpx] @click="toActivity">
        <AIcon icon="my_flag" :size="40" />
        <text ml-[20rpx] text-[28rpx] text-[#3A3A3A]>
          我的活动
        </text>
        <AIcon icon="my_right" :size="40" ml-auto />
      </view>
      <view mx-[30rpx] flex rounded-[8rpx] bg-white px-[30rpx] py-[26rpx] @click="toOrder">
        <AIcon icon="my_order" :size="40" />
        <text ml-[20rpx] text-[28rpx] text-[#3A3A3A]>
          我的商城订单
        </text>
        <AIcon icon="my_right" :size="40" ml-auto />
      </view>
      <view mx-[30rpx] flex rounded-[8rpx] bg-white px-[30rpx] py-[26rpx] @click="toMember">
        <AIcon icon="my_member" :size="40" />
        <text ml-[20rpx] text-[28rpx] text-[#3A3A3A]>
          我的嘉宾
        </text>
        <AIcon icon="my_right" :size="40" ml-auto />
      </view>
      <view mx-[30rpx] flex rounded-[8rpx] bg-white px-[30rpx] py-[26rpx]>
        <AIcon icon="my_group" :size="40" />
        <text ml-[20rpx] text-[28rpx] text-[#3A3A3A]>
          我的俱乐部
        </text>
        <AIcon icon="my_right" :size="40" ml-auto />
      </view>
    </view>
    <CenterDialog v-model:visible="visibleProfileCard" :show-header="false" :with-padding="false" bg-color="transparent">
      <view flex flex-col>
        <view flex flex-col px-[50rpx] py-[60rpx] class="bg-[url(https://joint-dev.oss-cn-shenzhen.aliyuncs.com/icon/profile_card_image.png)] bg-cover bg-center">
          <image src="https://axm.moe/avatar" h-[180rpx] w-[180rpx] border border-white rounded-full border-solid />
          <text mt-[40rpx] text-white>
            AceXiamo
          </text>
          <view mt-[40rpx] flex flex-col>
            <text text-[24rpx] text-[#a77d6d]>
              企业
            </text>
            <text mt-[10rpx] text-[24rpx] text-white>
              Future Radio
            </text>
          </view>
          <view mt-[40rpx] flex flex-col>
            <text text-[24rpx] text-[#a77d6d]>
              职务
            </text>
            <text mt-[10rpx] text-[24rpx] text-white>
              CEO
            </text>
          </view>
          <view mt-[40rpx] flex flex-col>
            <text text-[24rpx] text-[#a77d6d]>
              联系电话
            </text>
            <text mt-[10rpx] text-[24rpx] text-white>
              18888888888
            </text>
          </view>
          <view mt-[20rpx] flex items-center justify-between gap-[30rpx]>
            <view h-[140rpx] flex flex-col justify-center>
              <text text-[24rpx] text-[#a77d6d]>
                主营业务
              </text>
              <text mt-[10rpx] text-[24rpx] text-white>
                软件开发，Web3 开发，区块链开发，Solana 开发
              </text>
            </view>
            <image flex-none src="https://axm.moe/avatar" ml-auto h-[140rpx] w-[140rpx] />
          </view>
        </view>
        <view mt-[30rpx] flex gap-[20rpx]>
          <view w-full flex-1 rounded-[50rpx] bg-[#e6e6e6] py-[20rpx] text-center text-[26rpx] text-[#737373] @click="visibleProfileCard = false">
            返回
          </view>
          <view w-full flex-1 rounded-[50rpx] bg-[#c6a95d] py-[20rpx] text-center text-[26rpx] text-white>
            保存到相册
          </view>
        </view>
      </view>
    </CenterDialog>
  </view>
</template>
