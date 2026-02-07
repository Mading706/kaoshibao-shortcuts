// ==UserScript==
// @name         考试宝快捷键 (Kaoshibao Shortcuts)
// @namespace    https://github.com/Mading706/kaoshibao-shortcuts
// @version      2.1
// @author       Mading706
// @description  考试宝刷题辅助脚本：智能回车提交、VIP解析破解、界面净化、自定义快捷键(A-Z)、答题音效反馈、按键视觉指示，所有功能均可独立开关
// @homepage     https://github.com/Mading706/kaoshibao-shortcuts
// @supportURL   https://github.com/Mading706/kaoshibao-shortcuts/issues
// @license      MIT
// @match        *://*.kaoshibao.com/*
// @icon         https://www.kaoshibao.com/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    /* ========================================
     * 配置管理
     * ======================================== */

    // 生成默认按键映射 (A-E 对应 1-5，其余为空)
    const generateDefaultKeys = () => {
        const keys = { submit: 'Enter', prev: 'ArrowLeft', next: 'ArrowRight', forceUnlock: 'v' };
        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i);
            keys[`op_${char}`] = i < 5 ? (i + 1).toString() : '';
        }
        return keys;
    };

    const DEFAULT_CONFIG = {
        features: {
            smartEnter: true,      // 智能回车
            vipUnlock: true,       // VIP破解
            cleanUI: true,         // 界面净化
            autoClose: true,       // 自动关弹窗
            scriptNav: true,       // 脚本翻页
            audioFeedback: false,  // 答题音效
            keyVisual: false       // 按键视觉反馈
        },
        keys: generateDefaultKeys(),
        audioCustom: { correct: '', wrong: '' },
        uiPos: { top: '', left: '' }
    };

    // 加载并合并用户配置
    let userConfig = JSON.parse(localStorage.getItem('ksb_script_config')) || DEFAULT_CONFIG;
    userConfig.features = { ...DEFAULT_CONFIG.features, ...userConfig.features };
    userConfig.keys = { ...DEFAULT_CONFIG.keys, ...userConfig.keys };
    userConfig.audioCustom = { ...DEFAULT_CONFIG.audioCustom, ...userConfig.audioCustom };
    userConfig.uiPos = userConfig.uiPos || { top: '', left: '' };

    // 静默保存 (不触发刷新确认，用于拖拽位置等场景)
    const saveConfigSilent = () => {
        localStorage.setItem('ksb_script_config', JSON.stringify(userConfig));
    };

    // 完整保存 (保存后询问是否刷新)
    const saveConfig = () => {
        localStorage.setItem('ksb_script_config', JSON.stringify(userConfig));
        if (confirm('设置已保存。是否立即刷新页面以确保所有更改生效？')) {
            location.reload();
        }
    };

    // 重置为默认配置
    const resetConfig = () => {
        if (confirm('确定要恢复默认设置吗？')) {
            localStorage.removeItem('ksb_script_config');
            location.reload();
        }
    };

    // 验证音效 URL 格式
    const validateAudioUrl = (url) => {
        if (!url) return true;
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    };

    /* ========================================
     * 音效系统
     * ======================================== */

    const defaultAudioUrls = {
        correct: 'https://img.tukuppt.com/newpreview_music/01/66/41/63c0e76601774734.mp3',
        wrong: 'https://img.tukuppt.com/newpreview_music/09/00/60/5c89396f017e881994.mp3'
    };

    const audioCtx = { correct: new Audio(), wrong: new Audio() };

    function updateAudioSource() {
        audioCtx.correct.src = userConfig.audioCustom.correct || defaultAudioUrls.correct;
        audioCtx.wrong.src = userConfig.audioCustom.wrong || defaultAudioUrls.wrong;
    }
    updateAudioSource();

    // 检测答题结果并播放对应音效
    function checkAnswerAndPlaySound() {
        if (!userConfig.features.audioFeedback) return;

        const wrongIcon = document.querySelector('img[src*="FkA2c88PrD8eR23UlL1ejyer5axl"]');
        const correctIcon = document.querySelector('img[src*="FjteOgY4lCD4RSWPILZpiI0tHLIt"]');

        if (correctIcon?.offsetParent) {
            audioCtx.correct.currentTime = 0;
            audioCtx.correct.play().catch(() => {});
        } else if (wrongIcon?.offsetParent) {
            audioCtx.wrong.currentTime = 0;
            audioCtx.wrong.play().catch(() => {});
        }
    }

    /* ========================================
     * 按键视觉反馈
     * ======================================== */

    function showKeyIndicator(text) {
        if (!userConfig.features.keyVisual) return;

        let div = document.getElementById('ksb-key-indicator');
        if (div) div.remove();

        div = document.createElement('div');
        div.id = 'ksb-key-indicator';
        div.textContent = text;
        div.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            font-size: 80px; font-weight: bold; color: rgba(64, 158, 255, 0.8);
            z-index: 99999; pointer-events: none;
            text-shadow: 0 0 20px rgba(255,255,255,0.8);
            opacity: 0; transition: all 0.4s ease;
        `;
        document.body.appendChild(div);

        requestAnimationFrame(() => {
            div.style.opacity = '1';
            div.style.transform = 'translate(-50%, -50%) scale(1.2)';
        });

        setTimeout(() => {
            div.style.opacity = '0';
            div.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => div.remove(), 400);
        }, 300);
    }

    /* ========================================
     * 界面净化 (CSS注入)
     * ======================================== */

    function applyCleanUI() {
        if (!userConfig.features.cleanUI) return;
        if (document.getElementById('ksb-clean-style')) return;

        const style = document.createElement('style');
        style.id = 'ksb-clean-style';
        style.textContent = `
            /* 隐藏干扰元素 */
            .header, .new-footer, .right-float-window, .advertisement, .ad-box,
            .vip-quanyi, .vip-tips, .breadcrumb, .lock-icon,
            [class*="vip-mask"], .hide-ai-analysis, .hide-ai-analysis-text,
            .check-all-btn-row { display: none !important; }

            .app-main { padding-top: 20px !important; }

            /* 解锁解析内容样式（提升对比度，避免灰字看不清） */
            .answer-analysis, .answer-analysis-row, .answer-detail {
                color: #111 !important; opacity: 1 !important; filter: none !important;
                background-color: #fff !important;
                text-shadow: none !important; -webkit-text-fill-color: #111 !important;
                -webkit-line-clamp: 999 !important; line-clamp: 999 !important;
                max-height: none !important; height: auto !important;
                overflow: visible !important; text-overflow: clip !important;
                white-space: normal !important;
                word-break: break-word !important;
                overflow-wrap: anywhere !important;
                user-select: text !important;
            }
            .answer-analysis-row, .answer-analysis { -webkit-box-orient: vertical !important; }

            .answer-analysis *, .answer-analysis-row *, .answer-detail * {
                color: #111 !important;
                opacity: 1 !important;
                -webkit-text-fill-color: #111 !important;
                text-shadow: none !important;
            }

            .deepseek-row .content,
            .answer-box-detail p, .answer-box-detail span {
                color: #111 !important; opacity: 1 !important; filter: none !important;
                -webkit-text-fill-color: #111 !important; user-select: text !important;
                white-space: normal !important;
                word-break: break-word !important;
                overflow-wrap: anywhere !important;
            }

            [class*="blur"] { display: none !important; pointer-events: none !important; }
            .hide-height { height: auto !important; max-height: none !important; overflow: visible !important; }
        `;
        document.head.appendChild(style);
    }

    /* ========================================
     * VIP 破解 (DOM操作)
     * ======================================== */

    function unlockVIP() {
        if (!userConfig.features.vipUnlock) return;

        document.querySelectorAll('.answer-analysis-row.hide-height').forEach(element => {
            element.classList.remove('hide-height');
            if (!element.style) return;
            element.style.maxHeight = '';
            element.style.height = '';
            element.style.overflow = '';
            element.style.whiteSpace = '';
        });

        // 移除 VIP 相关遮罩和按钮
        const selectorsToRemove = [
            '.vip-quanyi', '.vip-tips', '.vip-mask', '.open-vip-btn',
            '[class*="pay"]', '.hide-ai-analysis', '.hide-ai-analysis-text', '.check-all-btn-row'
        ];
        selectorsToRemove.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
        });

        // 移除"开通VIP查看完整解析"相关元素
        const vipNodes = document.evaluate(
            "//*[contains(text(), '开通VIP查看完整解析')]",
            document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null
        );
        for (let i = 0; i < vipNodes.snapshotLength; i++) {
            const node = vipNodes.snapshotItem(i);
            const target = node.closest('button') || node.closest('.el-button') ||
                           node.closest('div[class*="vip"]') || node.closest('.check-all-btn-row') ||
                           node.parentElement;
            if (target && !target.classList.contains('app-main') && !target.classList.contains('answer-analysis')) {
                target.remove();
            } else {
                node.remove();
            }
        }

        // 移除"深度解题"相关元素
        const deepNodes = document.evaluate(
            "//*[contains(text(), '深度解题')]",
            document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null
        );
        for (let i = 0; i < deepNodes.snapshotLength; i++) {
            const el = deepNodes.snapshotItem(i);
            const wrapper = el.closest('.deepseek-row') || el.closest('.answer-box-detail > div') || el.parentElement;
            if (wrapper && !wrapper.classList.contains('app-main')) {
                wrapper.remove();
            }
        }

        // 清理绝对定位的 VIP 图标
        document.querySelectorAll('i, img, svg').forEach(icon => {
            const parentText = icon.parentElement?.innerText || '';
            if (parentText.includes('VIP') || parentText.includes('解析')) {
                const style = window.getComputedStyle(icon);
                if (style.position === 'absolute' || style.position === 'fixed') {
                    icon.remove();
                }
            }
        });
    }

    /* ========================================
     * 自动弹窗处理
     * ======================================== */

    function checkDialog() {
        if (!userConfig.features.autoClose) return;
        document.querySelector('.el-message-box__btns .el-button--primary')?.click();
    }

    /* ========================================
     * DOM 辅助函数
     * ======================================== */

    // 通过 XPath 查找并点击可见元素
    const clickByXPath = (xpath) => {
        const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < result.snapshotLength; i++) {
            const el = result.snapshotItem(i);
            if (el.offsetParent !== null) {
                el.click();
                return true;
            }
        }
        return false;
    };

    // 点击包含指定文本的元素
    const clickText = (text) => clickByXPath(`//*[contains(text(), '${text}')]`);

    // 选择选项 (支持 "A" 或 "A." 格式)
    const selectOption = (char) => {
        if (!clickByXPath(`//*[normalize-space(text())='${char}']`)) {
            clickByXPath(`//*[starts-with(normalize-space(text()), '${char} ') or starts-with(normalize-space(text()), '${char}.')]`);
        }
    };

    /* ========================================
     * 全局事件监听
     * ======================================== */

    // DOM 变化监听 (防抖处理)
    let observerTimer = null;
    const observer = new MutationObserver((mutations) => {
        if (mutations.some(m => m.addedNodes.length > 0)) {
            if (observerTimer) clearTimeout(observerTimer);
            observerTimer = setTimeout(() => {
                unlockVIP();
                applyCleanUI();
            }, 100);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 点击事件监听 (答题音效)
    document.addEventListener('click', (e) => {
        if (!userConfig.features.audioFeedback) return;
        if (e.target.closest('.option') || e.target.textContent?.includes('提交')) {
            setTimeout(checkAnswerAndPlaySound, 200);
            setTimeout(checkAnswerAndPlaySound, 600);
        }
    });

    // 键盘事件监听
    document.addEventListener('keydown', (e) => {
        // 输入框内不处理快捷键
        const tag = document.activeElement.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || document.activeElement.isContentEditable) {
            return;
        }

        const key = e.key;
        const keyMap = userConfig.keys;
        let handled = false;

        // 选项快捷键 (A-Z)
        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i);
            if (keyMap[`op_${char}`] === key) {
                selectOption(char);
                handled = true;
                break;
            }
        }

        // 功能快捷键
        if (!handled) {
            if (key === keyMap.submit) {
                handled = true;
                if (!userConfig.features.smartEnter) {
                    clickText('提交答案');
                } else if (clickText('提交答案')) {
                    setTimeout(() => {
                        unlockVIP();
                        setTimeout(unlockVIP, 150);
                    }, 50);
                } else if (!clickText('下一题')) {
                    clickText('交卷');
                }
            } else if (key === keyMap.prev && userConfig.features.scriptNav) {
                handled = true;
                showKeyIndicator('←');
                clickText('上一题');
            } else if (key === keyMap.next && userConfig.features.scriptNav) {
                handled = true;
                showKeyIndicator('→');
                clickText('下一题');
            } else if (key === keyMap.forceUnlock && userConfig.features.vipUnlock) {
                handled = true;
                unlockVIP();
                applyCleanUI();
                showKeyIndicator('🔓');
            }
        }

        if (handled) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    }, true);

    /* ========================================
     * 设置面板 UI
     * ======================================== */

    function createSettingsUI() {
        if (document.getElementById('ksb-panel')) return;

        // 注入样式
        const style = document.createElement('style');
        style.textContent = `
            #ksb-btn {
                position: fixed; bottom: 20px; right: 20px; z-index: 9999;
                background: #409EFF; color: white; border-radius: 50%;
                width: 45px; height: 45px; text-align: center; line-height: 45px;
                cursor: move; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                font-size: 22px; transition: transform 0.2s; user-select: none;
            }
            #ksb-btn:hover { transform: scale(1.1); background: #66b1ff; }

            #ksb-panel {
                display: none; position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%); width: 550px; max-height: 85vh;
                background: white; z-index: 10000; padding: 20px; border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3); font-family: system-ui, sans-serif;
                overflow-y: auto; color: #333;
            }

            .ksb-mask {
                display: none; position: fixed; inset: 0;
                background: rgba(0,0,0,0.5); z-index: 9998; backdrop-filter: blur(2px);
            }

            .ksb-title {
                font-size: 20px; font-weight: bold; margin-bottom: 20px;
                padding-bottom: 10px; border-bottom: 1px solid #eee;
            }
            .ksb-sec-title {
                margin: 15px 0 10px; font-weight: bold; font-size: 14px;
                color: #409EFF; background: #ecf5ff; padding: 8px 10px; border-radius: 6px;
            }
            .ksb-row {
                display: flex; justify-content: space-between; align-items: center;
                margin-bottom: 8px; padding: 6px 10px; border-radius: 4px; transition: background 0.2s;
            }
            .ksb-row:hover { background: #f9f9f9; }
            .ksb-checkbox { transform: scale(1.3); cursor: pointer; accent-color: #409EFF; }

            .ksb-input, .ksb-input-long {
                padding: 6px; border: 1px solid #dcdfe6; border-radius: 4px; outline: none;
            }
            .ksb-input { width: 100px; text-align: center; font-family: monospace; font-weight: bold; }
            .ksb-input-long { width: 250px; font-size: 12px; }
            .ksb-input:focus, .ksb-input-long:focus {
                border-color: #409EFF; box-shadow: 0 0 0 2px rgba(64,158,255,0.2);
            }

            .ksb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .ksb-btns { margin-top: 25px; text-align: right; border-top: 1px solid #eee; padding-top: 15px; }
            .ksb-btn { padding: 8px 20px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 14px; }
            .ksb-save { background: #67C23A; color: white; }
            .ksb-close { background: #909399; color: white; }

            .ksb-sub-row {
                margin-left: 20px; border-left: 2px solid #eee;
                padding-left: 10px; font-size: 13px; color: #666;
            }
            .ksb-conflict-warning {
                color: #f56c6c; font-size: 12px; margin-top: 5px;
                padding: 5px 10px; background: #fef0f0; border-radius: 4px; display: none;
            }
        `;
        document.head.appendChild(style);

        // 创建悬浮按钮
        const btn = document.createElement('div');
        btn.id = 'ksb-btn';
        btn.innerHTML = '⚙️';
        btn.title = '打开设置面板';

        // 恢复按钮位置
        if (userConfig.uiPos.top) {
            Object.assign(btn.style, {
                bottom: 'auto', right: 'auto',
                top: userConfig.uiPos.top, left: userConfig.uiPos.left
            });
        }

        // 拖拽功能
        let isDragging = false, startX, startY, initLeft, initTop;

        btn.onmousedown = (e) => {
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            const rect = btn.getBoundingClientRect();
            initLeft = rect.left;
            initTop = rect.top;

            const onMove = (mv) => {
                if (!isDragging && (Math.abs(mv.clientX - startX) > 5 || Math.abs(mv.clientY - startY) > 5)) {
                    isDragging = true;
                }
                if (isDragging) {
                    Object.assign(btn.style, {
                        bottom: 'auto', right: 'auto',
                        left: `${initLeft + mv.clientX - startX}px`,
                        top: `${initTop + mv.clientY - startY}px`
                    });
                }
            };

            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                if (isDragging) {
                    userConfig.uiPos = { top: btn.style.top, left: btn.style.left };
                    saveConfigSilent();
                }
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        };

        // 创建遮罩和面板
        const mask = document.createElement('div');
        mask.className = 'ksb-mask';

        const panel = document.createElement('div');
        panel.id = 'ksb-panel';

        btn.onclick = () => {
            if (!isDragging) {
                panel.style.display = 'block';
                mask.style.display = 'block';
            }
        };

        // 渲染开关项
        const renderSwitch = (key, label) => `
            <div class="ksb-row">
                <label for="kf-${key}" style="flex:1;cursor:pointer;">${label}</label>
                <input type="checkbox" id="kf-${key}" class="ksb-checkbox" ${userConfig.features[key] ? 'checked' : ''}>
            </div>
        `;

        // 渲染按键项
        const renderKey = (key, name) => `
            <div class="ksb-row">
                <label>${name}</label>
                <input type="text" class="ksb-input" id="kk-${key}" value="${userConfig.keys[key]}" readonly>
            </div>
        `;

        // 构建面板 HTML
        let html = `<div class="ksb-title">⚡ 考试宝助手 v2.1 设置</div>`;

        // 核心功能
        html += `<div class="ksb-sec-title">核心功能</div>`;
        html += renderSwitch('smartEnter', '🧠 智能回车 (自动提交→下一题→交卷)');
        html += renderSwitch('vipUnlock', '🔓 强力VIP破解');
        html += renderSwitch('cleanUI', '🧹 界面净化');
        html += renderSwitch('autoClose', '🚫 自动关弹窗');
        html += renderSwitch('scriptNav', '🎮 脚本翻页 (方向键)');

        // 增强体验
        html += `<div class="ksb-sec-title">增强体验</div>`;
        html += renderSwitch('audioFeedback', '🎵 答题音效');
        html += `<div id="ksb-audio-custom-wrapper" style="display:${userConfig.features.audioFeedback ? 'block' : 'none'};">`;
        html += `<div class="ksb-row ksb-sub-row"><label>正确音效 URL</label><input class="ksb-input-long" id="kac-correct" value="${userConfig.audioCustom.correct}" placeholder="留空使用默认音效"></div>`;
        html += `<div class="ksb-row ksb-sub-row"><label>错误音效 URL</label><input class="ksb-input-long" id="kac-wrong" value="${userConfig.audioCustom.wrong}" placeholder="留空使用默认音效"></div>`;
        html += `</div>`;
        html += renderSwitch('keyVisual', '👀 按键视觉反馈');

        // 按键映射
        html += `<div class="ksb-sec-title">按键映射</div>`;
        html += `<div id="ksb-conflict-warning" class="ksb-conflict-warning"></div>`;
        html += `<div class="ksb-grid">`;
        html += renderKey('submit', '提交/确认');
        html += renderKey('prev', '上一题');
        html += renderKey('next', '下一题');
        html += renderKey('forceUnlock', '强制破解');
        html += `</div>`;

        // 选项快捷键
        html += `<div class="ksb-sec-title">选项快捷键 (A-Z)</div>`;
        html += `<div class="ksb-grid">`;
        for (let i = 0; i < 26; i++) {
            html += renderKey(`op_${String.fromCharCode(65 + i)}`, `选项 ${String.fromCharCode(65 + i)}`);
        }
        html += `</div>`;

        // 按钮
        html += `<div class="ksb-btns">`;
        html += `<button class="ksb-btn" id="ksb-reset" style="float:left;background:#f56c6c;color:white;">重置默认</button>`;
        html += `<button class="ksb-btn ksb-close">取消</button>`;
        html += `<button class="ksb-btn ksb-save">保存配置</button>`;
        html += `</div>`;

        panel.innerHTML = html;
        document.body.append(btn, mask, panel);

        // 临时配置 (用于取消时恢复)
        let tempKeys = { ...userConfig.keys };
        let tempFeatures = { ...userConfig.features };

        // 关闭面板
        const closePanel = () => {
            panel.style.display = 'none';
            mask.style.display = 'none';

            // 重置临时变量
            tempKeys = { ...userConfig.keys };
            tempFeatures = { ...userConfig.features };

            // 恢复 UI 状态
            panel.querySelectorAll('.ksb-input').forEach(inp => {
                inp.value = userConfig.keys[inp.id.replace('kk-', '')] || '';
            });
            Object.keys(userConfig.features).forEach(k => {
                const el = document.getElementById(`kf-${k}`);
                if (el) el.checked = userConfig.features[k];
            });
            document.getElementById('kac-correct').value = userConfig.audioCustom.correct;
            document.getElementById('kac-wrong').value = userConfig.audioCustom.wrong;
            document.getElementById('ksb-audio-custom-wrapper').style.display =
                userConfig.features.audioFeedback ? 'block' : 'none';
            document.getElementById('ksb-conflict-warning').style.display = 'none';
        };

        mask.onclick = closePanel;
        panel.querySelector('.ksb-close').onclick = closePanel;
        panel.querySelector('#ksb-reset').onclick = resetConfig;

        // 音效开关联动
        document.getElementById('kf-audioFeedback')?.addEventListener('change', (e) => {
            document.getElementById('ksb-audio-custom-wrapper').style.display =
                e.target.checked ? 'block' : 'none';
        });

        // 按键冲突检测
        const checkKeyConflicts = () => {
            const usedKeys = new Map();
            const conflicts = [];
            const keyNames = { submit: '提交/确认', prev: '上一题', next: '下一题', forceUnlock: '强制破解' };
            for (let i = 0; i < 26; i++) {
                keyNames[`op_${String.fromCharCode(65 + i)}`] = `选项 ${String.fromCharCode(65 + i)}`;
            }

            for (const [id, key] of Object.entries(tempKeys)) {
                if (key && key.trim() !== '') {
                    if (usedKeys.has(key)) {
                        const existingId = usedKeys.get(key);
                        conflicts.push(`按键 "${key}" 同时用于: ${keyNames[existingId]} 和 ${keyNames[id]}`);
                    } else {
                        usedKeys.set(key, id);
                    }
                }
            }
            return conflicts;
        };

        // 保存按钮
        panel.querySelector('.ksb-save').onclick = () => {
            const warningEl = document.getElementById('ksb-conflict-warning');

            // 检测按键冲突
            const conflicts = checkKeyConflicts();
            if (conflicts.length > 0) {
                warningEl.innerHTML = '⚠️ 检测到按键冲突:<br>' + conflicts.join('<br>');
                warningEl.style.display = 'block';
                return;
            }
            warningEl.style.display = 'none';

            // 验证音效 URL
            const correctUrl = document.getElementById('kac-correct').value.trim();
            const wrongUrl = document.getElementById('kac-wrong').value.trim();

            if (!validateAudioUrl(correctUrl)) {
                alert('正确音效 URL 格式无效，请输入有效的 HTTP/HTTPS 链接或留空');
                return;
            }
            if (!validateAudioUrl(wrongUrl)) {
                alert('错误音效 URL 格式无效，请输入有效的 HTTP/HTTPS 链接或留空');
                return;
            }

            // 收集功能开关状态
            Object.keys(userConfig.features).forEach(k => {
                const el = document.getElementById(`kf-${k}`);
                if (el) tempFeatures[k] = el.checked;
            });

            // 应用配置
            userConfig.features = { ...tempFeatures };
            userConfig.keys = { ...tempKeys };
            userConfig.audioCustom = { correct: correctUrl, wrong: wrongUrl };

            updateAudioSource();
            saveConfig();
        };

        // 按键输入处理
        panel.querySelectorAll('.ksb-input').forEach(inp => {
            inp.onfocus = () => {
                inp.style.borderColor = '#409EFF';
                inp.value = '按下新按键...';
            };

            inp.onblur = () => {
                inp.style.borderColor = '#dcdfe6';
                inp.value = tempKeys[inp.id.replace('kk-', '')] || '';
            };

            inp.onkeydown = (e) => {
                e.preventDefault();
                e.stopPropagation();

                let key = ['Backspace', 'Delete'].includes(e.key) ? '' : (e.key === ' ' ? 'Space' : e.key);
                tempKeys[inp.id.replace('kk-', '')] = key;
                inp.value = key;
                inp.blur();

                // 实时检查冲突
                const warningEl = document.getElementById('ksb-conflict-warning');
                const conflicts = checkKeyConflicts();
                if (conflicts.length > 0) {
                    warningEl.innerHTML = '⚠️ 检测到按键冲突:<br>' + conflicts.join('<br>');
                    warningEl.style.display = 'block';
                } else {
                    warningEl.style.display = 'none';
                }
            };
        });
    }

    /* ========================================
     * 初始化
     * ======================================== */

    setTimeout(() => {
        applyCleanUI();
        createSettingsUI();
        unlockVIP();

        // 定时任务
        setInterval(unlockVIP, 1500);
        setInterval(checkDialog, 1500);
    }, 500);

})();
