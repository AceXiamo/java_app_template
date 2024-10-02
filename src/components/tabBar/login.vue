<script lang="ts" setup>
import { useUserStore } from '@/store/user'
import { loginByPwd } from '@/api/user'

const heightOfDesc = ref(568)
const heightOfLogin = ref(413.56)
const userStore = useUserStore()

const active = ref<'login' | 'desc'>('login')
const form = ref({
  username: '',
  password: '',
})

function login() {
  loginByPwd(form.value).then((res) => {
    userStore.saveToken(res.token)
  }).catch((err) => {
    toastRef.value?.error(err)
  })
}
</script>

<template>
  <view relative h-full flex flex-col items-center justify-center>
    <view
      absolute left-0 right-0 top-0 z-0 h-[400px] bg-white
      style="background-image: linear-gradient(to bottom, #1A89FA 70%, #F5F5F5)"
    />
    <view
      z-1 w-[70%] rounded-lg bg-white p-[30rpx]
      :style="{ height: active === 'login' ? `${heightOfLogin}rpx` : `${heightOfDesc}rpx` }"
    >
      <template v-if="active === 'login'">
        <view flex items-center gap-[20rpx]>
          <view i-heroicons:finger-print-20-solid text-[30rpx] text-blue-500 />
          <text text-[32rpx] font-bold>
            登录
          </text>
        </view>
        <view mt-[30rpx] flex flex-col gap-[20rpx]>
          <view flex flex-col gap-[10rpx]>
            <text text-[26rpx] font-bold>
              账号
            </text>
            <view border border-gray-300 rounded-[5rpx] border-solid p-[10rpx_15rpx] text-[28rpx]>
              <input v-model="form.username" type="text" placeholder="请输入账号">
            </view>
          </view>
          <view flex flex-col gap-[10rpx]>
            <text text-[26rpx] font-bold>
              密码
            </text>
            <view border border-gray-300 rounded-[5rpx] border-solid p-[10rpx_15rpx] text-[28rpx]>
              <input v-model="form.password" type="password" placeholder="请输入密码">
            </view>
          </view>
        </view>
      </template>
      <template v-else>
        <view flex items-center gap-[20rpx]>
          <view i-heroicons:bookmark text-[30rpx] text-blue-500 />
          <text text-[32rpx] font-bold>
            介绍
          </text>
        </view>
        <view mt-[30rpx] flex flex-col gap-[20rpx]>
          <view flex items-center>
            <view w-[150rpx] flex items-center>
              <text text-[26rpx] text-gray-500>
                小程序:
              </text>
            </view>
            <text text-[26rpx] text-[#333]>
              云拜访
            </text>
          </view>
          <view flex items-start>
            <view w-[150rpx] flex flex-none items-center>
              <text text-[26rpx] text-gray-500>
                简介:
              </text>
            </view>
            <text text-[26rpx] text-[#333]>
              云拜访是一款基于微信小程序的拜访管理工具，旨在帮助企业高效地管理销售拜访活动。
            </text>
          </view>
          <view flex items-start>
            <view w-[150rpx] flex flex-none items-center>
              <text text-[26rpx] text-gray-500>
                商务咨询:
              </text>
            </view>
            <text mr-[10rpx] text-[26rpx] text-[#333]>
              vx:
            </text>
            <text mr-[10rpx] text-[26rpx] text-emerald-500>
              AceXiamo
            </text>
            <view i-twemoji:envelope-with-arrow text-[26rpx] />
          </view>
          <view flex items-start>
            <view w-[150rpx] flex flex-none items-center>
              <text text-[26rpx] text-gray-500>
                试用账户:
              </text>
            </view>
            <text text-[26rpx] text-[#333]>
              user / 123456
            </text>
          </view>
          <view flex items-start>
            <view w-[150rpx] flex flex-none items-center>
              <text text-[26rpx] text-gray-500>
                注意:
              </text>
            </view>
            <text text-[26rpx] text-orange-400>
              试用账户仅用于体验，数据会在每天进行重置，请勿填写重要信息
            </text>
          </view>
        </view>
      </template>
      <view mt-[30rpx] flex justify-end>
        <view v-if="active === 'login'" flex gap-[20rpx]>
          <ClickButton type="primary" size="large" @click="login">
            登录
          </ClickButton>
          <ClickButton type="default" size="large" @click="active = 'desc'">
            简介
          </ClickButton>
        </view>
        <view v-else>
          <ClickButton type="default" size="large" @click="active = 'login'">
            返回
          </ClickButton>
        </view>
      </view>
    </view>
  </view>
</template>
