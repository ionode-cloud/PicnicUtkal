import { buildApiUrl } from './api'

/**
 * Automatically optimizes and compresses an image File in browser memory before network transmission.
 * Reduces 10MB-25MB camera / designer maps to ~600KB-1.2MB without losing visual clarity.
 * Prevents HTTP 413 (Payload Too Large) on Nginx / reverse proxies.
 */
export async function compressImageFile(file, { maxDimension = 2560, quality = 0.85 } = {}) {
  if (!file || !(file instanceof Blob)) return file
  // Keep SVGs, GIFs, and already small images (<800KB) intact
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file
  if (file.size <= 800 * 1024) return file

  try {
    return await new Promise((resolve) => {
      const img = new window.Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        let { width, height } = img

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file)
            }
            const cleanName = (file.name || 'image').replace(/\.[^.]+$/, '') + '.jpg'
            const compressed = new File([blob], cleanName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressed)
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        resolve(file)
      }

      img.src = objectUrl
    })
  } catch (err) {
    console.warn('Image compression fallback to original:', err)
    return file
  }
}

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

  // Auto-compress large images to prevent HTTP 413 Payload Too Large on Nginx
  let uploadFile = file
  if (file instanceof Blob && file.size > 800 * 1024) {
    try {
      uploadFile = await compressImageFile(file)
    } catch (e) {
      console.warn('Compression skipped:', e)
    }
  }

  const formData = new FormData()
  formData.append('image', uploadFile)
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
