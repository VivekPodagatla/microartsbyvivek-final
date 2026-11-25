import { API_URL } from "../config"

export const getImageUrl = (image) => {
  if (!image) {
    return ""
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image
  }

  return `${API_URL}${image}`
}

export const getArtworkImageUrl = (image) => {
  if (!image) {
    return ""
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image
  }

  if (image.startsWith("/uploads/")) {
    return `${API_URL}${image}`
  }

  return image
}
// All images and videos of an artwork or gift, in display order.
// Older items only have `image`, so it becomes a one-image list.
export const getMediaItems = (item) => {
  if (Array.isArray(item?.media) && item.media.length > 0) {
    return item.media
  }

  if (!item?.image) {
    return []
  }

  return [
    {
      url: item.image,
      type: "image",
    },
  ]
}

// Cloudinary returns a still frame when a video URL ends in .jpg
export const getVideoPosterUrl = (url) =>
  url.replace(/\.[^./]+$/, ".jpg")
