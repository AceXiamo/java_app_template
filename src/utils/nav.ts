export function navTo(path: string, params?: any) {
  let url = path
  if (params) {
    const data = encodeURIComponent(JSON.stringify(params))
    url += `?data=${data}`
  }

  uni.navigateTo({
    url,
  })
}
