// Turns a User-Agent (+ optional browser "client hints") into readable device info. Pure function, no dependencies.
export type Hints = {
  platform?: string
  platformVersion?: string
  model?: string
  mobile?: boolean
  architecture?: string
}
export type DeviceInfo = {
  device_type: string // Mobile | Tablet | PC
  os: string
  os_version: string
  browser: string
  browser_version: string
  device_model: string
}

export const clip = (v: unknown, n = 100) => (typeof v === 'string' ? v.slice(0, n) : '')
const trimZeros = (v: string) => v.replace(/(\.0)+$/, '')

export function parseDevice(uaIn: string, hintsIn: Hints = {}, touchPoints = 0): DeviceInfo {
  const ua = clip(uaIn, 400)
  const h: Hints = {
    platform: clip(hintsIn?.platform, 30),
    platformVersion: clip(hintsIn?.platformVersion, 30),
    model: clip(hintsIn?.model, 60),
    mobile: hintsIn?.mobile === true,
  }
  const pick = (re: RegExp) => (ua.match(re) || [])[1] || ''

  // ---- operating system ----
  let os = 'Unknown'
  let ver = ''
  const isIpad = /iPad/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1)
  if (/Windows NT/.test(ua)) {
    os = 'Windows'
    const nt = pick(/Windows NT ([\d.]+)/)
    if (h.platformVersion) ver = parseInt(h.platformVersion.split('.')[0] || '0', 10) >= 13 ? '11' : '10'
    else ver = nt === '10.0' ? '10/11' : nt === '6.3' ? '8.1' : nt === '6.2' ? '8' : nt === '6.1' ? '7' : nt
  } else if (/Android/.test(ua)) {
    os = 'Android'
    ver = h.platformVersion ? trimZeros(h.platformVersion) : pick(/Android ([\d.]+)/)
  } else if (isIpad) {
    os = 'iPadOS'
    ver = pick(/OS (\d+(?:_\d+)*)/).replace(/_/g, '.')
  } else if (/iPhone|iPod/.test(ua)) {
    os = 'iOS'
    ver = pick(/OS (\d+(?:_\d+)*)/).replace(/_/g, '.')
  } else if (/CrOS/.test(ua)) {
    os = 'ChromeOS'
  } else if (/Mac OS X/.test(ua)) {
    os = 'macOS'
    ver = h.platformVersion ? trimZeros(h.platformVersion) : pick(/Mac OS X ([\d_]+)/).replace(/_/g, '.')
  } else if (/Linux/.test(ua)) {
    os = 'Linux'
  }

  // ---- browser ----
  let browser = 'Unknown'
  let bver = ''
  if (/Edg(?:e|A|iOS)?\//.test(ua)) { browser = 'Edge'; bver = pick(/Edg(?:e|A|iOS)?\/([\d.]+)/) }
  else if (/OPR\//.test(ua)) { browser = 'Opera'; bver = pick(/OPR\/([\d.]+)/) }
  else if (/SamsungBrowser\//.test(ua)) { browser = 'Samsung Internet'; bver = pick(/SamsungBrowser\/([\d.]+)/) }
  else if (/MiuiBrowser\//.test(ua)) { browser = 'Mi Browser'; bver = pick(/MiuiBrowser\/([\d.]+)/) }
  else if (/UCBrowser\//.test(ua)) { browser = 'UC Browser'; bver = pick(/UCBrowser\/([\d.]+)/) }
  else if (/(?:Firefox|FxiOS)\//.test(ua)) { browser = 'Firefox'; bver = pick(/(?:Firefox|FxiOS)\/([\d.]+)/) }
  else if (/(?:Chrome|CriOS)\//.test(ua)) { browser = 'Chrome'; bver = pick(/(?:Chrome|CriOS)\/([\d.]+)/) }
  else if (/Safari\//.test(ua)) { browser = 'Safari'; bver = pick(/Version\/([\d.]+)/) }

  // ---- device type + model ----
  let type = 'PC'
  if (isIpad) type = 'Tablet'
  else if (/iPhone|iPod/.test(ua)) type = 'Mobile'
  else if (/Android/.test(ua)) type = /Mobile/.test(ua) || h.mobile ? 'Mobile' : 'Tablet'
  else if (h.mobile) type = 'Mobile'

  let model = h.model || ''
  if (!model && /Android/.test(ua)) model = pick(/Android [\d.]+; ([^;)]+?)(?: Build|\)|;)/)
  if (model === 'K') model = '' // Chrome hides the real model in its reduced User-Agent
  if (!model && /iPhone/.test(ua)) model = 'iPhone'
  if (!model && isIpad) model = 'iPad'

  return {
    device_type: type,
    os,
    os_version: clip(ver, 30),
    browser,
    browser_version: trimZeros(clip(bver, 30)),
    device_model: clip(model, 60),
  }
}
