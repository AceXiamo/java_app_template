<script lang="ts" setup>
import { type Customer, saveCustomer } from '@/api/customer'
import { host } from '@/utils/alioss'

const images = ref<string[]>([])
const markers = ref<Marker[]>([])
const mapSearchVal = ref('')
const showMapSearch = ref(false)
const searchWithDebounce = debounce(handleMapSearch, 1000)
const mapResult = ref<MapResult[]>([])
const latitude = ref(0)
const longitude = ref(0)
const form = ref<Customer>({})

function handleAddImage() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      images.value.push(...res.tempFilePaths)
      console.log(images.value)
    },
  })
}

function handleDeleteImage(index: number) {
  uni.vibrateShort({
    success: () => {
      images.value.splice(index, 1)
    },
  })
}

function handleMapSearch() {
  if (mapSearchVal.value) {
    uni.request({
      url: `https://restapi.amap.com/v3/assistant/inputtips?key=71e38cd17bc480d841eb195044145eb0&keywords=${mapSearchVal.value}`,
      success: (res: any) => {
        showMapSearch.value = true
        mapResult.value = res.data.tips
      },
    })
  }
}

function handleMapSearchResultClick(item: MapResult) {
  mapSearchVal.value = item.name
  showMapSearch.value = false
  const location = item.location.split(',')
  latitude.value = Number(location[1])
  longitude.value = Number(location[0])
  form.value.customerAddress = `${item.district}${item.address}`
  markers.value = [
    {
      id: 1,
      longitude: Number(location[0]),
      latitude: Number(location[1]),
      iconPath: 'https://file.qwq.link/icon/miniapp/location.png',
      width: 30,
      height: 30,
    },
  ]
}

function getLocation() {
  uni.getLocation({
    type: 'wgs84',
    success: (res) => {
      latitude.value = res.latitude
      longitude.value = res.longitude
    },
    fail: (err) => {
      logger.error(err)
    },
  })
}

onMounted(() => {
  const jumpData = getJumpData('customer')
  if (jumpData) {
    form.value = jumpData
    longitude.value = Number(jumpData.longitude)
    latitude.value = Number(jumpData.latitude)
    mapSearchVal.value = jumpData.customerAddress
    markers.value = [
      {
        id: 1,
        longitude: Number(jumpData.longitude),
        latitude: Number(jumpData.latitude),
        iconPath: 'https://file.qwq.link/icon/miniapp/location.png',
        width: 30,
        height: 30,
      },
    ]
    images.value = jumpData.images.split(',').map((url: string) => `${host}${url}`)
  }
  else {
    getLocation()
  }
})

function submit() {
  uni.showLoading()
  beforeSubmit().then((res) => {
    if (!res)
      return
    saveCustomer({
      ...form.value,
      latitude: latitude.value.toString(),
      longitude: longitude.value.toString(),
    }).then(() => {
      toastRef.value?.success('保存成功')
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    }).finally(() => {
      uni.hideLoading()
    })
  }).catch(() => {
    uni.hideLoading()
  })
}

function beforeSubmit(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!form.value.customerName) {
      toastRef.value?.error('请输入客户姓名')
      resolve(false)
    }
    if (!form.value.customerPhone) {
      toastRef.value?.error('请输入客户电话')
      resolve(false)
    }

    const needUploadImages: string[] = []
    const uploadedImages: string[] = []
    const uploadPromises: Promise<string>[] = []
    images.value.forEach((url) => {
      if (url.includes('tmp'))
        needUploadImages.push(url)
      else
        uploadedImages.push(url)
    })

    if (needUploadImages.length > 0) {
      needUploadImages.forEach((url) => {
        uploadPromises.push(uploadImageToOSS(url, 'customer'))
      })
      Promise.all(uploadPromises).then((res) => {
        const images = [
          ...(uploadedImages.map(url => url.replace(host, ''))),
          ...(res.map(url => url.replace(host, ''))),
        ]
        form.value.images = images.join(',')
        resolve(true)
      }).catch(() => {
        resolve(false)
      })
    }
    else {
      form.value.images = uploadedImages.map(url => url.replace(host, '')).join(',')
      resolve(true)
    }
  })
}

function handleImageClick(url: string) {
  uni.previewImage({
    urls: [url],
  })
}

function back() {
  uni.navigateBack()
}
</script>

<template>
  <view h-full flex flex-col>
    <CustomerEditHead />
    <view mt-[20rpx] h-0 flex flex-auto flex-col gap-[20rpx] overflow-y-auto px-[20rpx] pb-[200rpx]>
      <view flex flex-col gap-[30rpx] rounded-[10rpx] bg-white p-[20rpx]>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:user-16-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              客户姓名
            </text>
            <text text-[30rpx] text-red-500>
              *
            </text>
          </view>
          <view box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <input v-model="form.customerName" type="text" placeholder="请输入客户姓名" class="text-[26rpx]">
          </view>
        </view>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:phone-16-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              客户电话
            </text>
            <text text-[30rpx] text-red-500>
              *
            </text>
          </view>
          <view box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <input v-model="form.customerPhone" type="text" placeholder="请输入客户电话" class="text-[26rpx]">
          </view>
        </view>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:document-text-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              客户备注
            </text>
          </view>
          <view box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <textarea v-model="form.notes" placeholder="请输入客户备注" class="h-[100rpx] text-[26rpx]" />
          </view>
        </view>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:photo-16-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              图片
            </text>
          </view>
          <view bw-full grid grid-cols-3 gap-[20rpx]>
            <view
              v-for="url, index in images" :key="index" box-border aspect-square w-full flex items-center justify-center overflow-hidden border border-gray-300 rounded-[10rpx] border-solid @click="handleImageClick(url)" @longpress="handleDeleteImage(index)"
            >
              <image :src="url" mode="aspectFill" class="h-full w-full" />
            </view>
            <template v-if="images.length < 3">
              <view
                box-border aspect-square w-full flex items-center justify-center border border-gray-300 rounded-[10rpx] border-solid
                @click="handleAddImage"
              >
                <view i-heroicons:plus text-[30rpx] text-gray-500 />
              </view>
            </template>
          </view>
        </view>

        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-carbon:location-filled text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              客户地址
            </text>
          </view>
          <view relative box-border w-full flex items-center border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <input
              v-model="mapSearchVal" type="text" placeholder="键入文字以搜索" class="w-full text-[26rpx]" :style="{
                pointerEvents: showMapSearch ? 'none' : 'auto',
              }"
              @input="searchWithDebounce"
            >
            <view
              absolute right-[20rpx] transition-all duration-200 :style="{
                opacity: showMapSearch ? 1 : 0,
                pointerEvents: showMapSearch ? 'auto' : 'none',
              }"
            >
              <ClickButton size="medium" type="primary" @click="showMapSearch = false">
                收起
              </ClickButton>
            </view>
            <view
              :style="{
                bottom: showMapSearch ? '-20rpx' : '0',
                opacity: showMapSearch ? 1 : 0,
                pointerEvents: showMapSearch ? 'auto' : 'none',
              }"
              absolute bottom-[-20rpx] left-0 right-0 z-1 box-border max-h-[300rpx] flex flex-col translate-y-full gap-[10rpx] overflow-y-auto border border-gray-300 rounded-[10rpx] border-solid bg-white p-[10rpx] transition-all duration-200
            >
              <view v-for="item in mapResult" :key="item.id" box-border w-full rounded-[10rpx] p-[5rpx] text-[26rpx] @click="handleMapSearchResultClick(item)">
                {{ item.name }}
              </view>
            </view>
          </view>
          <view h-[500rpx] w-full>
            <map class="h-full w-full" :latitude="latitude" :longitude="longitude" :markers="markers" />
          </view>
        </view>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-carbon:location-hazard-filled text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              地址备注
            </text>
          </view>
          <view box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <input v-model="form.locationDesc" type="text" placeholder="请输入地址备注" class="text-[26rpx]">
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
