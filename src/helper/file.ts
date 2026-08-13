import { MdPictureAsPdf, MdInsertDriveFile, MdDescription } from 'react-icons/md'

export const isImageUrl = (url: string) => {
  if (!url) return false
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase()
  return /\.(jpg|jpeg|png|webp|gif|avif|svg)$/.test(cleanUrl)
}

export const getFileName = (url: string) => {
  try {
    const cleanUrl = url.split('?')[0].split('#')[0]
    return decodeURIComponent(cleanUrl.split('/').pop() || 'Lampiran')
  } catch {
    return 'Lampiran'
  }
}
