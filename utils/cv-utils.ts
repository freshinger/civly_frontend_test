// CV utility functions

export function isValidUrl(url: string): boolean {
  if (!url || url.trim() === '') return false

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getLinkedInUsername(url: string): string {
  if (!isValidUrl(url)) return url

  try {
    const urlObj = new URL(url)
    if (urlObj.hostname.includes('linkedin.com')) {
      const match = urlObj.pathname.match(/\/in\/([^\/]+)/)
      return match ? match[1] : url
    }
  } catch {
    // If URL parsing fails, return original
  }

  return url
}

export function getXingUsername(url: string): string {
  if (!isValidUrl(url)) return url

  try {
    const urlObj = new URL(url)
    if (urlObj.hostname.includes('xing.com')) {
      const match = urlObj.pathname.match(/\/profile\/([^\/]+)/)
      return match ? match[1] : url
    }
  } catch {
    // If URL parsing fails, return original
  }

  return url
}

export function formatWebsiteUrl(url: string): string {
  if (!isValidUrl(url)) return url

  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}
