'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, Languages, Settings } from 'lucide-react'

export function PopupInterface() {
  const [timestampInput, setTimestampInput] = useState('')
  const [translationInput, setTranslationInput] = useState('')
  const [timestampResult, setTimestampResult] = useState('')
  const [translationResult, setTranslationResult] = useState('')

  const convertTimestamp = async () => {
    try {
      const timestamp = parseInt(timestampInput)
      if (isNaN(timestamp)) {
        setTimestampResult('请输入有效的时间戳')
        return
      }

      // 判断是秒级还是毫秒级时间戳
      const date = new Date(timestamp.toString().length === 10 ? timestamp * 1000 : timestamp)
      setTimestampResult(date.toLocaleString('zh-CN'))
    } catch (error) {
      setTimestampResult('转换失败')
    }
  }

  const translateText = async () => {
    try {
      // 这里应该调用实际的翻译API
      // 暂时使用模拟数据
      setTranslationResult('翻译功能待实现 - 需要配置翻译API')
    } catch (error) {
      setTranslationResult('翻译失败')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="timestamp" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timestamp" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            时间戳
          </TabsTrigger>
          <TabsTrigger value="translation" className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            翻译
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            设置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timestamp">
          <Card>
            <CardHeader>
              <CardTitle>时间戳转换</CardTitle>
              <CardDescription>
                输入时间戳进行转换，支持秒级和毫秒级
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="输入时间戳..."
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
              />
              <Button onClick={convertTimestamp} className="w-full">
                转换
              </Button>
              {timestampResult && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium">转换结果：</p>
                  <p className="text-sm text-gray-600">{timestampResult}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translation">
          <Card>
            <CardHeader>
              <CardTitle>文本翻译</CardTitle>
              <CardDescription>
                英文翻译为中文
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="输入要翻译的文本..."
                value={translationInput}
                onChange={(e) => setTranslationInput(e.target.value)}
              />
              <Button onClick={translateText} className="w-full">
                翻译
              </Button>
              {translationResult && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium">翻译结果：</p>
                  <p className="text-sm text-gray-600">{translationResult}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>设置</CardTitle>
              <CardDescription>
                配置插件选项
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">时间戳API地址</label>
                <Input placeholder="https://api.example.com/timestamp" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">翻译API地址</label>
                <Input placeholder="https://api.example.com/translate" />
              </div>
              <Button className="w-full">保存设置</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
