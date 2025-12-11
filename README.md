# ⚡ 考试宝快捷键 (Kaoshibao Shortcuts)

[![Greasy Fork](https://img.shields.io/badge/Install-Greasy_Fork-green?style=flat-square&logo=tampermonkey)](https://greasyfork.org/zh-CN/scripts/558612-%E8%80%83%E8%AF%95%E5%AE%9D%E5%BF%AB%E6%8D%B7%E9%94%AE-kaoshibao-shortcuts)
[![Version](https://img.shields.io/badge/Version-2.0-blue?style=flat-square)](https://greasyfork.org/zh-CN/scripts/558612)
[![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)

专为 **考试宝 (kaoshibao.com)** 刷题设计的全能辅助脚本。提供全可视化设置面板，支持自定义快捷键、智能回车提交、自动解锁VIP解析、答题音效反馈以及界面净化等功能，助你极速刷题，效率倍增！

## ✨ 主要功能

* **🎹 全键盘操作**：默认 `1-5` 对应选项 `A-E`，`←/→` 翻页。支持在设置中自定义 **A-Z** 所有选项的快捷键。
* **🧠 智能回车 (Smart Enter)**：一键流刷题！按 `Enter` 键自动执行：`提交答案` -> `(如未提交)自动解锁解析` -> `进入下一题`。
* **🔓 VIP 解析破解**：自动移除遮挡，显示被隐藏的答案解析（无需 VIP）。
* **🧹 界面净化**：去除广告、侧边栏、顶部导航和底部版权信息，提供沉浸式刷题体验。
* **🎵 答题音效**：答对/答错播放不同提示音（类似游戏体验），支持输入 URL 自定义音效。
* **👀 视觉反馈**：按下方向键翻页时，屏幕中央显示醒目的大箭头动画。
* **⚙️ 可视化设置**：提供可拖拽的悬浮设置面板，所有功能均可独立开启/关闭。

## 📥 安装指南

1.  **安装管理器**：首先确保您的浏览器已安装 [Tampermonkey](https://www.tampermonkey.net/) (油猴) 插件。
2.  **安装脚本**：点击下方链接前往 Greasy Fork。
    * 👉 **[前往 Greasy Fork 安装脚本](https://greasyfork.org/zh-CN/scripts/558612-%E8%80%83%E8%AF%95%E5%AE%9D%E5%BF%AB%E6%8D%B7%E9%94%AE-kaoshibao-shortcuts)**
3.  **开始使用**：安装完成后，打开 [考试宝](https://www.kaoshibao.com/) 的任意刷题页面即可生效。

## 🎮 使用说明

### 默认快捷键
| 按键 | 功能 | 说明 |
| :--- | :--- | :--- |
| **1 - 5** | 选择 A - E | 可在设置中修改或添加 F-Z |
| **Enter** | 智能提交 | 提交 / 解锁解析 / 下一题 |
| **← / →** | 上一题 / 下一题 | 需开启"脚本翻页"功能 |
| **v** | 强制破解 | 手动强制显示 VIP 解析 |

### ⚙️ 设置面板
脚本加载后，页面右下角会出现一个 **蓝色齿轮悬浮球 (⚙️)**：
1.  **点击**：打开详细配置面板。
2.  **拖拽**：可以将按钮拖放到屏幕任意位置（位置会自动记忆）。

在面板中，您可以：
* 开启/关闭任意核心功能（如去广告、音效）。
* 录入自定义按键（点击输入框后按下键盘即可）。
* 配置自定义的正确/错误提示音链接。

## 🖼️ 预览

> <img width="759" height="1157" alt="image" src="https://github.com/user-attachments/assets/a25a86da-2b35-436d-b32c-62d8df0ad48a" />


## 📝 更新日志
### v2.0
* 优化了代码逻辑。

### v1.2
* ✨ 重构设置面板布局，分类更清晰。
* 🎵 新增自定义音效功能，支持输入 MP3/WAV 链接。
* 🎹 选项快捷键列表全面开放 A-Z 配置。
* 🛠️ 优化默认配置逻辑，增强体验选项默认关闭。

### v1.0 - v1.1
* 实现基础快捷键、界面净化及 VIP 解析破解功能。
* 加入可视化设置面板。

## 🤝 贡献与反馈

如果您在使用过程中发现 BUG 或有新的功能建议，欢迎在 GitHub 提交 [Issue](https://github.com/Mading706/kaoshibao-shortcuts/issues) 或在 Greasy Fork 评论区留言。

## 📜 许可证

本项目基于 [MIT License](LICENSE) 开源。
