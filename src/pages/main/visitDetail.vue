<script lang="ts" setup>
import { saveVisits } from '@/api/visits'
import type { Visits } from '@/api/visits'
import { host } from '@/utils/alioss'

const latitude = ref<number | string>('')
const longitude = ref<number | string>('')
const markers = ref<Marker[]>([])
const visits = ref<Visits>({})
const images = computed(() => visits.value.images?.split(',').map((url: string) => `${host}${url}`) ?? [])
const checkImages = computed(() => visits.value.checkImages?.split(',').map((url: string) => `${host}${url}`) ?? [])

function handleLocation() {
  latitude.value = visits.value.latitude!
  longitude.value = visits.value.longitude!
  markers.value = [
    {
      id: 1,
      latitude: Number(latitude.value),
      longitude: Number(longitude.value),
      iconPath: 'https://file.qwq.link/icon/miniapp/location.png',
      width: 30,
      height: 30,
    },
  ]
}

function toCommit() {
  setJumpData('visits', visits.value)
  uni.navigateTo({
    url: '/pages/main/visitResult',
  })
}

function startVisit() {
  if (visits.value.status === 0) {
    confirmRef.value?.show({
      title: '提示',
      content: '是否开始拜访？',
      confirmText: '开始拜访',
      cancelText: '取消',
      onConfirm: () => {
        uni.showLoading()
        visits.value.status = 1
        saveVisits(visits.value).then(() => {
          uni.hideLoading()
          uni.openLocation({
            latitude: Number(visits.value.latitude),
            longitude: Number(visits.value.longitude),
            name: visits.value.customerName,
          })
        })
      },
    })
  }
  else {
    uni.openLocation({
      latitude: Number(visits.value.latitude),
      longitude: Number(visits.value.longitude),
      name: visits.value.customerName,
    })
  }
}

function checkIn() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      uni.showLoading()
      uploadImageToOSS(res.tempFilePaths[0], 'checkin').then((url) => {
        const format = url.replace(host, '')
        visits.value.checkImages = visits.value.checkImages ? `${visits.value.checkImages},${format}` : format
        saveVisits(visits.value).then(() => {
          toastRef.value?.success('签到成功')
        }).finally(() => {
          uni.hideLoading()
        })
      })
    },
  })
}

function deletePhoto(index: number) {
  uni.vibrateShort({
    success: () => {
      const arr = checkImages.value.filter((_, i) => i !== index)
      visits.value.checkImages = arr.join(',')
      saveVisits(visits.value).then(() => {
        toastRef.value?.success('删除成功')
      })
    },
  })
}

function toThisLocation(e: { detail: { markerId: number } }) {
  const marker = markers.value.find(item => item.id === e.detail.markerId)
  uni.openLocation({
    latitude: marker?.latitude ?? 0,
    longitude: marker?.longitude ?? 0,
    name: visits.value.customerName,
  })
}

function handleImageClick(url: string) {
  uni.previewImage({
    urls: [url],
  })
}

function handleDeleteImage(index: number) {
  const arr = images.value.filter((_, i) => i !== index)
  visits.value.images = arr.join(',')
  saveVisits(visits.value).then(() => {
    toastRef.value?.success('删除成功')
  })
}

onMounted(() => {
  visits.value = getJumpData('visits') as Visits
  handleLocation()
})
</script>

<template>
  <view h-full flex flex-col>
    <VisitDetailHead />
    <view h-0 flex flex-auto flex-col gap-[20rpx] overflow-auto px-[20rpx] pb-[200rpx] pt-[20rpx]>
      <MainVisitItem :show-all="true" :hide-button="true" :item="visits" />
      <view bw-full grid grid-cols-3 gap-[20rpx]>
        <view
          v-for="url, index in images" :key="index" box-border aspect-square w-full flex items-center justify-center overflow-hidden border border-gray-300 rounded-[10rpx] border-solid @click="handleImageClick(url)" @longpress="handleDeleteImage(index)"
        >
          <image :src="url" mode="aspectFill" class="h-full w-full" />
        </view>
      </view>
      <view flex flex-col>
        <view h-[500rpx] w-full overflow-hidden rounded-[10rpx] bg-white>
          <map class="h-full w-full" :latitude="latitude" :longitude="longitude" :markers="markers" @markertap="toThisLocation" />
        </view>
        <text mt-[10rpx] text-[24rpx] text-gray-500>
          目的地 (张三), 点击标注打开地图
        </text>
        <view mt-[20rpx] flex flex-col gap-[10rpx] rounded-[15rpx] bg-white p-[20rpx]>
          <view flex items-start gap-[10rpx]>
            <view w-[140rpx] flex flex-none items-center gap-[10rpx] text-[24rpx] text-gray-500>
              <view i-carbon:location text-[22rpx] text-orange-500 />
              <text>地址:</text>
            </view>
            <text text-[24rpx] text-[#333]>
              {{ visits.location }}
            </text>
          </view>
          <view flex items-start gap-[10rpx]>
            <view w-[140rpx] flex flex-none items-center gap-[10rpx] text-[24rpx] text-gray-500>
              <view i-carbon:location-hazard text-[22rpx] text-orange-500 />
              <text>地址备注:</text>
            </view>
            <text text-[24rpx] text-[#333]>
              {{ visits.locationDesc }}
            </text>
          </view>
        </view>
      </view>
      <view
        grid grid-cols-4 gap-[10rpx] transition-all duration-300 :style="{
          height: checkImages.length > 0 ? '100rpx' : '0rpx',
        }"
      >
        <image v-for="(photo, index) in checkImages" :key="photo" :src="photo" mode="aspectFill" h-[100rpx] w-full rounded-[10rpx] @longpress="deletePhoto(index)" @click="handleImageClick(photo)" />
      </view>
      <view flex justify-end gap-[20rpx]>
        <ClickButton type="primary" drop-shadow-lg size="large" @click="startVisit">
          <view i-carbon:departure mr-[10rpx] text-[22rpx] />
          <text>前往</text>
        </ClickButton>
        <ClickButton v-if="visits.status === 1" type="primary" drop-shadow-lg size="large" @click="checkIn">
          <view i-carbon:checkmark-outline mr-[10rpx] text-[22rpx] />
          <text>到场签到</text>
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
