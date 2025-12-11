# 考试宝增强脚本 (Kaoshibao Shortcuts)

一个为 [考试宝](https://kaoshibao.com) 设计的 Tampermonkey 用户脚本，提供多项增强功能，让你的学习体验更加流畅高效。

## ✨ 核心特性

### 🎹 自定义快捷键
- **灵活配置**: 支持自定义键盘快捷键，适应你的个人习惯
- **快速导航**: 使用快捷键快速切换题目、提交答案
- **提高效率**: 减少鼠标操作，让答题更流畅

### ⚡ 智能回车提交
- **快速提交**: 按下回车键即可快速提交答案
- **智能识别**: 自动识别当前答题状态，避免误操作
- **节省时间**: 无需频繁使用鼠标点击提交按钮

### 🔓 VIP答案自动解锁
- **自动解锁**: 自动解锁需要VIP权限的答案内容
- **无缝体验**: 无需手动操作，自动显示完整答案
- **学习便利**: 方便查看和学习完整的解题思路

### 🎨 界面净化
- **去除广告**: 自动隐藏页面中的广告内容
- **清爽界面**: 优化页面布局，突出核心功能
- **专注学习**: 减少干扰，提供更专注的学习环境

## 📦 安装说明

### 前置要求
1. 安装浏览器扩展管理器（选择其一）：
   - [Tampermonkey](https://www.tampermonkey.net/) (推荐)
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Greasemonkey](https://www.greasespot.net/) (仅限 Firefox)

### 安装步骤
1. 确保已安装上述扩展管理器之一
2. 点击 [安装脚本](#) 链接（或从发布页面下载 `.user.js` 文件）
3. 扩展管理器会自动识别并弹出安装确认对话框
4. 点击"安装"或"确认"按钮完成安装
5. 访问 [kaoshibao.com](https://kaoshibao.com) 即可使用

## 🎮 使用指南

### 快捷键设置
脚本安装后，默认快捷键如下：

| 功能 | 默认快捷键 | 说明 |
|------|-----------|------|
| 下一题 | `→` (右方向键) | 切换到下一道题目 |
| 上一题 | `←` (左方向键) | 切换到上一道题目 |
| 提交答案 | `Enter` (回车) | 快速提交当前答案 |
| 显示答案 | `Space` (空格) | 显示/隐藏答案 |

### 自定义快捷键
1. 点击浏览器工具栏中的 Tampermonkey 图标
2. 选择"管理面板"
3. 找到"考试宝增强脚本"，点击"编辑"
4. 在脚本设置中修改快捷键配置
5. 保存更改并刷新页面

### 功能开关
你可以在脚本设置中独立开启或关闭各项功能：

```javascript
// 在脚本设置部分可自定义配置
const config = {
  enableShortcuts: true,      // 启用快捷键
  enableSmartEnter: true,     // 启用智能回车
  enableVIPUnlock: true,      // 启用VIP解锁
  enableAdRemoval: true,      // 启用广告移除
};
```

## ⚙️ 配置选项

### 快捷键配置
```javascript
// 自定义快捷键映射
const shortcuts = {
  nextQuestion: 'ArrowRight',  // 下一题
  prevQuestion: 'ArrowLeft',   // 上一题
  submitAnswer: 'Enter',       // 提交答案
  toggleAnswer: 'Space',       // 显示答案
};
```

### 界面净化配置
```javascript
// 自定义要移除的元素选择器
const adSelectors = [
  '.advertisement',
  '.ad-banner',
  '.sponsored-content',
  // 添加更多选择器...
];
```

## 🛠️ 开发与贡献

### 本地开发
```bash
# 克隆仓库
git clone https://github.com/Mading706/kaoshibao-shortcuts.git

# 进入项目目录
cd kaoshibao-shortcuts

# 使用你喜欢的编辑器打开项目
code .
```

### 贡献指南
我们欢迎所有形式的贡献！

1. **Fork** 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 **Pull Request**

### 报告问题
如果你发现任何问题或有功能建议，请：
1. 访问 [Issues](https://github.com/Mading706/kaoshibao-shortcuts/issues) 页面
2. 搜索是否已有相关问题
3. 如果没有，创建新的 Issue 并详细描述问题或建议

## 📋 常见问题

**Q: 脚本不工作怎么办？**  
A: 请确保已正确安装 Tampermonkey 并刷新页面。检查浏览器控制台是否有错误信息。

**Q: 如何禁用某个功能？**  
A: 在脚本编辑器中修改对应的配置项为 `false`，然后保存并刷新页面。

**Q: 快捷键冲突怎么办？**  
A: 可以在脚本设置中自定义快捷键，避免与其他扩展或网站功能冲突。

**Q: VIP解锁功能是否合法？**  
A: 本脚本仅供学习交流使用，请尊重内容创作者的劳动成果，支持正版。

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

## ⚠️ 免责声明

本脚本仅供学习和研究使用，使用本脚本产生的任何后果由使用者自行承担。请尊重网站的使用条款和内容版权。

## 🙏 致谢

感谢所有为本项目做出贡献的开发者和用户！

---

**如果这个项目对你有帮助，请给它一个 ⭐️！**
