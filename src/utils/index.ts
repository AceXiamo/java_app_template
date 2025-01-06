import { host } from './request'

const jumpData: Map<string, any> = new Map()

function fileUrlReplace(path: string) {
  return `${host}/file/view${path}`
}
function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash)

  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
  return `#${'00000'.substring(0, 6 - c.length)}${c}`
}

function setJumpData(key: string, data: any) {
  jumpData.set(key, data)
}

function getJumpData(key: string) {
  const data = jumpData.get(key)
  jumpData.delete(key)
  return data
}

export { fileUrlReplace, stringToColor, setJumpData, getJumpData }
