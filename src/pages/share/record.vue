<script lang="ts" setup>
import { listForCustomer, qrcode } from '@/api/submitVisit'
import { useUserStore } from '@/store/user'
import type { CustomerVisit } from '@/api/customerVisit'
import { host } from '@/utils/alioss'

const user = useUserStore()
const visitList = ref<CustomerVisit[]>([])

const statusMap: any = {
  0: { text: '待审核', color: 'bg-yellow-500' },
  1: { text: '已通过', color: 'bg-green-500' },
  2: { text: '已完成', color: 'bg-blue-500' },
  3: { text: '已驳回', color: 'bg-red-500' },
}

async function loadData() {
  const res = await listForCustomer({ openId: user.user.openId! })
  visitList.value = res.data.map((item: CustomerVisit) => ({
    ...item,
    customerFiles: item.customerFiles?.split(',').map(file => host + file).join(','),
  }))
}

function previewImage(file: string, item: CustomerVisit) {
  uni.previewImage({
    urls: item.customerFiles?.split(',') ?? [],
    current: file,
  })
}

function back() {
  uni.navigateBack()
}

const qrcodeVisible = ref(false)
const qrCodeBase64 = ref('')
function generateQrcode(id: number) {
  uni.showLoading()
  qrcode({ text: `custom_visit_${id}` }).then((res) => {
    uni.hideLoading()
    qrCodeBase64.value = `data:image/png;base64,${res.msg}`
    qrcodeVisible.value = true
  })
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <view h-full flex flex-col>
    <HeadBar bg-color="white">
      <view relative h-full flex items-center justify-center>
        <view i-heroicons:chevron-left-20-solid absolute left-[20rpx] text-[40rpx] text-black @click="back" />
        <text text-[30rpx] text-black>
          申请记录
        </text>
      </view>
    </HeadBar>
    <view
      class="h-0 flex flex-auto flex-col overflow-y-auto px-[20rpx] py-[20rpx]"
    >
      <view flex flex-col gap-[20rpx]>
        <template v-for="item in visitList" :key="item.id">
          <view flex flex-col overflow-hidden rounded-[10rpx] bg-white>
            <view flex p-[20rpx] shadow-md>
              <view flex items-center>
                <text text-[28rpx] font-bold>
                  {{ item.customerName }}
                </text>
                <view
                  :class="statusMap[item.recordStatus ?? 0].color"
                  ml-[10rpx] w-max rounded-[10rpx] px-[10rpx] py-[5rpx] text-[22rpx] text-white
                >
                  {{ statusMap[item.recordStatus ?? 0].text }}
                </view>
              </view>
              <view ml-auto>
                <ClickButton size="small" type="primary" label="访客码" @click="generateQrcode(item.id!)" />
              </view>
            </view>
            <view bg-gray-200 p-[20rpx]>
              <view class="item" flex items-center gap-[10rpx]>
                <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
                  <view i-heroicons:building-office-2-solid text-[22rpx] text-gray-400 />
                  <text>公司:</text>
                </view>
                <text text-[24rpx] text-[#333]>
                  {{ item.customerCompany }}
                </text>
              </view>
              <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
                <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
                  <view i-heroicons:phone-solid text-[22rpx] text-gray-400 />
                  <text>联系电话:</text>
                </view>
                <text text-[24rpx] text-[#333]>
                  {{ item.customerPhone }}
                </text>
              </view>
              <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
                <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
                  <view i-heroicons:calendar-solid text-[22rpx] text-gray-400 />
                  <text>访问时间:</text>
                </view>
                <text text-[24rpx] text-[#333]>
                  {{ item.visitBegin }} - {{ item.visitEnd }}
                </text>
              </view>
              <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
                <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
                  <view i-heroicons:document-text-solid text-[22rpx] text-gray-400 />
                  <text>访问描述:</text>
                </view>
                <text text-[24rpx] text-[#333]>
                  {{ item.visitDesc }}
                </text>
              </view>
              <template v-if="item.recordStatus === 1">
                <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
                  <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
                    <view i-heroicons:user-solid text-[22rpx] text-gray-400 />
                    <text>负责人:</text>
                  </view>
                  <text text-[24rpx] text-[#333]>
                    {{ item.nickname }}
                  </text>
                </view>
              </template>
              <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
                <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
                  <view i-heroicons:clock-solid text-[22rpx] text-gray-400 />
                  <text>创建时间:</text>
                </view>
                <text text-[24rpx] text-[#333]>
                  {{ item.createTime }}
                </text>
              </view>
              <view mt-[10rpx] flex items-start gap-[10rpx]>
                <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
                  <view i-heroicons:paper-clip-solid text-[22rpx] text-gray-400 />
                  <text>附件:</text>
                </view>
                <view flex flex-wrap gap-[10rpx]>
                  <image
                    v-for="(file, index) in (item.customerFiles?.split(',') ?? [])"
                    :key="index"
                    :src="file"
                    mode="aspectFill"
                    class="h-[150rpx] w-[150rpx] rounded-[10rpx]"
                    @click="previewImage(file, item)"
                  />
                </view>
              </view>
            </view>
          </view>
        </template>
      </view>
    </view>
    <CenterDialog :visible="qrcodeVisible" width="550rpx" @update:visible="qrcodeVisible = $event" @close="qrcodeVisible = false">
      <view flex flex-col items-center justify-center gap-[20rpx]>
        <image :src="qrCodeBase64" mode="aspectFill" class="h-[400rpx] w-[400rpx]" />
        <view flex justify-center>
          <text text-[24rpx] text-gray-400 font-medium>
            提示: 长按图片保存到相册
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
