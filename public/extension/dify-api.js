// Dify API 工具函数

// 导入配置文件
import config from '../../tsconfig.json';

/**
 * 运行工作流
 * @param {string} user - 用户标识
 * @param {Object} input - 输入参数
 * @param {string} responseMode - 响应模式
 * @returns {Promise<Object>} 工作流执行结果
 */
async function runWorkflow(user,input, responseMode = 'blocking') {
  const workflowUrl = 'https://api.dify.ai/v1/workflows/run';
  const headers = {
    'Authorization': `Bearer ${config["app-key"]}`,
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
    
    if (response.status === 200) {
      console.log('工作流执行成功');
      const responseData = await response.json();
      return responseData.data?.outputs?.out || responseData;
    } else {
      console.log(`工作流执行失败，状态码: ${response.status}`);
      return { status: 'error', message: `Failed to execute workflow, status code: ${response.status}` };
    }
  } catch (error) {
    console.log(`发生错误: ${error.message}`);
    return { status: 'error', message: error.message };
  }
}

// 导出函数供其他模块使用
export {runWorkflow };