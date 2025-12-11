// ==UserScript==
// @name         考试宝快捷键 (Kaoshibao Shortcuts)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  考试宝刷题辅助：全可视化设置，功能可独立开关（箭头翻页/净化/智能回车），支持A-Z自定义按键
// @match        *://*.kaoshibao.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // 1. 配置管理 & 初始化
    // ==========================================

    // 生成默认键位配置 (1-5 对应 A-E)
    const generateDefaultKeys = () => {
        const keys = {
            submit: 'Enter',      // 提交/智能回车
            prev: 'ArrowLeft',    // 上一题
            next: 'ArrowRight',   // 下一题
            forceUnlock: 'v'      // 强制触发VIP破解
        };
        // 初始化 A-Z 选项键位
        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i); // A-Z
            // 默认仅 A-E 对应 1-5，其余留空
            if (i < 5) keys[`op_${char}`] = (i + 1).toString();
            else keys[`op_${char}`] = '';
        }
        return keys;
    };

    // 默认配置结构
    const DEFAULT_CONFIG = {
        features: {
            cleanUI: true,       // 界面净化 (去广告/多余元素)
            vipUnlock: true,     // VIP 解析自动破解
            autoClose: true,     // 自动关闭干扰弹窗
            smartEnter: true,    // 智能回车 (提交 -> 破解 -> 下一题)
            scriptNav: true      // 脚本翻页控制 (是否允许脚本接管上一题/下一题按键)
        },
        keys: generateDefaultKeys()
    };

    // 读取本地配置，若无则使用默认
    let userConfig = JSON.parse(localStorage.getItem('ksb_script_config')) || DEFAULT_CONFIG;

    // 数据结构兼容性合并 (防止旧版配置缺少新字段)
    userConfig.features = { ...DEFAULT_CONFIG.features, ...userConfig.features };
    userConfig.keys = { ...DEFAULT_CONFIG.keys, ...userConfig.keys };

    // 保存配置并刷新
    function saveConfig() {
        localStorage.setItem('ksb_script_config', JSON.stringify(userConfig));
        alert('设置已保存，页面即将刷新以应用更改。');
        location.reload();
    }

    // 重置配置
    function resetConfig() {
        if(confirm('确定要恢复默认设置吗？(自定义按键将被重置)')) {
            localStorage.removeItem('ksb_script_config');
            location.reload();
        }
    }

    // ==========================================
    // 2. 核心功能模块
    // ==========================================

    // 模块：界面净化
    // 隐藏 header, footer, 侧边栏, 广告位等
    function applyCleanUI() {
        if (!userConfig.features.cleanUI) return;

        // 防止重复注入样式
        if (document.getElementById('ksb-clean-style')) return;

        const css = `
            .header, .new-footer, .vip-quanyi, .vip-tips, .right-float-window, .advertisement, .ad-box { display: none !important; }
            .app-main { padding-top: 20px !important; }
            /* 强制显示被隐藏的解析内容 */
            .answer-analysis.option { display: block !important; }
            /* 隐藏题目区域内的内嵌广告块 */
            .answer-box-detail > div:not(.answer-analysis):not(.option) { display: none !important; }
        `;
        const style = document.createElement('style');
        style.id = 'ksb-clean-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // 模块：VIP 解析破解
    // 移除遮罩按钮，修改 DOM 类名以显示解析
    function unlockVIP() {
        if (!userConfig.features.vipUnlock) return;

        const ans = document.querySelector(".answer-analysis");
        if (ans) {
            // 核心 Hack: 修改 class 让 CSS 以为它是普通选项从而显示
            ans.className = "option";
            // 移除 "购买VIP" 按钮
            const lockedBtn = document.querySelector(".answer-analysis-row.hide-height > button");
            if (lockedBtn) lockedBtn.remove();
        }
    }

    // 模块：自动关弹窗
    // 处理每日刷题限制提示等弹窗
    function checkDialog() {
        if (!userConfig.features.autoClose) return;

        const okBtn = document.querySelector(".el-message-box__btns .el-button--primary");
        if (okBtn) {
            okBtn.click();
        }
    }

    // --- 基础 DOM 操作封装 ---

    // XPath 点击查找 (支持精确匹配和模糊匹配)
    function clickByXPath(xpath) {
        const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < result.snapshotLength; i++) {
            let el = result.snapshotItem(i);
            // 确保元素存在且可见(简单判断)
            if (el.offsetParent !== null) {
                el.click();
                return true;
            }
        }
        return false;
    }

    // 点击包含特定文本的元素
    function clickText(text) {
        return clickByXPath(`//*[contains(text(), '${text}')]`);
    }

    // 选择 A-Z 选项
    function selectOption(char) {
        // 策略1: 精确匹配 (例如圆圈内的 "A")
        if (clickByXPath(`//*[normalize-space(text())='${char}']`)) return;
        // 策略2: 前缀匹配 (例如 "A. 内容...")
        clickByXPath(`//*[starts-with(normalize-space(text()), '${char} ') or starts-with(normalize-space(text()), '${char}.')]`);
    }

    // ==========================================
    // 3. 全局键盘事件监听 (捕获模式)
    // ==========================================

    // 使用 capture: true 确保脚本优先于网页原有脚本获取按键事件，从而能够拦截(stopPropagation)
    document.addEventListener('keydown', function(e) {
        // 1. 如果焦点在输入框中，不触发脚本
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) {
            return;
        }

        const k = e.key;
        const map = userConfig.keys;
        let isHandled = false; // 标记该按键是否被脚本处理了

        // --- 逻辑 A: 选项选择 (A-Z) ---
        // 遍历配置，查找当前按键是否对应某个选项
        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i); // A, B, ... Z
            const configKey = `op_${char}`;
            // 检查键位是否有定义，且是否匹配当前按键
            if (map[configKey] && map[configKey] === k) {
                selectOption(char);
                isHandled = true;
                break; // 找到匹配项，跳出循环
            }
        }

        // --- 逻辑 B: 功能控制 ---
        if (!isHandled) {
            // 1. 提交/智能回车
            if (k === map.submit) {
                isHandled = true;
                if (userConfig.features.smartEnter) {
                    // 智能模式: 提交 -> (没提交按钮则) -> 破解 -> 下一题 -> (最后) -> 交卷
                    if (clickText('提交答案')) {
                        setTimeout(unlockVIP, 100); // 提交后稍微延迟尝试破解
                    } else if (clickText('下一题')) {
                        setTimeout(applyCleanUI, 200); // 切题后刷新UI净化
                    } else {
                        clickText('交卷');
                    }
                } else {
                    // 普通模式: 仅提交
                    clickText('提交答案');
                }
            }

            // 2. 上一题 (仅在开启脚本翻页时生效)
            else if (k === map.prev) {
                if (userConfig.features.scriptNav) {
                    isHandled = true;
                    clickText('上一题');
                }
            }

            // 3. 下一题 (仅在开启脚本翻页时生效)
            else if (k === map.next) {
                if (userConfig.features.scriptNav) {
                    isHandled = true;
                    clickText('下一题');
                    setTimeout(applyCleanUI, 200);
                }
            }

            // 4. 强制 VIP 破解 (手动兜底)
            else if (k === map.forceUnlock) {
                isHandled = true;
                unlockVIP();
            }
        }

        // --- 逻辑 C: 冲突拦截 ---
        // 如果脚本处理了该按键，则阻止事件冒泡，防止网页自带功能(如自带的箭头切题)触发导致冲突
        if (isHandled) {
            e.stopPropagation();           // 阻止冒泡
            e.stopImmediatePropagation();  // 阻止其他监听器
            e.preventDefault();            // 阻止浏览器默认行为
        }

    }, true); // <--- 开启捕获模式 (Capture Phase)

    // ==========================================
    // 4. 设置面板 UI 构建
    // ==========================================

    function createSettingsUI() {
        // 避免重复创建
        if (document.getElementById('ksb-panel')) return;

        // 注入设置面板样式
        const style = document.createElement('style');
        style.textContent = `
            #ksb-btn { position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: #409EFF; color: white; border-radius: 50%; width: 40px; height: 40px; text-align: center; line-height: 40px; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.2); font-size: 20px; transition: transform 0.2s; user-select: none; }
            #ksb-btn:hover { transform: scale(1.1); background: #66b1ff; }
            #ksb-panel { display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 520px; background: white; z-index: 10000; padding: 20px; border-radius: 8px; box-shadow: 0 5px 25px rgba(0,0,0,0.3); font-family: system-ui, -apple-system, sans-serif; max-height: 85vh; overflow-y: auto; color: #333; }
            .ksb-mask { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9998; }
            .ksb-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #eee; display: flex; justify-content: space-between; align-items: center; }
            .ksb-sec-title { margin-top: 20px; margin-bottom: 10px; font-weight: bold; font-size: 14px; color: #409EFF; background: #ecf5ff; padding: 6px 10px; border-radius: 4px; border-left: 4px solid #409EFF; }
            .ksb-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 4px 0; border-bottom: 1px dashed #f0f0f0; }
            .ksb-row label { font-size: 14px; cursor: pointer; }
            .ksb-input { width: 100px; padding: 6px; border: 1px solid #dcdfe6; border-radius: 4px; text-align: center; font-family: monospace; font-weight: bold; color: #606266; outline: none; transition: border 0.2s; }
            .ksb-input:focus { border-color: #409EFF; background: #f0f9eb; }
            .ksb-checkbox { transform: scale(1.2); cursor: pointer; }
            .ksb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .ksb-grid .ksb-row { border: none; background: #fafafa; padding: 5px 10px; border-radius: 4px; }
            .ksb-btns { margin-top: 25px; text-align: right; position: sticky; bottom: -20px; background: white; padding: 15px 0 5px 0; border-top: 1px solid #eee; }
            .ksb-btn { padding: 8px 18px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 13px; transition: opacity 0.2s; }
            .ksb-btn:hover { opacity: 0.8; }
            .ksb-save { background: #67C23A; color: white; }
            .ksb-reset { background: #E6A23C; color: white; }
            .ksb-close { background: #909399; color: white; }
        `;
        document.head.appendChild(style);

        // 创建 DOM 元素
        const btn = document.createElement('div'); btn.id = 'ksb-btn'; btn.innerHTML = '⚙️'; btn.title = '脚本设置';
        const mask = document.createElement('div'); mask.className = 'ksb-mask';
        const panel = document.createElement('div'); panel.id = 'ksb-panel';

        // 构建面板 HTML
        let html = `
            <div class="ksb-title">
                <span>考试宝助手配置</span>
            </div>
        `;

        // 1. 功能开关区域
        html += `<div class="ksb-sec-title">核心功能开关 (勾选即启用)</div>`;
        const featuresMap = {
            'cleanUI': '界面净化 (去广告/精简布局)',
            'scriptNav': '启用脚本翻页 (接管箭头按键)',
            'smartEnter': '智能回车 (推荐: 提交+破解+跳题)',
            'vipUnlock': '自动破解 VIP 解析',
            'autoClose': '自动关闭干扰弹窗'
        };
        for (let key in featuresMap) {
            html += `
                <div class="ksb-row">
                    <label for="kf-${key}">${featuresMap[key]}</label>
                    <input type="checkbox" id="kf-${key}" class="ksb-checkbox" ${userConfig.features[key] ? 'checked' : ''}>
                </div>
            `;
        }

        // 2. 通用按键配置区域
        html += `<div class="ksb-sec-title">控制键位设置</div>`;
        const ctrlsMap = {
            'submit': '提交 / 智能回车',
            'prev': '上一题 (需启用脚本翻页)',
            'next': '下一题 (需启用脚本翻页)',
            'forceUnlock': '强制显示解析'
        };
        for (let key in ctrlsMap) {
            html += `
                <div class="ksb-row">
                    <label>${ctrlsMap[key]}</label>
                    <input type="text" class="ksb-input" id="kk-${key}" value="${userConfig.keys[key]}" readonly placeholder="点击录入">
                </div>
            `;
        }

        // 3. 选项按键配置区域 (A-Z)
        html += `<div class="ksb-sec-title">选项映射 (支持 A-Z，留空即禁用)</div><div class="ksb-grid">`;
        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i);
            const keyVal = userConfig.keys[`op_${char}`] || '';
            html += `
                <div class="ksb-row">
                    <label>选项 ${char}</label>
                    <input type="text" class="ksb-input" id="kk-op_${char}" value="${keyVal}" readonly placeholder="未设置">
                </div>
            `;
        }
        html += `</div>`;

        // 底部按钮区域
        html += `
            <div class="ksb-btns">
                <button class="ksb-btn ksb-reset">恢复默认</button>
                <button class="ksb-btn ksb-close">取消</button>
                <button class="ksb-btn ksb-save">保存配置</button>
            </div>
        `;

        panel.innerHTML = html;
        document.body.appendChild(btn);
        document.body.appendChild(mask);
        document.body.appendChild(panel);

        // --- 事件绑定 ---

        // 打开/关闭面板
        const togglePanel = (show) => {
            panel.style.display = show ? 'block' : 'none';
            mask.style.display = show ? 'block' : 'none';
        };
        btn.onclick = () => togglePanel(true);
        mask.onclick = () => togglePanel(false);
        panel.querySelector('.ksb-close').onclick = () => togglePanel(false);

        // 重置按钮
        panel.querySelector('.ksb-reset').onclick = resetConfig;

        // 保存按钮
        panel.querySelector('.ksb-save').onclick = () => {
            // 保存功能开关状态
            for (let key in userConfig.features) {
                const checkbox = document.getElementById(`kf-${key}`);
                if (checkbox) userConfig.features[key] = checkbox.checked;
            }
            // (按键配置已在录入时暂存到内存对象 userConfig 中)
            saveConfig();
        };

        // 按键录入逻辑
        panel.querySelectorAll('.ksb-input').forEach(input => {
            // 聚焦时提示
            input.onfocus = () => {
                input.style.borderColor = '#409EFF';
                input.value = '请按键...';
            };
            // 失焦时恢复显示当前配置
            input.onblur = () => {
                input.style.borderColor = '#dcdfe6';
                const configKey = input.id.replace('kk-', '');
                input.value = userConfig.keys[configKey] || '';
            };
            // 监听按键输入
            input.onkeydown = (e) => {
                e.preventDefault();
                e.stopPropagation();

                let keyName = e.key;
                // 特殊显示优化
                if (keyName === ' ') keyName = 'Space';
                // 允许通过删除键清空设置
                if (keyName === 'Backspace' || keyName === 'Delete') keyName = '';

                // 更新内存中的配置
                const configKey = input.id.replace('kk-', '');
                userConfig.keys[configKey] = keyName;

                // 更新显示并失焦
                input.value = keyName;
                input.blur();
            };
        });
    }

    // ==========================================
    // 5. 脚本入口
    // ==========================================

    // 延迟一点执行以确保页面基础元素加载
    setTimeout(() => {
        applyCleanUI();
        createSettingsUI();
        // 启动弹窗检测轮询
        setInterval(checkDialog, 1500);
    }, 500);

})();
