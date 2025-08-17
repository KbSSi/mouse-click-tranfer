// 最小化 Service Worker
console.log('Time Transfer & Translator Service Worker 启动');

// Dify API 工具函数
/**
 * 运行工作流
 * @param {string} user - 用户标识
 * @param {Object} input - 输入参数
 * @param {string} responseMode - 响应模式
 * @returns {Promise<Object>} 工作流执行结果
 */
async function runWorkflow(user, input, responseMode = 'blocking') {
  const workflowUrl = 'https://api.dify.ai/v1/workflows/run';
  const headers = {
    'Authorization': 'Bearer app-qtDTbx9mMEOZEzOVCFMrHe5Z', // 从 tsconfig.json 获取的 app-key
    'Content-Type': 'application/json'
  };

  const data = {
    inputs: input,
    response_mode: responseMode,
    user: user
  };

  try {
    console.log('运行工作流...');
    const response = await fetch(workflowUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
    
    console.log('工作流响应状态:', response.status);
    
    if (response.status === 200) {
      console.log('工作流执行成功');
      const responseData = await response.json();
      console.log('工作流响应数据:', responseData);
      return responseData.data?.outputs?.out || responseData;
    } else {
      console.log(`工作流执行失败，状态码: ${response.status}`);
      return { status: 'error', message: `Failed to execute workflow, status code: ${response.status}`, response: await response.json() };
    }
  } catch (error) {
    console.log(`发生错误: ${error.message}`);
    return { status: 'error', message: error.message };
  }
}

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
      // 获取语言设置
      chrome.storage.sync.get(['sourceLanguage', 'targetLanguage'], (settings) => {
        const sourceLang = settings.sourceLanguage || 'auto';
        const targetLang = settings.targetLanguage || 'en';
        
        // 调用 Dify 工作流
        runWorkflow('time-transfer-user', {
          source_language: sourceLang,
          target_language: targetLang,
          input: request.text
        }).then(difyResponse => {
          sendResponse({ success: true, result: difyResponse });
        });
        
      });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
});

console.log('Service Worker 初始化完成');
