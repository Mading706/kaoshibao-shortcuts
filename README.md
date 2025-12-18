# ⚡ 考试宝快捷键 (Kaoshibao Shortcuts)

[![Greasy Fork](https://img.shields.io/badge/Install-Greasy_Fork-brightgreen?style=flat-square&logo=tampermonkey)](https://greasyfork.org/zh-CN/scripts/558612-%E8%80%83%E8%AF%95%E5%AE%9D%E5%BF%AB%E6%8D%B7%E9%94%AE-kaoshibao-shortcuts)
[![Version](https://img.shields.io/badge/Version-2.1-blue?style=flat-square)](https://greasyfork.org/zh-CN/scripts/558612)
[![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)

专为 **[考试宝 (kaoshibao.com)](https://www.kaoshibao.com/)** 刷题设计的全能辅助脚本。

提供全可视化设置面板，支持智能回车连续刷题、自动解锁 VIP 解析、界面净化、自定义快捷键 (A-Z)、答题音效反馈等功能，**让刷题效率提升 200%！**

---

## ✨ 功能特性

| 功能 | 说明 |
| :--- | :--- |
| 🧠 **智能回车** | 一键流刷题！`Enter` 自动执行：提交答案 → 解锁解析 → 下一题 → 交卷 |
| 🔓 **VIP 解析破解** | 自动移除遮罩，显示被隐藏的答案解析（无需 VIP） |
| 🧹 **界面净化** | 去除广告、侧边栏、顶部导航、底部版权，沉浸式刷题 |
| 🎹 **全键盘操作** | 默认 `1-5` 对应选项 `A-E`，支持自定义 A-Z 所有选项快捷键 |
| 🎮 **脚本翻页** | `←` / `→` 方向键快速翻页，比原生更灵敏 |
| 🎵 **答题音效** | 答对/答错播放不同提示音，支持自定义音效 URL |
| 👀 **视觉反馈** | 翻页时屏幕中央显示醒目的方向箭头动画 |
| ⚙️ **可视化设置** | 可拖拽悬浮面板，所有功能均可独立开关 |

---

## 📥 安装方法

### 第一步：安装浏览器扩展

首先确保你的浏览器已安装以下任一脚本管理器：

| 扩展 | 推荐浏览器 |
| :--- | :--- |
| [Tampermonkey](https://www.tampermonkey.net/) | Chrome / Edge / Firefox / Safari |
| [Violentmonkey](https://violentmonkey.github.io/) | Chrome / Edge / Firefox |

### 第二步：安装脚本

点击下方按钮一键安装：

<p align="center">
  <a href="https://greasyfork.org/zh-CN/scripts/558612-%E8%80%83%E8%AF%95%E5%AE%9D%E5%BF%AB%E6%8D%B7%E9%94%AE-kaoshibao-shortcuts">
    <img src="https://img.shields.io/badge/🔧_点击安装脚本-Greasy_Fork-brightgreen?style=for-the-badge" alt="Install">
  </a>
</p>

### 第三步：开始使用

安装完成后，打开 [考试宝](https://www.kaoshibao.com/) 的任意刷题页面，脚本自动生效！

---

## 🎮 快捷键说明

### 默认按键

| 按键 | 功能 | 备注 |
| :---: | :--- | :--- |
| `1` - `5` | 选择选项 A - E | 可在设置中修改或添加 F-Z |
| `Enter` | 智能提交 | 提交 → 解锁 → 下一题 → 交卷 |
| `←` | 上一题 | 需开启"脚本翻页" |
| `→` | 下一题 | 需开启"脚本翻页" |
| `v` | 强制破解 | 手动触发 VIP 解锁 |

### ⚙️ 设置面板

脚本加载后，页面**右下角**会出现一个蓝色齿轮悬浮球 ⚙️：

- **单击** → 打开详细配置面板
- **拖拽** → 移动按钮位置（自动记忆）

在面板中你可以：

- ✅ 开启/关闭任意功能模块
- ⌨️ 自定义所有按键映射
- 🔊 配置自定义音效链接
- 🔄 一键重置为默认设置

---

## 📝 更新日志

### v2.1

#### 🐛 问题修复
- **修复** 按键设置取消无效问题 — 现在点击取消会正确还原所有更改
- **修复** 拖拽按钮后误触发刷新确认的问题
- **修复** 关闭 VIP 破解但开启界面净化时，AI 解析文字排版错位
- **修复** 强制破解快捷键未检查功能开关状态

#### ✨ 功能增强
- **新增** 按键冲突实时检测，防止同一按键绑定多个功能
- **新增** 音效 URL 格式验证
- **优化** 智能回车功能描述更加清晰
- **优化** 代码结构重构，提升可维护性

---

### v2.0

- 🔧 重构代码逻辑，提升稳定性
- 🎨 优化设置面板 UI

---

### v1.2

- ✨ 重构设置面板布局，分类更清晰
- 🎵 新增自定义音效功能，支持 MP3/WAV 链接
- 🎹 选项快捷键全面开放 A-Z 配置
- 🛠️ 优化默认配置，增强体验选项默认关闭

---

### v1.0 - v1.1

- 🚀 实现基础快捷键、界面净化及 VIP 解析破解
- ⚙️ 加入可视化设置面板

---

## 🛠️ 技术细节

- 使用 `MutationObserver` 监听 DOM 变化，自动处理动态加载内容
- 防抖处理避免频繁触发影响性能
- 配置持久化存储于 `localStorage`
- 纯原生 JavaScript，无外部依赖

---

## 🤝 贡献与反馈

欢迎提交 Issue 和 Pull Request！

- 🐛 **报告 Bug** → [GitHub Issues](https://github.com/Mading706/kaoshibao-shortcuts/issues)
- 💡 **功能建议** → [GitHub Discussions](https://github.com/Mading706/kaoshibao-shortcuts/discussions)
- 💬 **使用交流** → [Greasy Fork 评论区](https://greasyfork.org/zh-CN/scripts/558612/feedback)

---

## ⚠️ 免责声明

本脚本仅供学习交流使用，请勿用于商业用途或考试作弊。使用本脚本所产生的一切后果由用户自行承担。

---

## 📜 开源许可

本项目基于 [MIT License](LICENSE) 开源。

---

<p align="center">
  <b>如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！</b>
</p>
