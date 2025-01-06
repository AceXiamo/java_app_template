import dayjs from 'dayjs'
import { host, uploadFileToOss } from './alioss'

export function debounce(fn: any, delay: number) {
  let timer: any = null
  return function () {
    if (timer)
      clearTimeout(timer)

    timer = setTimeout(fn, delay)
  }
}

export function rankColor(index: number) {
  if (index === 1)
    return '#FFC107'
  else if (index === 2)
    return '#FF9800'
  else if (index === 3)
    return '#FF5722'
  else
    return '#898A8A'
}

export function formatAmount(amount?: number, suffix?: string) {
  return amount && amount > 0 ? `${amount.toFixed(2)}${suffix ? ` ${suffix}` : ''}` : '-'
}

export function generateFileName(suffix: string): string {
  const time = dayjs().format('YYYYMMDDHHmmss')
  const randomNum = Math.floor(Math.random() * 100)
  return `${time}${randomNum}.${suffix}`
}

export function uploadCoverToOSS(path: string) {
  const suffix = path.split('.').pop()
  const name = generateFileName(suffix || 'png')
  return uploadFileToOss(path, `custom_ma/cover/${dayjs().format('YYYY-MM-DD')}/${name}`)
}

export function uploadImageToOSS(path: string, module: string) {
  const suffix = path.split('.').pop()
  const name = generateFileName(suffix || 'png')
  return uploadFileToOss(path, `custom_ma/${module}/${dayjs().format('YYYY-MM-DD')}/${name}`)
}

export function handleImageUpload(imgs: string, form: Ref<any>, module: string = 'customer') {
  return new Promise((resolve) => {
    const images = imgs.split(',')
    const needUploadImages: string[] = []
    const uploadedImages: string[] = []
    const uploadPromises: Promise<string>[] = []
    images.forEach((url) => {
      if (url.includes('tmp'))
        needUploadImages.push(url)
      else
        uploadedImages.push(url)
    })

    if (needUploadImages.length > 0) {
      needUploadImages.forEach((url) => {
        uploadPromises.push(uploadImageToOSS(url, module))
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
