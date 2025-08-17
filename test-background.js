// 测试 background.js 中的 runWorkflow 函数

// 模拟 Chrome 扩展环境
const chrome = {
  runtime: {
    onMessage: {
      addListener: (callback) => {
        // 模拟收到翻译请求
        const request = {
          action: 'translateText',
          user: 'test-user',
          text: 'Hello, world!'
        };
        
        const sender = {};
        
        const sendResponse = (response) => {
          console.log('响应:', response);
        };
        
        callback(request, sender, sendResponse);
      }
    }
  },
  storage: {
    sync: {
      get: (keys, callback) => {
        // 模拟获取语言设置
        callback({
          sourceLanguage: 'en',
          targetLanguage: 'zh'
        });
      }
    }
  }
};

// 导入 background.js 文件
require('./extension-build/background.js');