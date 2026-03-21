// 知乎平台配置
const ZhihuPlatform = {
  id: 'zhihu',
  name: 'Zhihu',
  icon: 'https://static.zhihu.com/heifetz/favicon.ico',
  url: 'https://www.zhihu.com',
  publishUrl: 'https://zhuanlan.zhihu.com/write',
  title: '知乎',
  type: 'zhihu',
}

import { injectUtils } from './common.js'

// 知乎内容填充函数（在页面主世界中执行）
// 知乎改为直接向编辑器粘贴富文本内容，避免依赖知识库文件上传
// 注意：需要先调用 injectUtils 注入 window.waitFor
function fillZhihuContent(title, markdown, htmlBody) {
  function log(...args) {
    console.log('[FaFaFa-全部发][知乎调试]', ...args)
  }

  // 等待满足条件的元素出现（使用 MutationObserver）
  function waitForElement(predicate, timeout = 10000) {
    return new Promise((resolve) => {
      const el = predicate()
      if (el) return resolve(el)

      const observer = new MutationObserver(() => {
        const el = predicate()
        if (el) {
          observer.disconnect()
          resolve(el)
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })

      setTimeout(() => {
        observer.disconnect()
        resolve(predicate())
      }, timeout)
    })
  }

  function clickElement(el) {
    if (!el) return false
    el.scrollIntoView?.({ block: 'center', inline: 'center' })
    const rect = el.getBoundingClientRect?.() || { left: 0, top: 0, width: 0, height: 0 }
    const clientX = rect.left + rect.width / 2
    const clientY = rect.top + rect.height / 2
    const pointerEvents = ['pointerover', 'pointerenter', 'pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']
    for (const type of pointerEvents) {
      el.dispatchEvent(new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window,
        clientX,
        clientY,
        button: 0,
      }))
    }
    if (typeof el.click === 'function') el.click()
    return true
  }

  function activateSelectionTarget(el) {
    if (!el) return false
    el.scrollIntoView?.({ block: 'center', inline: 'center' })
    el.focus?.()
    if (typeof el.click === 'function') {
      el.click()
      return true
    }
    return clickElement(el)
  }

  function pressSelectionKeys(el) {
    if (!el) return false
    const keys = [
      { key: ' ', code: 'Space', keyCode: 32, which: 32 },
      { key: 'Enter', code: 'Enter', keyCode: 13, which: 13 },
    ]
    for (const keyDef of keys) {
      for (const type of ['keydown', 'keyup']) {
        el.dispatchEvent(new KeyboardEvent(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          ...keyDef,
        }))
      }
    }
    return true
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function normalizeText(text) {
    return (text || '').replace(/\s+/g, ' ').trim().toLowerCase()
  }

  function installUploadErrorMonitor() {
    if (window.__fafafaZhihuUploadMonitorInstalled) return
    window.__fafafaZhihuUploadMonitorInstalled = true
    window.__fafafaZhihuUploadError = null

    const isTargetUrl = (url) => typeof url === 'string' && url.includes('/api/v4/ai_ingress/community/editor/upload')
    const capturePayload = (payload) => {
      if (!payload || typeof payload !== 'object') return
      window.__fafafaZhihuUploadError = payload
      log('捕获到知乎上传错误响应', payload)
    }

    const originalFetch = window.fetch?.bind(window)
    if (originalFetch) {
      window.fetch = async (...args) => {
        const response = await originalFetch(...args)
        const url = args[0] instanceof Request ? args[0].url : String(args[0] || '')
        if (isTargetUrl(url) && !response.ok) {
          try {
            const payload = await response.clone().json()
            capturePayload(payload)
          } catch (error) {
            log('解析知乎上传错误响应失败', { url, error: error?.message || String(error) })
          }
        }
        return response
      }
    }

    const OriginalXHR = window.XMLHttpRequest
    if (OriginalXHR && !OriginalXHR.__fafafaWrapped) {
      function WrappedXHR() {
        const xhr = new OriginalXHR()
        let requestUrl = ''

        const originalOpen = xhr.open
        xhr.open = function(method, url, ...rest) {
          requestUrl = typeof url === 'string' ? url : String(url || '')
          return originalOpen.call(this, method, url, ...rest)
        }

        xhr.addEventListener('load', function() {
          if (!isTargetUrl(requestUrl) || this.status < 400) return
          try {
            const payload = JSON.parse(this.responseText || '{}')
            capturePayload(payload)
          } catch (error) {
            log('解析知乎 XHR 上传错误响应失败', { requestUrl, error: error?.message || String(error) })
          }
        })

        return xhr
      }

      WrappedXHR.__fafafaWrapped = true
      WrappedXHR.prototype = OriginalXHR.prototype
      window.XMLHttpRequest = WrappedXHR
    }
  }

  function getUploadErrorMessage() {
    const payload = window.__fafafaZhihuUploadError
    if (!payload || typeof payload !== 'object') return null

    if (payload.code === 40003 || payload.name === 'CapacityExceededError') {
      return '知乎知识库额度已用完，暂时无法添加文件'
    }

    return payload.message || payload.msg || payload.error || null
  }

  async function waitForImportModalToClose(root, timeout = 8000) {
    const startedAt = Date.now()
    while (Date.now() - startedAt < timeout) {
      const activeRoot = getActiveImportModal()
      if (!activeRoot) return true
      if (root && activeRoot !== root && !activeRoot.contains(root) && !root.contains(activeRoot)) return true
      await sleep(150)
    }
    return !getActiveImportModal()
  }

  function getRowTextParts(row) {
    if (!row) return []
    return Array.from(row.querySelectorAll('div[dir="auto"], div, span'))
      .map(el => normalizeText(el.textContent))
      .filter(Boolean)
  }

  function findFileRow(root, fileName) {
    const baseName = fileName.replace(/\.md$/, '')
    const normalizedFile = normalizeText(fileName)
    const normalizedBase = normalizeText(baseName)

    const rowCandidates = Array.from(root.querySelectorAll('div[tabindex="0"]')).filter(el => {
      const text = normalizeText(el.textContent)
      const parts = getRowTextParts(el)
      const hasMd = text.includes('.md') || parts.includes('md')
      const hasSize = /\b\d+(?:\.\d+)?\s*(kb|mb|gb)\b/i.test(el.textContent || '')
      const hasRadio = !!el.querySelector('svg[width="20"][height="20"]')
      return hasMd && (hasSize || hasRadio)
    })

    const directMatch = rowCandidates.find(el => {
      const text = normalizeText(el.textContent)
      return text.includes(normalizedFile) || text.includes(normalizedBase)
    })
    if (directMatch) return directMatch

    const titleMatch = rowCandidates.find(el => {
      const parts = getRowTextParts(el)
      return parts.some(part => part.includes('.md') && !['md'].includes(part))
    })
    if (titleMatch) return titleMatch

    return rowCandidates[0] || null
  }

  function findRadioInRow(row) {
    if (!row) return null

    return row.querySelector('[role="radio"]')
      || row.querySelector('[aria-checked]')
      || row.querySelector('input[type="radio"]')
      || row.querySelector('svg[width="20"][height="20"]')
      || row.querySelector('svg[width="20"][height="20"]')
      || null
  }

  function findConfirmBtn(root) {
    return findActionButtonByText(root, '添加文件')
  }

  function findSelectFileBtn(root) {
    return findActionButtonByText(root, '请选择文件')
  }

  function findActionButtonByText(root, textToMatch) {
    const textNodes = Array.from(root.querySelectorAll('button, [aria-disabled], [tabindex], div, span'))
      .filter(el => {
        const text = el.innerText?.replace(/\s+/g, '').trim() || ''
        if (text !== textToMatch) return false
        if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false
        return !Array.from(el.children || []).some(child => {
          const childText = child.innerText?.replace(/\s+/g, '').trim() || ''
          return childText === textToMatch
        })
      })

    const candidates = textNodes
      .map(el => {
        const directInteractiveAncestor = el.closest('button, [tabindex="0"], [role="button"]')
        if (directInteractiveAncestor && directInteractiveAncestor !== el) return directInteractiveAncestor

        let current = el.parentElement
        let depth = 0
        while (current && current !== root && depth < 6) {
          const rect = current.getBoundingClientRect?.() || { width: 0, height: 0 }
          const style = window.getComputedStyle?.(current)
          const bg = (style?.backgroundColor || '').replace(/\s+/g, '').toLowerCase()
          const borderRadius = parseFloat(style?.borderRadius || '0') || 0
          const looksLikeButton = rect.width >= 120 && rect.height >= 36 && borderRadius >= 8
          const hasVisibleBg = bg && bg !== 'rgba(0,0,0,0)' && bg !== 'transparent'
          if (looksLikeButton || hasVisibleBg) return current
          current = current.parentElement
          depth += 1
        }

        return el
      })
      .filter((el, index, arr) => el && arr.indexOf(el) === index)
      .filter(el => {
        const text = el.innerText?.replace(/\s+/g, '').trim() || ''
        return text.includes(textToMatch)
      })

    return candidates.sort((a, b) => {
      const aInteractive = a.matches?.('button, [tabindex="0"], [role="button"]') ? 1 : 0
      const bInteractive = b.matches?.('button, [tabindex="0"], [role="button"]') ? 1 : 0
      if (aInteractive !== bInteractive) return bInteractive - aInteractive

      const aArea = (a.getBoundingClientRect?.().width || 0) * (a.getBoundingClientRect?.().height || 0)
      const bArea = (b.getBoundingClientRect?.().width || 0) * (b.getBoundingClientRect?.().height || 0)
      if (aArea !== bArea) return bArea - aArea

      const aDepth = a.querySelectorAll('*').length
      const bDepth = b.querySelectorAll('*').length
      return aDepth - bDepth
    })[0] || null
  }

  function isFileSelectionReady(root) {
    return !!findConfirmBtn(root)
  }

  function isRowSelected(row) {
    if (!row) return false
    const selectedNode = row.matches?.('[aria-checked="true"], [data-state="checked"]')
      ? row
      : row.querySelector('[aria-checked="true"], [data-state="checked"], input[type="radio"]:checked')
    if (selectedNode) return true

    const classText = typeof row.className === 'string' ? row.className.toLowerCase() : ''
    if (classText.includes('selected') || classText.includes('checked') || classText.includes('active')) return true

    const radioSvg = row.querySelector('svg[width="20"][height="20"]')
    if (!radioSvg) return false

    const svgFill = (radioSvg.getAttribute('fill') || '').toLowerCase()
    const pathFills = Array.from(radioSvg.querySelectorAll('path'))
      .map(path => (path.getAttribute('fill') || '').toLowerCase())
      .filter(Boolean)

    const hasActiveFill = [svgFill, ...pathFills].some(fill => fill && fill !== 'none' && fill !== '#c4c7ce')
    if (hasActiveFill) return true

    return radioSvg.querySelectorAll('path').length > 1
  }

  function setNativeRadioChecked(radio) {
    if (!radio || radio.tagName !== 'INPUT' || radio.type !== 'radio') return false
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked')?.set
    if (nativeSetter) {
      nativeSetter.call(radio, true)
    } else {
      radio.checked = true
    }
    radio.dispatchEvent(new Event('input', { bubbles: true }))
    radio.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }

  async function selectFileRow(row) {
    if (!row) return false
    if (isRowSelected(row)) return true

    const radio = findRadioInRow(row)
    const targets = [
      row,
      radio?.closest?.('[tabindex="0"]'),
      radio?.parentElement,
      radio,
      row.querySelector?.('[role="radio"]'),
      row.querySelector?.('[aria-checked]'),
      row.querySelector?.('input[type="radio"]'),
    ].filter((el, index, arr) => el && arr.indexOf(el) === index)

    for (const target of targets) {
      activateSelectionTarget(target)
      await sleep(220)
      if (isRowSelected(row)) return true

      if (target === row || target === radio?.parentElement) continue

      pressSelectionKeys(target)
      await sleep(150)
      if (isRowSelected(row)) return true

      if (setNativeRadioChecked(target)) {
        await sleep(150)
        if (isRowSelected(row)) return true
      }
    }

    return isRowSelected(row)
  }

  async function waitForSelectionReady(root, timeout = 1800) {
    const startedAt = Date.now()
    while (Date.now() - startedAt < timeout) {
      const activeRoot = getActiveImportModal() || root
      const confirmBtn = findConfirmBtn(activeRoot)
      const selectFileBtn = findSelectFileBtn(activeRoot)
      if (confirmBtn) {
        return {
          ready: true,
          confirmBtn,
          selectFileBtn,
          root: activeRoot,
        }
      }
      await sleep(120)
    }

    const latestRoot = getActiveImportModal() || root
    return {
      ready: false,
      confirmBtn: findConfirmBtn(latestRoot),
      selectFileBtn: findSelectFileBtn(latestRoot),
      root: latestRoot,
    }
  }

  function getActiveImportModal() {
    const modals = Array.from(document.querySelectorAll('[class*="Modal"]'))
    return modals.reverse().find(el => {
      const text = normalizeText(el.innerText || el.textContent)
      return text.includes('选择文件') || text.includes('添加文件') || text.includes('请选择文件')
    }) || null
  }

  function describeElement(el) {
    if (!el) return null
    return {
      tag: el.tagName,
      text: (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
      className: typeof el.className === 'string' ? el.className : '',
      disabled: !!el.disabled,
      ariaDisabled: el.getAttribute?.('aria-disabled') || null,
      ariaChecked: el.getAttribute?.('aria-checked') || null,
      role: el.getAttribute?.('role') || null,
      tabindex: el.getAttribute?.('tabindex') || null,
    }
  }

  function isVisibleEditorCandidate(el) {
    if (!el || !el.isConnected) return false
    const rect = el.getBoundingClientRect?.() || { width: 0, height: 0 }
    return rect.width > 180 && rect.height > 20
  }

  function findZhihuEditor() {
    const selectors = [
      '.PostEditor .public-DraftEditor-content[contenteditable="true"]',
      '.PostEditor [role="textbox"][contenteditable="true"]',
      '.EditorSnapshotWrapper .public-DraftEditor-content[contenteditable="true"]',
      '.EditorSnapshotWrapper [role="textbox"][contenteditable="true"]',
      '.DraftEditor-root .public-DraftEditor-content[contenteditable="true"]',
      '.DraftEditor-editorContainer [role="textbox"][contenteditable="true"]',
      '.Editable .public-DraftEditor-content[contenteditable="true"]',
      '.Editable [role="textbox"][contenteditable="true"]',
      '[role="textbox"][contenteditable="true"][aria-describedby^="placeholder-"]',
      '.public-DraftEditor-content[contenteditable="true"]',
      '.DraftEditor-root [contenteditable="true"]',
    ]

    for (const selector of selectors) {
      const candidate = document.querySelector(selector)
      if (candidate && isVisibleEditorCandidate(candidate)) {
        return candidate
      }
    }

    const allCandidates = Array.from(
      document.querySelectorAll('[contenteditable="true"], [role="textbox"][contenteditable="true"]'),
    )

    return allCandidates.find(el => {
      if (!isVisibleEditorCandidate(el)) return false

      const wrapper = el.closest('.PostEditor, .EditorSnapshotWrapper, .Editable, .DraftEditor-root')
      if (wrapper) return true

      const ariaDescribedBy = el.getAttribute('aria-describedby') || ''
      return ariaDescribedBy.startsWith('placeholder-')
    }) || null
  }

  function snapshotModal(root) {
    if (!root) return { exists: false }
    const buttons = Array.from(root.querySelectorAll('button')).map(describeElement)
    const tabStops = Array.from(root.querySelectorAll('[tabindex]')).map(describeElement)
    const mdTexts = Array.from(root.querySelectorAll('div, li, label, button'))
      .map(el => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .filter(text => text.toLowerCase().includes('.md') || text.includes('KB') || text.includes('MB'))
      .slice(0, 10)

    return {
      exists: true,
      buttonCount: buttons.length,
      buttons: buttons.slice(0, 10),
      tabStopCount: tabStops.length,
      tabStops: tabStops.slice(0, 12),
      mdTexts,
    }
  }

  async function uploadMarkdown() {
    log('开始知乎导入流程', {
      title,
      markdownLength: markdown?.length || 0,
      htmlLength: htmlBody?.length || 0,
      url: location.href,
    })

    // 辅助函数：填充标题
    async function fillTitle() {
      const titleInput = await window.waitFor('textarea[placeholder*="标题"]')
      if (titleInput && title) {
        titleInput.focus()
        // 先清空再写入，尽量贴近人工单独输入标题的效果
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype, 'value'
        )?.set
        if (nativeSetter) {
          nativeSetter.call(titleInput, '')
          titleInput.dispatchEvent(new Event('input', { bubbles: true }))
          nativeSetter.call(titleInput, title)
        } else {
          titleInput.value = ''
          titleInput.dispatchEvent(new Event('input', { bubbles: true }))
          titleInput.value = title
        }
        titleInput.dispatchEvent(new Event('input', { bubbles: true }))
        titleInput.dispatchEvent(new Event('change', { bubbles: true }))
        titleInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter', code: 'Enter' }))
        titleInput.dispatchEvent(new Event('blur', { bubbles: true }))
        log('知乎标题填充成功', { title })
      }
    }

    await fillTitle()
    await sleep(200)

    const editor = await waitForElement(() => findZhihuEditor(), 10000)

    if (!editor) {
      log('未找到知乎编辑器', {
        candidates: Array.from(document.querySelectorAll('[contenteditable="true"]'))
          .slice(0, 8)
          .map(describeElement),
      })
      return { success: false, error: 'Zhihu editor not found' }
    }

    log('找到知乎编辑器', describeElement(editor))
    editor.focus()
    clickElement(editor)
    await sleep(150)

    const dt = new DataTransfer()
    const plainText = htmlBody
      ? htmlBody.replace(/<[^>]*>/g, '')
      : (markdown || '')
    if (htmlBody) {
      dt.setData('text/html', htmlBody)
    }
    dt.setData('text/plain', plainText)
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: dt,
    })
    editor.dispatchEvent(pasteEvent)
    log('已向知乎编辑器派发富文本粘贴事件', {
      markdownLength: markdown?.length || 0,
      htmlLength: htmlBody?.length || 0,
      plainTextLength: plainText.length || 0,
    })

    let confirmed = false
    for (let i = 0; i < 15; i++) {
      await sleep(200)
      const convertBtn = Array.from(document.querySelectorAll('button, [tabindex="0"], div'))
        .find(el => {
          const text = (el.innerText || el.textContent || '').replace(/\s+/g, '')
          return ['立即转换', '确认转换', '继续导入', '确认'].some(label => text === label || text.includes(label))
        })
      const bodyText = (document.body.innerText || '').replace(/\s+/g, '')
      if (convertBtn && (bodyText.includes('Markdown') || bodyText.includes('检测到'))) {
        activateSelectionTarget(convertBtn)
        confirmed = true
        log('知乎 Markdown 转换确认成功', describeElement(convertBtn))
        break
      }
    }

    await new Promise(resolve => {
      let timer = setTimeout(resolve, 1200)
      const obs = new MutationObserver(() => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          obs.disconnect()
          resolve()
        }, 300)
      })
      obs.observe(editor, { childList: true, subtree: true, characterData: true })
    })

    await fillTitle()
    await sleep(500)
    await fillTitle()
    return { success: true, method: htmlBody ? 'paste-html' : 'paste-markdown', confirmed }
  }

  return uploadMarkdown()
}

/**
 * 知乎同步处理器
 * 知乎使用导入文档功能上传 md 文件
 * @param {object} tab - Chrome tab 对象
 * @param {object} content - 内容对象 { title, body, markdown }
 * @param {object} helpers - 帮助函数 { chrome, waitForTab, addTabToSyncGroup }
 * @returns {Promise<{success: boolean, message?: string, tabId?: number}>}
 */
async function syncZhihuContent(tab, content, helpers) {
  const { chrome, waitForTab } = helpers

  // 等待页面加载完成（waitForTab 使用 chrome.tabs.onUpdated 监听）
  await waitForTab(tab.id)

  // 先注入公共工具函数（waitFor 使用 MutationObserver）
  await injectUtils(chrome, tab.id)

  // 在页面中执行：直接向知乎编辑器粘贴内容
  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: fillZhihuContent,
    args: [content.title, content.markdown, content.wechatHtml || content.body || ''],
    world: 'MAIN',
  })

  const fillResult = result?.[0]?.result
  if (fillResult?.success) {
    return { success: true, message: '已打开知乎并粘贴内容', tabId: tab.id }
  } else {
    return { success: false, message: fillResult?.error || '知乎内容粘贴失败', tabId: tab.id }
  }
}

// 导出
export { ZhihuPlatform, fillZhihuContent, syncZhihuContent }
