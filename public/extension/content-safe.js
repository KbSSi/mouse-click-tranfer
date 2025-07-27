// 安全的内容脚本 - 处理页面交互
let selectedText = '';
let selectionTooltip = null;
let isExtensionValid = true;

// 检查扩展上下文是否有效
function checkExtensionContext() {
  try {
    // 尝试访问 chrome.runtime
    if (chrome && chrome.runtime && chrome.runtime.id) {
      return true;
    }
  } catch (error) {
    console.warn('Extension context invalidated:', error);
    isExtensionValid = false;
    return false;
  }
  return false;
}

// 安全的消息发送
async function sendMessageSafely(message) {
  if (!checkExtensionContext()) {
    console.warn('Extension context invalid, using fallback');
    return null;
  }

  try {
    return await chrome.runtime.sendMessage(message);
  } catch (error) {
    console.warn('Failed to send message to extension:', error);
    isExtensionValid = false;
    return null;
  }
}

// 创建工具提示
function createTooltip() {
  // 先移除已存在的工具提示
  const existingTooltip = document.getElementById('time-transfer-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

  const tooltip = document.createElement('div');
  tooltip.id = 'time-transfer-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
    max-width: 300px;
    word-wrap: break-word;
  `;

  try {
    document.body.appendChild(tooltip);
    return tooltip;
  } catch (error) {
    console.warn('Failed to create tooltip:', error);
    return null;
  }
}

// 显示工具提示
function showTooltip(x, y, text) {
  try {
    if (!selectionTooltip) {
      selectionTooltip = createTooltip();
    }

    if (selectionTooltip) {
      selectionTooltip.textContent = text;
      selectionTooltip.style.left = x + 'px';
      selectionTooltip.style.top = (y - 40) + 'px';
      selectionTooltip.style.opacity = '1';
    }
  } catch (error) {
    console.warn('Failed to show tooltip:', error);
  }
}

// 隐藏工具提示
function hideTooltip() {
  try {
    if (selectionTooltip) {
      selectionTooltip.style.opacity = '0';
    }
  } catch (error) {
    console.warn('Failed to hide tooltip:', error);
  }
}

// 检查是否为时间戳
function isTimestamp(text) {
  const trimmed = text.trim();
  return /^\d{10}$/.test(trimmed) || /^\d{13}$/.test(trimmed);
}

// 本地时间戳转换
function convertTimestampLocally(timestamp) {
  try {
    const num = parseInt(timestamp);
    const date = new Date(timestamp.length === 10 ? num * 1000 : num);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return '转换失败';
  }
}

// 调用时间戳转换
async function callTimestampAPI(timestamp) {
  try {
    // 首先尝试通过扩展后台脚本
    if (isExtensionValid) {
      const response = await sendMessageSafely({
        action: 'convertTimestamp',
        timestamp: timestamp
      });

      if (response && response.success) {
        return response.result;
      }
    }

    // 降级到本地转换
    return convertTimestampLocally(timestamp);
  } catch (error) {
    console.warn('Timestamp conversion failed:', error);
    return convertTimestampLocally(timestamp);
  }
}

// 调用翻译API
async function callTranslationAPI(text) {
  try {
    // 首先尝试通过扩展后台脚本
    if (isExtensionValid) {
      const response = await sendMessageSafely({
        action: 'translateText',
        text: text
      });

      if (response && response.success) {
        return response.result;
      }
    }

    // 降级到本地模拟翻译
    return `翻译: ${text} (本地模拟)`;
  } catch (error) {
    console.warn('Translation failed:', error);
    return `翻译: ${text} (本地模拟)`;
  }
}

// 处理文本选择
function handleTextSelection() {
  try {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selectedText = selection.toString().trim();

      if (selectedText.length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + window.scrollY;

        if (isTimestamp(selectedText)) {
          showTooltip(x, y, '左键点击转换时间戳');
        } else {
          showTooltip(x, y, '右键点击翻译文本');
        }
      } else {
        hideTooltip();
      }
    } else {
      hideTooltip();
    }
  } catch (error) {
    console.warn('Text selection handling failed:', error);
  }
}

// 处理鼠标点击
async function handleClick(event) {
  try {
    if (selectedText.length === 0) return;

    if (event.button === 0) { // 左键
      if (isTimestamp(selectedText)) {
        event.preventDefault();
        const result = await callTimestampAPI(selectedText);
        showTooltip(event.clientX, event.clientY + window.scrollY, result);

        // 3秒后隐藏
        setTimeout(hideTooltip, 3000);
      }
    }
  } catch (error) {
    console.warn('Click handling failed:', error);
  }
}

// 处理右键点击
async function handleContextMenu(event) {
  try {
    if (selectedText.length === 0) return;

    if (!isTimestamp(selectedText)) {
      event.preventDefault();
      const result = await callTranslationAPI(selectedText);
      showTooltip(event.clientX, event.clientY + window.scrollY, result);

      // 3秒后隐藏
      setTimeout(hideTooltip, 3000);
    }
  } catch (error) {
    console.warn('Context menu handling failed:', error);
  }
}

// 清理函数
function cleanup() {
  try {
    if (selectionTooltip) {
      selectionTooltip.remove();
      selectionTooltip = null;
    }
  } catch (error) {
    console.warn('Cleanup failed:', error);
  }
}

// 安全地添加事件监听器
function addEventListeners() {
  try {
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectionchange', handleTextSelection);

    // 点击其他地方时隐藏工具提示
    document.addEventListener('click', (event) => {
      if (event.target && event.target.id !== 'time-transfer-tooltip') {
        hideTooltip();
      }
    });

    console.log('Time Transfer & Translator 内容脚本已加载');
  } catch (error) {
    console.warn('Failed to add event listeners:', error);
  }
}

// 监听扩展卸载
if (chrome && chrome.runtime) {
  chrome.runtime.onConnect.addListener(() => {
    // 连接建立时重新检查上下文
    isExtensionValid = checkExtensionContext();
  });
}

// 页面卸载时清理
window.addEventListener('beforeunload', cleanup);

// 初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addEventListeners);
} else {
  addEventListeners();
}
