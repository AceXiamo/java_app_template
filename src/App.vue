<script setup lang="ts">
import { useSettingStore } from '@/store/setting'

const setting = useSettingStore()
onLaunch(async () => {
  const res = uni.getMenuButtonBoundingClientRect()
  // to rpx
  setting.setTopH(res.top * 2)
  setting.setCapsuleH(res.height * 2)

  const info: any = await uni.getSystemInfo()
  let isAppleAndHasLine = false
  if (info.model?.toLowerCase().includes('ip')) {
    const regex = /\d+/g
    const matches = info.model.match(regex)
    if (matches && matches.length > 0)
      isAppleAndHasLine = matches[0] > 8
    else
      isAppleAndHasLine = info.model.toLowerCase().includes('x')
  }
  setting.setIsAppleAndHasLine(isAppleAndHasLine)
})
</script>
