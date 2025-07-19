/**
 * 文件上传功能测试和使用示例
 * 这个文件展示了如何使用新的文件上传功能
 */

import {
  UploadType,
  uploadAvatar,
  uploadIdCard,
  uploadMultipleFiles,
  uploadVehicleImage,
} from './upload'

// 示例：上传头像
export async function testUploadAvatar() {
  try {
    // 选择图片文件
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
    })

    if (res.tempFilePaths && res.tempFilePaths.length > 0) {
      const filePath = res.tempFilePaths[0]

      // 显示上传进度
      uni.showLoading({ title: '上传中...' })

      const avatarUrl = await uploadAvatar(filePath, ({ progress }) => {
        console.log(`上传进度: ${progress}%`)
      })

      uni.hideLoading()
      uni.showToast({ title: '上传成功', icon: 'success' })

      console.log('头像上传成功:', avatarUrl)
      return avatarUrl
    }
  }
  catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '上传失败', icon: 'error' })
    console.error('头像上传失败:', error)
    throw error
  }
}

// 示例：上传身份证
export async function testUploadIdCard() {
  try {
    // 选择两张图片（正面和反面）
    const res = await uni.chooseImage({
      count: 2,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
    })

    if (res.tempFilePaths && res.tempFilePaths.length >= 2) {
      const [frontPath, backPath] = res.tempFilePaths

      uni.showLoading({ title: '上传中...' })

      const frontUrl = await uploadIdCard(frontPath, 'front', ({ progress }) => {
        console.log(`身份证正面上传进度: ${progress}%`)
      })

      const backUrl = await uploadIdCard(backPath, 'back', ({ progress }) => {
        console.log(`身份证反面上传进度: ${progress}%`)
      })

      uni.hideLoading()
      uni.showToast({ title: '上传成功', icon: 'success' })

      console.log('身份证上传成功:', { frontUrl, backUrl })
      return { frontUrl, backUrl }
    }
    else {
      throw new Error('请选择两张图片（正面和反面）')
    }
  }
  catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '上传失败', icon: 'error' })
    console.error('身份证上传失败:', error)
    throw error
  }
}

// 示例：批量上传多个文件
export async function testUploadMultipleFiles() {
  try {
    // 选择多张图片
    const res = await uni.chooseImage({
      count: 5,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
    })

    if (res.tempFilePaths && res.tempFilePaths.length > 0) {
      // 准备上传文件列表
      const files = res.tempFilePaths.map((filePath, index) => ({
        filePath,
        type: UploadType.OTHER,
        customFileName: `test_file_${index + 1}.jpg`,
      }))

      uni.showLoading({ title: '批量上传中...' })

      const urls = await uploadMultipleFiles(files, ({ progress, current, total }) => {
        console.log(`批量上传进度: ${progress}% (${current}/${total})`)
        uni.showLoading({ title: `上传中 ${current}/${total}` })
      })

      uni.hideLoading()
      uni.showToast({ title: '批量上传成功', icon: 'success' })

      console.log('批量上传成功:', urls)
      return urls
    }
  }
  catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '批量上传失败', icon: 'error' })
    console.error('批量上传失败:', error)
    throw error
  }
}

// 示例：在页面中使用文件上传
export const uploadExamples = {
  // 头像上传示例
  async handleAvatarUpload() {
    try {
      const avatarUrl = await testUploadAvatar()
      // 这里可以调用 profile API 更新头像
      // await updateUserProfile({ avatar: avatarUrl })
    }
    catch (error) {
      console.error('头像更新失败:', error)
    }
  },

  // 身份证上传示例
  async handleIdCardUpload() {
    try {
      const { frontUrl, backUrl } = await testUploadIdCard()
      // 这里可以调用认证 API
      // await uploadIDCard(frontUrl, backUrl)
    }
    catch (error) {
      console.error('身份证上传失败:', error)
    }
  },

  // 车辆图片上传示例
  async handleVehicleImageUpload(vehicleId: string) {
    try {
      const res = await uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album'],
      })

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        const filePath = res.tempFilePaths[0]

        uni.showLoading({ title: '上传中...' })

        const imageUrl = await uploadVehicleImage(filePath, vehicleId, ({ progress }) => {
          console.log(`车辆图片上传进度: ${progress}%`)
        })

        uni.hideLoading()
        uni.showToast({ title: '上传成功', icon: 'success' })

        console.log('车辆图片上传成功:', imageUrl)
        return imageUrl
      }
    }
    catch (error) {
      uni.hideLoading()
      uni.showToast({ title: '上传失败', icon: 'error' })
      console.error('车辆图片上传失败:', error)
      throw error
    }
  },
}
