/**
 * @description Defines a set of functions to interact with the storage.
 */
interface StorageData {
  key: string
  value: any
  expires?: number
}

/**
 * @description Sets the value of the specified key in the storage.
 * @param _obj - The object containing the key, value and optional expiration time.
 */
function set(_obj: StorageData) {
  if (_obj.expires)
    _obj.expires = new Date().getTime() + _obj.expires
  uni.setStorageSync(_obj.key, _obj)
}

/**
 * @description Gets the value of the specified key from the storage.
 * @param key - The key to retrieve the value for.
 * @returns The value of the specified key, or null if the key does not exist or has expired.
 */
function get(key: string) {
  const data = uni.getStorageSync(key)
  if (data) {
    if (data.expires) {
      if (data.expires > new Date().getTime()) {
        return data.value
      }
      else {
        uni.removeStorageSync(key)
        return null
      }
    }
    else {
      return data.value
    }
  }
  else {
    return null
  }
}

/**
 * @description Removes the value of the specified key from the storage.
 * @param key - The key to remove the value for.
 */
function remove(key: string) {
  uni.removeStorageSync(key)
}

export default { set, get, remove }
