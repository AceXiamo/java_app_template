<script setup lang="ts">
import { useSettingStore } from '@/store/setting'
import logger from '@/utils/logger'

const setting = useSettingStore()
onLaunch(async () => {
  const res = uni.getMenuButtonBoundingClientRect()

  // #ifdef MP-WEIXIN
  setting.setTopH(res.top * 2)
  setting.setCapsuleH(res.height * 2)
  // #endif

  // #ifdef MP-ALIPAY
  setting.setTopH(res.top * 2)
  setting.setCapsuleH(res.height * 2)
  // #endif

  let info: any = null
  let isAppleAndHasLine = false
  // #ifdef MP-WEIXIN
  info = await uni.getDeviceInfo()
  if (info.model?.toLowerCase().includes('ip')) {
    const regex = /\d+/g
    const matches = info.model.match(regex)
    if (matches && matches.length > 0)
      isAppleAndHasLine = matches[0] > 8
    else isAppleAndHasLine = info.model.toLowerCase().includes('x')
  }

  // #endif

  // #ifdef MP-ALIPAY
  info = uni.getSystemInfoSync()
  if (info.model?.toLowerCase().includes('ip')) {
    const regex = /\d+/g
    const matches = info.model.match(regex)
    if (matches && matches.length > 0)
      isAppleAndHasLine = matches[0] > 8
    else isAppleAndHasLine = info.model.toLowerCase().includes('x')
  }
  // #endif

  setting.setIsAppleAndHasLine(isAppleAndHasLine)

  // 安全高度
  // #ifdef MP-ALIPAY
  const sysInfo: any = uni.getSystemInfoSync()
  const safeBottom = sysInfo.safeAreaInsets ? sysInfo.safeAreaInsets.bottom : 0
  setting.setSafeBottom(safeBottom * 2)
  // #endif

  console.log(setting.safeBottom)
})
</script>

<style>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  background-color: transparent;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
button::after {
  box-shadow: unset !important;
  border: none !important;
}
</style>
