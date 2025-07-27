import { PopupInterface } from '@/components/PopupInterface'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Time Transfer & Translator
          </h1>
          <p className="text-lg text-gray-600">
            Chrome插件：鼠标滑词进行时间戳转换和翻译
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <PopupInterface />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">时间戳转换</h2>
            <p className="text-gray-600 mb-4">
              选中时间戳文本后点击鼠标左键，自动转换为可读的日期时间格式。
            </p>
            <div className="bg-gray-50 p-3 rounded">
              <code className="text-sm">1640995200 → 2022-01-01 08:00:00</code>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">文本翻译</h2>
            <p className="text-gray-600 mb-4">
              选中英文文本后点击鼠标右键，自动翻译为中文。
            </p>
            <div className="bg-gray-50 p-3 rounded">
              <code className="text-sm">Hello World → 你好世界</code>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
