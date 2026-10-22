import { buildApiUrl } from './api'

/**
 * Uploads an image File or Blob directly to Cloudinary via backend /api/upload.
 * Returns the permanent Cloudinary CDN secure URL (https://res.cloudinary.com/dwd0csmmf/...).
 *
 * @param {File|Blob} file - Image file from file input
 * @param {string} folder - Cloudinary folder name (e.g. 'picnicutkal/gallery')
 * @returns {Promise<string>} - Cloudinary CDN URL
 */
export async function uploadImageToCloudinary(file, folder = 'picnicutkal') {
  if (!file) throw new Error('No file provided for upload')

  const formData = new FormData()
  formData.append('image', file)
  formData.append('folder', folder)

  const res = await fetch(buildApiUrl('/api/upload'), {
    method: 'POST',
    body: formData
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || `Upload failed (${res.status})`)
  }

  const data = await res.json()
  if (!data.success || !data.url) {
    throw new Error(data.message || 'Failed to retrieve Cloudinary URL')
  }

  return data.url
}

/**
 * Deletes an image from Cloudinary by its public ID.
 *
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<boolean>}
 */
export async function deleteImageFromCloudinary(publicId) {
  if (!publicId) return false
  try {
    const res = await fetch(buildApiUrl(`/api/upload/${encodeURIComponent(publicId)}`), {
      method: 'DELETE'
    })
    return res.ok
  } catch {
    return false
  }
}
