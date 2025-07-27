// 安全的内容脚本 - 处理页面交互
let selectedText = '';
let selectionTooltip = null;
let contextMenu = null;
let resultDisplay = null;
let resultHideTimer = null; // 添加定时器变量
let savedSelectionRect = null; // 保存选中文本的位置信息
let selectionDebounceTimer = null; // 防抖定时器
let isExtensionValid = true;

// 检查扩展上下文是否有效
function checkExtensionContext() {
  try {
    // 检查是否在扩展环境中
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      return true;
    }
    // 如果不在扩展环境中，标记为无效但不报错
    isExtensionValid = false;
    return false;
  } catch (error) {
    console.warn('Extension context invalidated:', error);
    isExtensionValid = false;
    return false;
  }
}

// 安全的消息发送
async function sendMessageSafely(message) {
  if (!checkExtensionContext()) {
    // 在测试环境中静默处理，不显示警告
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

// 创建右键功能选择框
function createContextMenu() {
  // 先移除已存在的选择框
  const existingMenu = document.getElementById('time-transfer-context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  const menu = document.createElement('div');
  menu.id = 'time-transfer-context-menu';
  menu.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10001;
    opacity: 0;
    transform: scale(0.9);
    transition: all 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    min-width: 160px;
    overflow: hidden;
    pointer-events: none;
  `;

  // 创建时间戳转换选项
  const timestampOption = document.createElement('div');
  timestampOption.className = 'context-menu-item';
  timestampOption.textContent = '🕐 时间戳转换';
  timestampOption.style.cssText = `
    padding: 10px 16px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;
  `;
  timestampOption.addEventListener('mouseenter', () => {
    timestampOption.style.backgroundColor = '#f5f5f5';
  });
  timestampOption.addEventListener('mouseleave', () => {
    timestampOption.style.backgroundColor = 'transparent';
  });
  timestampOption.addEventListener('click', (event) => {
    console.log('Timestamp option clicked!');
    event.stopPropagation(); // 阻止事件冒泡
    handleTimestampConversion();
    hideContextMenu();
  });

  // 创建翻译选项
  const translateOption = document.createElement('div');
  translateOption.className = 'context-menu-item';
  translateOption.textContent = '🌐 翻译文本';
  translateOption.style.cssText = `
    padding: 10px 16px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    transition: background-color 0.2s;
  `;
  translateOption.addEventListener('mouseenter', () => {
    translateOption.style.backgroundColor = '#f5f5f5';
  });
  translateOption.addEventListener('mouseleave', () => {
    translateOption.style.backgroundColor = 'transparent';
  });
  translateOption.addEventListener('click', () => {
    handleTranslation();
    hideContextMenu();
  });

  menu.appendChild(timestampOption);
  menu.appendChild(translateOption);

  try {
    document.body.appendChild(menu);
    return menu;
  } catch (error) {
    console.warn('Failed to create context menu:', error);
    return null;
  }
}

// 创建结果显示框
function createResultDisplay() {
  // 先移除已存在的结果显示框
  const existingDisplay = document.getElementById('time-transfer-result-display');
  if (existingDisplay) {
    existingDisplay.remove();
  }

  const display = document.createElement('div');
  display.id = 'time-transfer-result-display';
  display.style.cssText = `
    position: absolute;
    background: white;
    border: 2px solid #ff4444;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
    color: #ff4444;
    font-weight: bold;
    z-index: 10002;
    box-shadow: 0 4px 12px rgba(255,68,68,0.2);
    max-width: 400px;
    word-wrap: break-word;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  try {
    document.body.appendChild(display);
    return display;
  } catch (error) {
    console.warn('Failed to create result display:', error);
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

// 显示右键菜单
function showContextMenu() {
  try {
    if (!contextMenu) {
      contextMenu = createContextMenu();
    }

    if (contextMenu) {
      // 获取选中文本的位置
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // 保存选中文本的位置信息，供后续使用
        savedSelectionRect = {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        };

        // 计算菜单位置：在选中文本的右侧
        const menuWidth = 160;
        const menuHeight = 80;
        let x = rect.right + 10; // 在选中文本右侧10px处
        let y = rect.top + window.scrollY;

        // 确保菜单不会超出屏幕右边界
        if (x + menuWidth > window.innerWidth) {
          x = rect.left - menuWidth - 10; // 如果右侧空间不够，显示在左侧
        }

        // 确保菜单不会超出屏幕下边界
        if (y + menuHeight > window.innerHeight + window.scrollY) {
          y = window.innerHeight + window.scrollY - menuHeight - 10;
        }

        // 确保菜单不会超出屏幕上边界
        if (y < window.scrollY) {
          y = window.scrollY + 10;
        }

        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.style.opacity = '1';
        contextMenu.style.transform = 'scale(1)';
        contextMenu.style.pointerEvents = 'auto'; // 重新启用点击事件
      }
    }
  } catch (error) {
    console.warn('Failed to show context menu:', error);
  }
}

// 隐藏右键菜单
function hideContextMenu() {
  try {
    if (contextMenu) {
      contextMenu.style.opacity = '0';
      contextMenu.style.transform = 'scale(0.9)';
      contextMenu.style.pointerEvents = 'none'; // 禁用点击事件，避免阻挡
    }
  } catch (error) {
    console.warn('Failed to hide context menu:', error);
  }
}

// 显示结果
function showResult(text) {
  try {
    console.log('showResult called with text:', text);

    // 清除之前的定时器
    if (resultHideTimer) {
      clearTimeout(resultHideTimer);
      resultHideTimer = null;
    }

    if (!resultDisplay) {
      console.log('Creating new result display');
      resultDisplay = createResultDisplay();
    }

    if (resultDisplay) {
      console.log('Setting result display text and position');
      resultDisplay.textContent = text;

      // 使用保存的选中文本位置信息
      if (savedSelectionRect) {
        // 计算结果框位置：在选中文本的右侧
        const displayWidth = 400;
        const displayHeight = 60;
        let x = savedSelectionRect.right + 10; // 在选中文本右侧10px处
        let y = savedSelectionRect.top + window.scrollY;

        // 确保结果框不会超出屏幕右边界
        if (x + displayWidth > window.innerWidth) {
          x = savedSelectionRect.left - displayWidth - 10; // 如果右侧空间不够，显示在左侧
        }

        // 确保结果框不会超出屏幕下边界
        if (y + displayHeight > window.innerHeight + window.scrollY) {
          y = savedSelectionRect.bottom + window.scrollY + 10; // 显示在选中文本下方
          // 如果下方也不够空间，显示在上方
          if (y + displayHeight > window.innerHeight + window.scrollY) {
            y = savedSelectionRect.top + window.scrollY - displayHeight - 10;
          }
        }

        // 确保结果框不会超出屏幕上边界
        if (y < window.scrollY) {
          y = window.scrollY + 10;
        }

        resultDisplay.style.left = x + 'px';
        resultDisplay.style.top = y + 'px';
      } else {
        // 如果无法获取选中文本位置，使用屏幕中央
        resultDisplay.style.left = (window.innerWidth / 2 - 200) + 'px';
        resultDisplay.style.top = (window.innerHeight / 2 + window.scrollY) + 'px';
      }

      resultDisplay.style.opacity = '1';
      resultDisplay.style.transform = 'translateY(0)';

      // 不再设置自动隐藏定时器，只在点击外部时隐藏
      // resultHideTimer = setTimeout(hideResult, 5000);
    }
  } catch (error) {
    console.warn('Failed to show result:', error);
  }
}

// 隐藏结果
function hideResult() {
  try {
    // 清除定时器
    if (resultHideTimer) {
      clearTimeout(resultHideTimer);
      resultHideTimer = null;
    }

    if (resultDisplay) {
      resultDisplay.style.opacity = '0';
      resultDisplay.style.transform = 'translateY(-10px)';
    }
  } catch (error) {
    console.warn('Failed to hide result:', error);
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

// 处理时间戳转换
async function handleTimestampConversion() {
  try {
    console.log('handleTimestampConversion called, selectedText:', selectedText);

    if (!selectedText || !isTimestamp(selectedText)) {
      showResult('所选文本不是有效的时间戳');
      return;
    }

    const result = await callTimestampAPI(selectedText);
    console.log('Timestamp conversion result:', result);
    showResult(`时间戳转换结果: ${result}`);
  } catch (error) {
    console.warn('Timestamp conversion handling failed:', error);
    showResult('时间戳转换失败');
  }
}

// 处理翻译
async function handleTranslation() {
  try {
    console.log('handleTranslation called, selectedText:', selectedText);

    if (!selectedText) {
      showResult('没有选中的文本');
      return;
    }

    const result = await callTranslationAPI(selectedText);
    console.log('Translation result:', result);
    showResult(`翻译结果: ${result}`);
  } catch (error) {
    console.warn('Translation handling failed:', error);
    showResult('翻译失败');
  }
}

// 处理文本选择（带防抖）
function handleTextSelection() {
  try {
    // 清除之前的防抖定时器
    if (selectionDebounceTimer) {
      clearTimeout(selectionDebounceTimer);
    }

    // 设置防抖定时器，300ms后执行
    selectionDebounceTimer = setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const newSelectedText = selection.toString().trim();

        // 只有当选中文本发生变化且不为空时才处理
        if (newSelectedText && newSelectedText !== selectedText) {
          selectedText = newSelectedText;
          console.log('文本选择变化:', selectedText);

          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + window.scrollY;

          showTooltip(x, y, '右键选择功能');
        }
        // 如果新选择的文本为空，但之前有选择，则清除状态
        else if (!newSelectedText && selectedText) {
          selectedText = '';
          hideTooltip();
          hideContextMenu();
          // 注意：不要隐藏结果框，让用户可以看到结果
        }
      } else {
        // 只有在确实没有选择且之前有选择时才清除
        if (selectedText !== '') {
          selectedText = '';
          hideTooltip();
          hideContextMenu();
          // 注意：不要隐藏结果框，让用户可以看到结果
        }
      }
    }, 300); // 300ms 防抖延迟
  } catch (error) {
    console.warn('Text selection handling failed:', error);
  }
}

// 处理鼠标点击
function handleClick(event) {
  try {
    // 左键点击时隐藏所有弹出框，但不包括菜单项点击
    if (event.button === 0) {
      // 如果点击的是菜单项，不隐藏结果
      if (event.target && event.target.classList.contains('context-menu-item')) {
        return;
      }
      hideContextMenu();
      hideResult();
    }
  } catch (error) {
    console.warn('Click handling failed:', error);
  }
}

// 处理右键点击
function handleContextMenu(event) {
  try {
    if (selectedText.length === 0) return;

    // 阻止默认右键菜单
    event.preventDefault();

    // 显示自定义功能选择框
    showContextMenu();
  } catch (error) {
    console.warn('Context menu handling failed:', error);
  }
}

// 清理函数
function cleanup() {
  try {
    // 清理定时器
    if (resultHideTimer) {
      clearTimeout(resultHideTimer);
      resultHideTimer = null;
    }

    if (selectionDebounceTimer) {
      clearTimeout(selectionDebounceTimer);
      selectionDebounceTimer = null;
    }

    if (selectionTooltip) {
      selectionTooltip.remove();
      selectionTooltip = null;
    }
    if (contextMenu) {
      contextMenu.remove();
      contextMenu = null;
    }
    if (resultDisplay) {
      resultDisplay.remove();
      resultDisplay = null;
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
    // 移除selectionchange监听器，避免频繁触发
    // document.addEventListener('selectionchange', handleTextSelection);

    // 点击其他地方时隐藏所有弹出框
    document.addEventListener('click', (event) => {
      if (event.target &&
          event.target.id !== 'time-transfer-tooltip' &&
          event.target.id !== 'time-transfer-context-menu' &&
          event.target.id !== 'time-transfer-result-display' &&
          !event.target.classList.contains('context-menu-item')) {
        hideTooltip();
        hideContextMenu();
        hideResult();
      }
    });

    console.log('Time Transfer & Translator 内容脚本已加载');
  } catch (error) {
    console.warn('Failed to add event listeners:', error);
  }
}

// 监听扩展卸载
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onConnect) {
  try {
    chrome.runtime.onConnect.addListener(() => {
      // 连接建立时重新检查上下文
      isExtensionValid = checkExtensionContext();
    });
  } catch (error) {
    console.warn('Failed to add extension listener:', error);
  }
}

// 页面卸载时清理
window.addEventListener('beforeunload', cleanup);

// 初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addEventListeners);
} else {
  addEventListeners();
}
