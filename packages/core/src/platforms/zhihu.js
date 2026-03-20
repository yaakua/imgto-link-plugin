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
// 知乎使用导入文档功能上传 md 文件
// 注意：需要先调用 injectUtils 注入 window.waitFor
function fillZhihuContent(title, markdown) {
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
    const events = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']
    for (const type of events) {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }))
    }
    if (typeof el.click === 'function') el.click()
    return true
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function findFileRow(root, fileName) {
    const baseName = fileName.replace(/\.md$/, '')
    const normalize = (text) => (text || '').replace(/\s+/g, ' ').trim().toLowerCase()
    const normalizedFile = normalize(fileName)
    const normalizedBase = normalize(baseName)
    const tabStops = Array.from(root.querySelectorAll('[tabindex="0"]'))

    const directMatch = tabStops.find(el => {
      const text = normalize(el.textContent)
      return text.includes(normalizedFile) || text.includes(normalizedBase)
    })
    if (directMatch) return directMatch

    // 知乎有时会把标题做字形转换，先退化为“像一个 md 文件行”的判断
    const fallbackRow = tabStops.find(el => {
      const text = normalize(el.textContent)
      const hasMd = text.includes('.md') || text.includes(' md ')
      const hasMeta = text.includes('kb') || text.includes('mb')
      return hasMd && (hasMeta || text.includes('md'))
    })
    if (fallbackRow) return fallbackRow

    return Array.from(root.querySelectorAll('div, li, label, button'))
      .find(el => {
        const text = normalize(el.textContent)
        return text.includes(normalizedFile) || text.includes(normalizedBase) || text.includes('.md')
      }) || null
  }

  function findRadioInRow(row) {
    if (!row) return null
    return Array.from(row.querySelectorAll('[tabindex="0"], svg, path, div'))
      .find(el => {
        const html = el.outerHTML || ''
        return html.includes('20" height="20" viewBox="0 0 24 24"') || html.includes('clip-rule="evenodd"')
      }) || null
  }

  function findConfirmBtn(root) {
    return Array.from(root.querySelectorAll('button'))
      .find(el => {
        const text = el.innerText?.replace(/\s+/g, '').trim() || ''
        return (
          text.includes('添加文件') &&
          !el.disabled &&
          el.getAttribute('aria-disabled') !== 'true'
        )
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
      tabindex: el.getAttribute?.('tabindex') || null,
    }
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
      url: location.href,
    })

    // 辅助函数：填充标题
    async function fillTitle() {
      const titleInput = await window.waitFor('textarea[placeholder*="标题"]')
      if (titleInput && title) {
        titleInput.focus()
        // 使用 nativeInputValueSetter 确保 React 识别变更
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype, 'value'
        )?.set
        if (nativeSetter) {
          nativeSetter.call(titleInput, title)
        } else {
          titleInput.value = title
        }
        titleInput.dispatchEvent(new Event('input', { bubbles: true }))
        titleInput.dispatchEvent(new Event('change', { bubbles: true }))
        log('知乎标题填充成功', { title })
      }
    }

    // 第一步：点击工具栏的"导入"按钮，打开子菜单
    // 注意：按钮文本可能包含零宽字符，使用 includes 匹配
    const importBtn = Array.from(document.querySelectorAll('button'))
      .find(el => el.innerText.includes('导入') && !el.innerText.includes('导入文档') && !el.innerText.includes('导入链接'))

    if (importBtn) {
      log('找到导入按钮', describeElement(importBtn))
      clickElement(importBtn)
      log('已点击导入按钮')

      // 等待子菜单中的"导入文档"按钮出现（使用 MutationObserver）
      const importDocBtn = await waitForElement(() => 
        Array.from(document.querySelectorAll('button'))
          .find(el => el.innerText.includes('导入文档'))
      )

      if (importDocBtn) {
        log('找到导入文档按钮', describeElement(importDocBtn))
        clickElement(importDocBtn)
        log('已点击导入文档按钮')

        // 等待文件输入框出现（使用 MutationObserver）
        const fileInput = await window.waitFor('input[type="file"][accept*=".md"]')
        if (fileInput) {
          // 创建 md 文件（使用 text/plain 类型，更通用）
          const mdContent = markdown || ''
          const fileName = (title || 'article').replace(/[\\/：:*?"<>|]/g, '_') + '.md'
          const file = new File([mdContent], fileName, { type: 'text/plain' })

          // 创建 DataTransfer 并设置文件
          const dt = new DataTransfer()
          dt.items.add(file)
          fileInput.files = dt.files

          // 触发 input 和 change 事件
          fileInput.dispatchEvent(new Event('input', { bubbles: true }))
          fileInput.dispatchEvent(new Event('change', { bubbles: true }))
          log('已向文件输入框注入 md 文件', {
            fileName,
            fileType: file.type,
            fileSize: file.size,
            accept: fileInput.getAttribute('accept'),
          })

          const modalRoot = fileInput.closest('[class*="Modal"]') || document.querySelector('[class*="Modal"]') || document.body
          log('弹窗初始快照', snapshotModal(modalRoot))

          // 知乎会在上传后异步渲染文件列表，按钮也会先是“请选择文件”再变成“添加文件”
          let addFileBtn = null
          for (let attempt = 1; attempt <= 12; attempt++) {
            await sleep(500)

            const fileRow = findFileRow(modalRoot, fileName)
            const confirmBtnSnapshot = findConfirmBtn(modalRoot)
            log(`第 ${attempt} 次轮询`, {
              fileRow: describeElement(fileRow),
              radio: describeElement(findRadioInRow(fileRow)),
              confirmBtn: describeElement(confirmBtnSnapshot),
              modal: snapshotModal(modalRoot),
            })

            if (fileRow) {
              clickElement(fileRow)
              const radio = findRadioInRow(fileRow)
              if (radio && radio !== fileRow) clickElement(radio)
              log(`第 ${attempt} 次尝试选中文件项`, {
                fileName,
                row: describeElement(fileRow),
                radio: describeElement(radio),
              })
            } else {
              log(`第 ${attempt} 次未找到文件项，继续等待`, { fileName })
            }

            addFileBtn = findConfirmBtn(modalRoot)
            if (addFileBtn) {
              clickElement(addFileBtn)
              log(`第 ${attempt} 次已点击添加文件按钮`, describeElement(addFileBtn))
              break
            }
          }

          if (!addFileBtn) {
            log('等待后仍未找到可点击的添加文件按钮', snapshotModal(modalRoot))
          }

          // 等待导入完成（监听编辑器 DOM 稳定后再填充标题）
          // 导入过程会产生多次 DOM 变更并清空标题，需等所有变更结束
          const editorContent = document.querySelector('.public-DraftEditor-content') || document.querySelector('[contenteditable="true"]')
          if (editorContent) {
            log('检测到编辑器区域，等待导入稳定', describeElement(editorContent))
            await new Promise(resolve => {
              let timer
              const obs = new MutationObserver(() => {
                clearTimeout(timer)
                timer = setTimeout(() => { obs.disconnect(); resolve() }, 300)
              })
              obs.observe(editorContent, { childList: true, subtree: true, characterData: true })
            })
            log('编辑器内容变更已稳定')
          }
          await fillTitle()

          return { success: true, method: 'import-document' }
        } else {
          log('未找到文件输入框')
          return { success: false, error: 'File input not found' }
        }
      } else {
        log('未找到导入文档按钮')
        return { success: false, error: 'Import document button not found' }
      }
    } else {
      log('未找到导入按钮')
      return { success: false, error: 'Import button not found' }
    }
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

  // 在页面中执行：点击导入文档并上传 md 文件
  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: fillZhihuContent,
    args: [content.title, content.markdown],
    world: 'MAIN',
  })

  const fillResult = result?.[0]?.result
  if (fillResult?.success) {
    return { success: true, message: '已打开知乎并导入文档', tabId: tab.id }
  } else {
    return { success: false, message: fillResult?.error || '导入文档失败', tabId: tab.id }
  }
}

// 导出
export { ZhihuPlatform, fillZhihuContent, syncZhihuContent }
