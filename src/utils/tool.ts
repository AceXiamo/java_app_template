import dayjs from 'dayjs'
import { uploadFileToOss } from './alioss'

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
  return uploadFileToOss(path, `vote_ma/cover/${dayjs().format('YYYY-MM-DD')}/${name}`)
}
