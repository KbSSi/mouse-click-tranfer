// 弹窗脚本
document.addEventListener('DOMContentLoaded', function() {
  // 标签页切换
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // 移除所有活动状态
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      // 添加活动状态
      tab.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  // 时间戳转换
  document.getElementById('convertBtn').addEventListener('click', async () => {
    const input = document.getElementById('timestampInput');
    const result = document.getElementById('timestampResult');
    const btn = document.getElementById('convertBtn');

    const timestamp = input.value.trim();
    if (!timestamp) {
      showResult(result, '请输入时间戳', 'error');
      return;
    }

    if (!/^\d{10}$/.test(timestamp) && !/^\d{13}$/.test(timestamp)) {
      showResult(result, '请输入有效的时间戳（10位或13位数字）', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = '转换中...';

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'convertTimestamp',
        timestamp: timestamp
      });

      if (response.success) {
        showResult(result, response.result, 'success');
      } else {
        showResult(result, response.error || '转换失败', 'error');
      }
    } catch (error) {
      showResult(result, '转换失败: ' + error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '转换';
    }
  });

  // 文本翻译
  document.getElementById('translateBtn').addEventListener('click', async () => {
    const input = document.getElementById('translationInput');
    const result = document.getElementById('translationResult');
    const btn = document.getElementById('translateBtn');

    const text = input.value.trim();
    if (!text) {
      showResult(result, '请输入要翻译的文本', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = '翻译中...';

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'translateText',
        text: text
      });

      if (response.success) {
        showResult(result, response.result, 'success');
      } else {
        showResult(result, response.error || '翻译失败', 'error');
      }
    } catch (error) {
      showResult(result, '翻译失败: ' + error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '翻译';
    }
  });

  // 保存设置
  document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
    const btn = document.getElementById('saveSettingsBtn');
    const statusText = document.getElementById('statusText');

    const settings = {
      sourceLanguage: document.getElementById('sourceLanguage').value,
      targetLanguage: document.getElementById('targetLanguage').value
    };

    btn.disabled = true;
    btn.textContent = '保存中...';
    statusText.textContent = '保存设置中...';

    try {
      await chrome.storage.sync.set(settings);
      statusText.textContent = '设置已保存';
      setTimeout(() => {
        statusText.textContent = '就绪';
      }, 2000);
    } catch (error) {
      statusText.textContent = '保存失败';
      console.error('保存设置失败:', error);
    } finally {
      btn.disabled = false;
      btn.textContent = '保存设置';
    }
  });

  // 加载设置
  loadSettings();

  // 显示结果
  function showResult(element, message, type) {
    element.textContent = message;
    element.className = `result ${type}`;
    element.style.display = 'block';
  }

  // 加载设置
  async function loadSettings() {
    try {
      const settings = await chrome.storage.sync.get([
        'sourceLanguage',
        'targetLanguage'
      ]);

      document.getElementById('sourceLanguage').value = settings.sourceLanguage || 'auto';
      document.getElementById('targetLanguage').value = settings.targetLanguage || 'en';
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }

  // 键盘快捷键
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const activeTab = document.querySelector('.tab-content.active');
      if (activeTab.id === 'timestamp') {
        document.getElementById('convertBtn').click();
      } else if (activeTab.id === 'translation') {
        document.getElementById('translateBtn').click();
      }
    }
  });
});
