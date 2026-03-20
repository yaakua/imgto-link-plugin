import { LOGIN_CHECK_CONFIG } from '@fafafa/publisher-detection/src/configs.js'
import { checkLoginByCookie, detectByApi } from '@fafafa/publisher-detection/src/utils.js'

const DETECTOR_LOADERS = {
  csdn: () => import('@fafafa/publisher-detection/src/platforms/csdn.js'),
  oschina: () => import('@fafafa/publisher-detection/src/platforms/oschina.js'),
  alipayopen: () => import('@fafafa/publisher-detection/src/platforms/alipay.js'),
  weibo: () => import('@fafafa/publisher-detection/src/platforms/weibo.js'),
  wechat: () => import('@fafafa/publisher-detection/src/platforms/wechat.js'),
  elecfans: () => import('@fafafa/publisher-detection/src/platforms/elecfans.js'),
  huaweicloud: () => import('@fafafa/publisher-detection/src/platforms/huaweicloud.js'),
  huaweidev: () => import('@fafafa/publisher-detection/src/platforms/huaweidev.js'),
  sspai: () => import('@fafafa/publisher-detection/src/platforms/sspai.js'),
  aliyun: () => import('@fafafa/publisher-detection/src/platforms/aliyun.js'),
  sohu: () => import('@fafafa/publisher-detection/src/platforms/sohu.js'),
  medium: () => import('@fafafa/publisher-detection/src/platforms/medium.js'),
  tencentcloud: () => import('@fafafa/publisher-detection/src/platforms/tencentcloud.js'),
  qianfan: () => import('@fafafa/publisher-detection/src/platforms/qianfan.js'),
  twitter: () => import('@fafafa/publisher-detection/src/platforms/twitter.js'),
  bilibili: () => import('@fafafa/publisher-detection/src/platforms/bilibili.js'),
  jianshu: () => import('@fafafa/publisher-detection/src/platforms/jianshu.js'),
  segmentfault: () => import('@fafafa/publisher-detection/src/platforms/segmentfault.js'),
  infoq: () => import('@fafafa/publisher-detection/src/platforms/infoq.js'),
  modelscope: () => import('@fafafa/publisher-detection/src/platforms/modelscope.js'),
  volcengine: () => import('@fafafa/publisher-detection/src/platforms/volcengine.js'),
  wangyihao: () => import('@fafafa/publisher-detection/src/platforms/wangyihao.js'),
}

const DETECTOR_EXPORTS = {
  csdn: 'detectCSDNUser',
  oschina: 'detectOSChinaUser',
  alipayopen: 'detectAlipayUser',
  weibo: 'detectWeiboUser',
  wechat: 'detectWechatUser',
  elecfans: 'detectElecfansUser',
  huaweicloud: 'detectHuaweiCloudUser',
  huaweidev: 'detectHuaweiDevUser',
  sspai: 'detectSspaiUser',
  aliyun: 'detectAliyunUser',
  sohu: 'detectSohuUser',
  medium: 'detectMediumUser',
  tencentcloud: 'detectTencentCloudUser',
  qianfan: 'detectQianfanUser',
  twitter: 'detectTwitterUser',
  bilibili: 'detectBilibiliUser',
  jianshu: 'detectJianshuUser',
  segmentfault: 'detectSegmentFaultUser',
  infoq: 'detectInfoQUser',
  modelscope: 'detectModelScopeUser',
  volcengine: 'detectVolcengineUser',
  wangyihao: 'detectWangyihaoUser',
}

// Offscreen document for making fetch requests with cookies
// This runs in a document context where credentials: 'include' actually works
// (unlike the service worker where cookies are not sent/received automatically)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OFFSCREEN_PING') {
    sendResponse({ pong: true })
    return false
  }

  if (message.type === 'OFFSCREEN_FETCH') {
    handleFetch(message.payload)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true
  }

  if (message.type === 'OFFSCREEN_WARM_FETCH') {
    handleWarmFetch(message.payload)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true
  }

  if (message.type === 'OFFSCREEN_API_FETCH') {
    handleApiFetch(message.payload)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true
  }

  if (message.type === 'OFFSCREEN_DETECT_CTO51') {
    handleDetectCto51()
      .then(result => sendResponse({ success: true, data: result }))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true
  }

  if (message.type === 'OFFSCREEN_DETECT_CNBLOGS') {
    handleDetectCnblogs()
      .then(result => sendResponse({ success: true, data: result }))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true
  }

  if (message.type === 'OFFSCREEN_DETECT_XIAOHONGSHU') {
    handleDetectXiaohongshu()
      .then(result => sendResponse({ success: true, data: result }))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true
  }

  if (message.type === 'OFFSCREEN_DETECT_PLATFORM') {
    handleDetectPlatform(message.payload?.platformId)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(err => sendResponse({ success: false, error: err.message }))
    return true
  }
})

async function handleDetectPlatform(platformId) {
  if (!platformId) return { loggedIn: false, error: 'Missing platformId' }

  if (platformId === 'cto51') return await handleDetectCto51()
  if (platformId === 'cnblogs') return await handleDetectCnblogs()
  if (platformId === 'xiaohongshu') return await handleDetectXiaohongshu()

  const config = LOGIN_CHECK_CONFIG[platformId]
  if (config) {
    if (config.useCookie || (config.cookieNames && config.cookieNames.length > 0)) {
      return await checkLoginByCookie(platformId, config)
    }
    if (config.api) {
      return await detectByApi(platformId, config)
    }
  }

  const load = DETECTOR_LOADERS[platformId]
  const exportName = DETECTOR_EXPORTS[platformId]
  if (!load || !exportName) {
    return { loggedIn: false, error: `No detection available for ${platformId}` }
  }

  const mod = await load()
  const detector = mod?.[exportName]
  if (typeof detector !== 'function') {
    return { loggedIn: false, error: `Detector export missing for ${platformId}` }
  }

  return await detector()
}

async function handleFetch(payload) {
  const { url, method, headers, body } = payload
  const resp = await fetch(url, {
    method: method || 'POST',
    credentials: 'include',
    headers: headers || {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}`)
  }
  return await resp.json()
}

/**
 * Warm-up fetch: makes a request with credentials: 'include' to trigger
 * the browser's cookie restoration (SSO, session cookies, etc.)
 * Returns status and response headers info, not the full body.
 */
async function handleWarmFetch(payload) {
  const { url, redirect } = payload
  try {
    const resp = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      redirect: redirect || 'follow',
    })
    // Read a small portion to ensure the response is consumed
    const text = await resp.text()
    return {
      status: resp.status,
      url: resp.url,
      length: text.length,
    }
  } catch (e) {
    return { error: e.message }
  }
}

/**
 * API fetch: makes a request with credentials: 'include' and returns the response body.
 * Used for API calls that need cookies automatically attached (since service worker
 * fetch() strips manually-set Cookie headers in MV3).
 */
async function handleApiFetch(payload) {
  const { url, method, headers, responseType, redirect } = payload
  try {
    const resp = await fetch(url, {
      method: method || 'GET',
      credentials: 'include',
      headers: headers || {},
      redirect: redirect || 'follow',
    })
    const status = resp.status
    const finalUrl = resp.url
    let body = null
    if (responseType === 'json') {
      try { body = await resp.json() } catch (e) { body = null }
    } else {
      body = await resp.text()
    }
    return { status, url: finalUrl, body }
  } catch (e) {
    return { error: e.message }
  }
}


/**
 * 51CTO detection: fetch home.51cto.com/space and parse with DOMParser.
 * Same approach as 爱贝壳 extension - runs in document context (offscreen).
 */
async function handleDetectCto51() {
  try {
    const resp = await fetch('https://home.51cto.com/space', {
      credentials: 'include',
    })
    const html = await resp.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    // Avatar: <img alt="头像">
    const avatarEl = doc.querySelector("img[alt='头像']")
    const avatar = avatarEl ? avatarEl.getAttribute('src') : ''

    // UID from avatar URL: uid=(\d+)
    let uid = ''
    if (avatar) {
      const m = avatar.match(/uid=(\d+)/)
      if (m) uid = m[1]
    }

    // Nickname: div.name > a
    const nameEl = doc.querySelector('div.name > a')
    const username = nameEl ? nameEl.textContent.trim() : ''

    if (!username && !uid) {
      // Return debug info to help diagnose
      const title = doc.querySelector('title')?.textContent || ''
      return { loggedIn: false, _debug: { status: resp.status, url: resp.url, htmlLen: html.length, title } }
    }

    return { loggedIn: true, username, avatar, uid }
  } catch (e) {
    return { loggedIn: false, error: e.message }
  }
}


/**
 * Cnblogs detection: fetch account.cnblogs.com/user/userinfo in document context.
 * Cookies are sent automatically (unlike service worker fetch which strips Cookie headers).
 */
async function handleDetectCnblogs() {
  try {
    const resp = await fetch('https://account.cnblogs.com/user/userinfo', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    })
    if (!resp.ok) return { loggedIn: false }

    const data = await resp.json()
    if (!data?.spaceUserId) return { loggedIn: false }

    const username = data.displayName || ''
    let avatar = data.iconName || ''
    if (avatar && !avatar.startsWith('http')) {
      avatar = 'https:' + avatar
    }

    return { loggedIn: true, username, avatar }
  } catch (e) {
    return { loggedIn: false, error: e.message }
  }
}


/**
 * Xiaohongshu detection: fetch creator API in document context.
 * Cookies are sent automatically with credentials: 'include'.
 */
async function handleDetectXiaohongshu() {
  try {
    const resp = await fetch('https://creator.xiaohongshu.com/api/galaxy/user/info', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    })
    if (!resp.ok) return { loggedIn: false }

    const data = await resp.json()
    if (data?.success === true && data?.code === 0 && data?.data?.userId) {
      return {
        loggedIn: true,
        username: data.data.userName || data.data.redId || '',
        avatar: data.data.userAvatar || '',
        userId: data.data.userId,
      }
    }
    return { loggedIn: false }
  } catch (e) {
    return { loggedIn: false, error: e.message }
  }
}
