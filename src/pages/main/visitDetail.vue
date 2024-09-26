<script lang="ts" setup>
interface Marker {
  id: number
  latitude: number
  longitude: number
  iconPath?: string
  width?: number
  height?: number
}

const latitude = ref<number | string>('')
const longitude = ref<number | string>('')
const markers = ref<Marker[]>([])

function getLocation() {
  uni.getLocation({
    type: 'wgs84',
    success: (res) => {
      latitude.value = res.latitude
      longitude.value = res.longitude
      markers.value = [
        {
          id: 1,
          latitude: res.latitude,
          longitude: res.longitude,
          iconPath: 'https://file.qwq.link/icon/miniapp/location.png',
          width: 30,
          height: 30,
        },
      ]
    },
    fail: (err) => {
      logger.error(err)
    },
  })
}

function toCommit() {
  uni.navigateTo({
    url: '/pages/main/visitResult',
  })
}

function startVisit() {
  confirmRef.value?.show({
    title: '提示',
    content: '是否开始拜访？',
    confirmText: '开始拜访',
    cancelText: '取消',
    onConfirm: () => {
      uni.navigateTo({
        url: '/pages/main/visitResult',
      })
    },
  })
}

function checkIn() {
  toastRef.value?.success('签到成功')
}

function toThisLocation(e: { detail: { markerId: number } }) {
  const marker = markers.value.find(item => item.id === e.detail.markerId)
  uni.openLocation({
    latitude: marker?.latitude ?? 0,
    longitude: marker?.longitude ?? 0,
    name: '目的地 (张三)',
  })
}

onMounted(() => {
  getLocation()
})
</script>

<template>
  <view h-full flex flex-col>
    <VisitDetailHead />
    <view h-0 flex flex-auto flex-col gap-[20rpx] p-[20rpx]>
      <MainVisitItem :show-all="true" :hide-button="true" />
      <view flex flex-col>
        <view h-[500rpx] w-full overflow-hidden rounded-[10rpx] bg-white>
          <map class="h-full w-full" :latitude="latitude" :longitude="longitude" :markers="markers" @markertap="toThisLocation" />
        </view>
        <text mt-[10rpx] text-[24rpx] text-gray-500>
          目的地 (张三), 点击标注打开地图
        </text>
        <view mt-[20rpx] rounded-[15rpx] bg-white p-[20rpx]>
          <view flex items-center gap-[10rpx]>
            <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
              <view i-carbon:location text-[22rpx] text-orange-500 />
              <text>地址备注:</text>
            </view>
            <text text-[24rpx] text-[#333]>
              20栋1单元101
            </text>
          </view>
        </view>
      </view>
      <view flex justify-end gap-[20rpx]>
        <ClickButton type="primary" drop-shadow-lg size="large" @click="checkIn">
          <view i-carbon:checkmark-outline mr-[10rpx] text-[22rpx] />
          <text>到场签到</text>
        </ClickButton>
        <ClickButton type="primary" drop-shadow-lg size="large" @click="startVisit">
          <view i-carbon:departure mr-[10rpx] text-[22rpx] />
          <text>前往</text>
        </ClickButton>
        <ClickButton type="primary" drop-shadow-lg size="large" @click="toCommit">
          <view i-heroicons:pencil-square-solid mr-[10rpx] text-[22rpx] />
          <text>提交拜访信息</text>
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
