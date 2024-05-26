<script lang="ts" setup>
import QRCode from 'qrcode'
import type { CSSProperties } from 'vue'

const props = defineProps<{
  text: string
  style?: CSSProperties
}>()
const qrSVG = ref<string>('')
onMounted(() => {
  QRCode.toString(props.text, { type: 'svg', margin: 2 }, (error, svg) => {
    if (error) {
      console.error(error)
      return
    }
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    qrSVG.value = svgDataUrl
  })
})
</script>

<template>
  <image :src="qrSVG" :style="$props.style" />
</template>
