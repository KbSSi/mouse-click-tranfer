// Service Worker - 简化版后台脚本

// 插件安装时的处理
chrome.runtime.onInstalled.addListener(() => {
  console.log('Time Transfer & Translator 插件已安装');

  // 设置默认配置
  chrome.storage.sync.set({
    timestampApiUrl: '',
    translationApiUrl: '',
    enableTimestamp: true,
    enableTranslation: true
  }).catch(error => {
    console.error('设置默认配置失败:', error);
  });
});

// 处理来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'convertTimestamp') {
    handleTimestampConversion(request.timestamp)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 保持消息通道开放
  }

  if (request.action === 'translateText') {
    handleTranslation(request.text)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 保持消息通道开放
  }
});

// 处理时间戳转换
async function handleTimestampConversion(timestamp) {
  try {
    // 使用本地转换
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
    console.error('时间戳转换失败:', error);
    throw new Error('时间戳转换失败');
  }
}

// 处理文本翻译
async function handleTranslation(text) {
  try {
    // 返回模拟翻译结果
    return `翻译: ${text} (模拟翻译结果)`;
  } catch (error) {
    console.error('翻译失败:', error);
    throw new Error('翻译失败');
  }
}

console.log('Time Transfer & Translator Service Worker 已加载');
