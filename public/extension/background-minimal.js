// 最小化 Service Worker
console.log('Time Transfer & Translator Service Worker 启动');

// 插件安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('插件已安装');
});

// 消息处理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);

  if (request.action === 'convertTimestamp') {
    try {
      const timestamp = parseInt(request.timestamp);
      const date = new Date(timestamp.toString().length === 10 ? timestamp * 1000 : timestamp);
      const result = date.toLocaleString('zh-CN');
      sendResponse({ success: true, result });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }

  if (request.action === 'translateText') {
    try {
      const result = `翻译: ${request.text} (模拟翻译)`;
      sendResponse({ success: true, result });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
});

console.log('Service Worker 初始化完成');
