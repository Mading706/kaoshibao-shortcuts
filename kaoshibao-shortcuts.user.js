// ==UserScript==
// @name         考试宝快捷键 (Kaoshibao Shortcuts)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  考试宝刷题辅助：功能可独立开关 (音效/视觉反馈/箭头翻页/VIP破解/净化/智能回车)，支持A-Z自定义按键，支持自定义音效
// @match        *://*.kaoshibao.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // 1. 配置管理 & 初始化
    // ==========================================

    const generateDefaultKeys = () => {
        const keys = {
            submit: 'Enter',
            prev: 'ArrowLeft',
            next: 'ArrowRight',
            forceUnlock: 'v'
        };
        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i);
            if (i < 5) keys[`op_${char}`] = (i + 1).toString();
            else keys[`op_${char}`] = '';
        }
        return keys;
    };

    const DEFAULT_CONFIG = {
        features: {
            cleanUI: true,        // 界面净化
            vipUnlock: true,      // VIP 破解
            autoClose: true,      // 自动关弹窗
            smartEnter: true,     // 智能回车
            scriptNav: true,      // 脚本翻页
            audioFeedback: false, // [修改] 默认关闭
            keyVisual: false      // [修改] 默认关闭
        },
        keys: generateDefaultKeys(),
        audioCustom: {
            correct: '',
            wrong: ''
        },
        uiPos: { top: '', left: '' }
    };

    let userConfig = JSON.parse(localStorage.getItem('ksb_script_config')) || DEFAULT_CONFIG;
    userConfig.features = { ...DEFAULT_CONFIG.features, ...userConfig.features };
    userConfig.keys = { ...DEFAULT_CONFIG.keys, ...userConfig.keys };
    userConfig.audioCustom = { ...DEFAULT_CONFIG.audioCustom, ...userConfig.audioCustom };
    if (!userConfig.uiPos) userConfig.uiPos = { top: '', left: '' };

    function saveConfig() {
        localStorage.setItem('ksb_script_config', JSON.stringify(userConfig));
        if (confirm('设置已保存。是否立即刷新页面以确保所有更改生效？')) {
            location.reload();
        }
    }

    function resetConfig() {
        if(confirm('确定要恢复默认设置吗？')) {
            localStorage.removeItem('ksb_script_config');
            location.reload();
        }
    }

    // ==========================================
    // 2. 核心功能模块
    // ==========================================

    // --- 模块：音效系统 ---
    const defaultAudioUrls = {
        correct: 'https://img.tukuppt.com/newpreview_music/01/66/41/63c0e76601774734.mp3',
        wrong: 'https://img.tukuppt.com/newpreview_music/09/00/60/5c89396f017e881994.mp3'
    };

    const audioCtx = {
        correct: new Audio(),
        wrong: new Audio()
    };

    function updateAudioSource() {
        audioCtx.correct.src = userConfig.audioCustom.correct || defaultAudioUrls.correct;
        audioCtx.wrong.src = userConfig.audioCustom.wrong || defaultAudioUrls.wrong;
        audioCtx.correct.load();
        audioCtx.wrong.load();
    }
    updateAudioSource();

    function checkAnswerAndPlaySound() {
        if (!userConfig.features.audioFeedback) return;

        const wrongIcon = document.querySelector('img[src*="FkA2c88PrD8eR23UlL1ejyer5axl"]');
        const correctIcon = document.querySelector('img[src*="FjteOgY4lCD4RSWPILZpiI0tHLIt"]');

        if (correctIcon && correctIcon.offsetParent !== null) {
            audioCtx.correct.currentTime = 0;
            audioCtx.correct.play().catch(e => console.error('Audio error:', e));
        } else if (wrongIcon && wrongIcon.offsetParent !== null) {
            audioCtx.wrong.currentTime = 0;
            audioCtx.wrong.play().catch(e => console.error('Audio error:', e));
        }
    }

    // --- 模块：按键视觉反馈 ---
    function showKeyIndicator(text) {
        if (!userConfig.features.keyVisual) return;
        const old = document.getElementById('ksb-key-indicator');
        if (old) old.remove();

        const div = document.createElement('div');
        div.id = 'ksb-key-indicator';
        div.textContent = text;
        div.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            font-size: 80px; font-weight: bold; color: rgba(64, 158, 255, 0.8);
            z-index: 99999; pointer-events: none; text-shadow: 0 0 20px rgba(255,255,255,0.8);
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

    // --- 模块：界面净化 ---
    function applyCleanUI() {
        if (!userConfig.features.cleanUI) return;
        if (document.getElementById('ksb-clean-style')) return;

        const css = `
            .header, .new-footer, .vip-quanyi, .vip-tips, .right-float-window, .advertisement, .ad-box { display: none !important; }
            .app-main { padding-top: 20px !important; }
            .answer-analysis.option { display: block !important; }
            .answer-box-detail > div:not(.answer-analysis):not(.option) { display: none !important; }
            .deepseek-row .title { display: none !important; }
        `;
        const style = document.createElement('style');
        style.id = 'ksb-clean-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // --- 模块：VIP 破解 ---
    function unlockVIP() {
        if (!userConfig.features.vipUnlock) return;
        const hiddenEls = document.querySelectorAll('.answer-analysis-row.hide-height');
        hiddenEls.forEach(el => el.classList.remove('hide-height'));
        const ans = document.querySelector(".answer-analysis");
        if (ans) {
            ans.className = "option";
            const lockedBtn = document.querySelector(".answer-analysis-row button");
            if (lockedBtn) lockedBtn.remove();
        }
    }

    // --- 模块：自动关弹窗 ---
    function checkDialog() {
        if (!userConfig.features.autoClose) return;
        const okBtn = document.querySelector(".el-message-box__btns .el-button--primary");
        if (okBtn) okBtn.click();
    }

    // --- 辅助：DOM 操作 ---
    function clickByXPath(xpath) {
        const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < result.snapshotLength; i++) {
            let el = result.snapshotItem(i);
            if (el.offsetParent !== null) { el.click(); return true; }
        }
        return false;
    }
    function clickText(text) { return clickByXPath(`//*[contains(text(), '${text}')]`); }
    function selectOption(char) {
        if (clickByXPath(`//*[normalize-space(text())='${char}']`)) return;
        clickByXPath(`//*[starts-with(normalize-space(text()), '${char} ') or starts-with(normalize-space(text()), '${char}.')]`);
    }

    // ==========================================
    // 3. 全局监听
    // ==========================================

    const observer = new MutationObserver((mutations) => {
        unlockVIP();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('click', (e) => {
        if (userConfig.features.audioFeedback) {
            if (e.target.closest('.option') || e.target.textContent.includes('提交')) {
                setTimeout(checkAnswerAndPlaySound, 200);
                setTimeout(checkAnswerAndPlaySound, 600);
            }
        }
    });

    document.addEventListener('keydown', function(e) {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) return;
        const k = e.key;
        const map = userConfig.keys;
        let isHandled = false;

        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i);
            if (map[`op_${char}`] === k) {
                selectOption(char);
                isHandled = true;
                break;
            }
        }

        if (!isHandled) {
            if (k === map.submit) {
                isHandled = true;
                if (userConfig.features.smartEnter) {
                    if (clickText('提交答案')) setTimeout(unlockVIP, 100);
                    else if (clickText('下一题')) setTimeout(applyCleanUI, 200);
                    else clickText('交卷');
                } else {
                    clickText('提交答案');
                }
            }
            else if (k === map.prev) {
                if (userConfig.features.scriptNav) {
                    isHandled = true;
                    showKeyIndicator('←');
                    clickText('上一题');
                }
            }
            else if (k === map.next) {
                if (userConfig.features.scriptNav) {
                    isHandled = true;
                    showKeyIndicator('→');
                    clickText('下一题');
                    setTimeout(applyCleanUI, 200);
                }
            }
            else if (k === map.forceUnlock) {
                isHandled = true;
                unlockVIP();
                showKeyIndicator('🔓');
            }
        }

        if (isHandled) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    }, true);

    // ==========================================
    // 4. 设置面板 UI
    // ==========================================

    function createSettingsUI() {
        if (document.getElementById('ksb-panel')) return;

        const style = document.createElement('style');
        style.textContent = `
            #ksb-btn { position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: #409EFF; color: white; border-radius: 50%; width: 45px; height: 45px; text-align: center; line-height: 45px; cursor: move; box-shadow: 0 4px 15px rgba(0,0,0,0.3); font-size: 22px; transition: transform 0.2s; user-select: none; }
            #ksb-btn:hover { transform: scale(1.1); background: #66b1ff; }
            #ksb-panel { display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 550px; background: white; z-index: 10000; padding: 20px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); font-family: system-ui, sans-serif; max-height: 85vh; overflow-y: auto; color: #333; }
            .ksb-mask { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9998; backdrop-filter: blur(2px); }
            .ksb-title { font-size: 20px; font-weight: bold; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
            .ksb-sec-title { margin: 15px 0 10px; font-weight: bold; font-size: 14px; color: #409EFF; background: #ecf5ff; padding: 8px 10px; border-radius: 6px; }
            .ksb-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 6px 10px; border-radius: 4px; transition: background 0.2s; }
            .ksb-row:hover { background: #f9f9f9; }
            .ksb-checkbox { transform: scale(1.3); cursor: pointer; accent-color: #409EFF; }
            .ksb-input { width: 100px; padding: 6px; border: 1px solid #dcdfe6; border-radius: 4px; text-align: center; font-family: monospace; font-weight: bold; outline: none; }
            .ksb-input-long { width: 250px; padding: 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 12px; outline: none; }
            .ksb-input:focus, .ksb-input-long:focus { border-color: #409EFF; box-shadow: 0 0 0 2px rgba(64,158,255,0.2); }
            .ksb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .ksb-btns { margin-top: 25px; text-align: right; border-top: 1px solid #eee; padding-top: 15px; }
            .ksb-btn { padding: 8px 20px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 14px; }
            .ksb-save { background: #67C23A; color: white; }
            .ksb-close { background: #909399; color: white; }
            .ksb-sub-row { margin-left: 20px; border-left: 2px solid #eee; padding-left: 10px; font-size: 13px; color: #666; }
        `;
        document.head.appendChild(style);

        const btn = document.createElement('div');
        btn.id = 'ksb-btn'; btn.innerHTML = '⚙️'; btn.title = '设置';

        if (userConfig.uiPos.top) {
            btn.style.bottom = 'auto'; btn.style.right = 'auto';
            btn.style.top = userConfig.uiPos.top; btn.style.left = userConfig.uiPos.left;
        }

        let isDragging = false, startX, startY, initLeft, initTop;
        btn.addEventListener('mousedown', (e) => {
            isDragging = false; startX = e.clientX; startY = e.clientY;
            const rect = btn.getBoundingClientRect(); initLeft = rect.left; initTop = rect.top;
            const onMove = (e) => {
                if (!isDragging && (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5)) isDragging = true;
                if (isDragging) {
                    btn.style.bottom = 'auto'; btn.style.right = 'auto';
                    btn.style.left = (initLeft + e.clientX - startX) + 'px';
                    btn.style.top = (initTop + e.clientY - startY) + 'px';
                }
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp);
                if (isDragging) {
                    userConfig.uiPos.top = btn.style.top; userConfig.uiPos.left = btn.style.left;
                    localStorage.setItem('ksb_script_config', JSON.stringify(userConfig));
                }
            };
            document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
        });

        const mask = document.createElement('div'); mask.className = 'ksb-mask';
        const panel = document.createElement('div'); panel.id = 'ksb-panel';

        btn.addEventListener('click', () => { if (!isDragging) { panel.style.display = 'block'; mask.style.display = 'block'; } });

        // --- 渲染 UI 内容 ---
        let html = `<div class="ksb-title">考试宝助手 v1.2 设置</div>`;

        const renderSwitch = (key, label) => `
            <div class="ksb-row">
                <label for="kf-${key}" style="flex:1;cursor:pointer;">${label}</label>
                <input type="checkbox" id="kf-${key}" class="ksb-checkbox" ${userConfig.features[key] ? 'checked' : ''}>
            </div>`;

        // 1. 核心功能
        html += `<div class="ksb-sec-title">核心功能</div>`;
        html += renderSwitch('smartEnter', '🧠 智能回车 (提交 -> 破解 -> 下一题)');
        html += renderSwitch('vipUnlock', '🔓 自动破解 VIP 解析');
        html += renderSwitch('cleanUI', '🧹 界面净化 (去广告)');
        html += renderSwitch('autoClose', '🚫 自动关闭弹窗');
        html += renderSwitch('scriptNav', '🎮 启用脚本翻页 (接管方向键)');

        // 2. 增强体验
        html += `<div class="ksb-sec-title">增强体验</div>`;
        html += renderSwitch('audioFeedback', '🎵 答题音效 (答对/答错提示音)');

        // 音效配置容器 (默认根据开关状态显示/隐藏)
        const audioDisplay = userConfig.features.audioFeedback ? 'block' : 'none';
        html += `
            <div id="ksb-audio-custom-wrapper" style="display: ${audioDisplay};">
                <div class="ksb-row ksb-sub-row">
                    <label>正确音效(URL)</label>
                    <input type="text" class="ksb-input-long" id="kac-correct" placeholder="留空使用默认" value="${userConfig.audioCustom.correct || ''}">
                </div>
                <div class="ksb-row ksb-sub-row">
                    <label>错误音效(URL)</label>
                    <input type="text" class="ksb-input-long" id="kac-wrong" placeholder="留空使用默认" value="${userConfig.audioCustom.wrong || ''}">
                </div>
            </div>
        `;
        html += renderSwitch('keyVisual', '👀 按键视觉反馈 (屏幕中央大图标)');

        // 3. 按键映射
        html += `<div class="ksb-sec-title">按键映射</div><div class="ksb-grid">`;
        const renderKey = (key, name) => `
            <div class="ksb-row">
                <label>${name}</label>
                <input type="text" class="ksb-input" id="kk-${key}" value="${userConfig.keys[key]}" readonly>
            </div>`;
        html += renderKey('submit', '提交/确认');
        html += renderKey('prev', '上一题');
        html += renderKey('next', '下一题');
        html += renderKey('forceUnlock', '强制破解');
        html += `</div>`;

        // 4. 选项快捷键 (A-Z)
        html += `<div class="ksb-sec-title">选项快捷键 (A-Z)</div><div class="ksb-grid">`;
        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i);
            html += renderKey(`op_${char}`, `选项 ${char}`);
        }
        html += `</div>`;

        html += `
            <div class="ksb-btns">
                <button class="ksb-btn" id="ksb-reset" style="float:left;background:#f56c6c;color:white;">重置</button>
                <button class="ksb-btn ksb-close">取消</button>
                <button class="ksb-btn ksb-save">保存配置</button>
            </div>
        `;

        panel.innerHTML = html;
        document.body.append(btn, mask, panel);

        const close = () => { panel.style.display = 'none'; mask.style.display = 'none'; };
        mask.onclick = close;
        panel.querySelector('.ksb-close').onclick = close;
        panel.querySelector('#ksb-reset').onclick = resetConfig;

        // 监听音效开关，折叠/展开详细配置
        const audioSwitch = document.getElementById('kf-audioFeedback');
        const audioWrapper = document.getElementById('ksb-audio-custom-wrapper');
        if (audioSwitch && audioWrapper) {
            audioSwitch.addEventListener('change', (e) => {
                audioWrapper.style.display = e.target.checked ? 'block' : 'none';
            });
        }

        panel.querySelector('.ksb-save').onclick = () => {
            for (let key in userConfig.features) {
                const el = document.getElementById(`kf-${key}`);
                if (el) userConfig.features[key] = el.checked;
            }
            // 保存自定义音效链接
            userConfig.audioCustom.correct = document.getElementById('kac-correct').value.trim();
            userConfig.audioCustom.wrong = document.getElementById('kac-wrong').value.trim();

            saveConfig();
        };

        panel.querySelectorAll('.ksb-input').forEach(input => {
            input.onfocus = () => { input.style.borderColor = '#409EFF'; input.value = '...'; };
            input.onblur = () => {
                input.style.borderColor = '#dcdfe6';
                const k = input.id.replace('kk-', '');
                input.value = userConfig.keys[k] || '';
            };
            input.onkeydown = (e) => {
                e.preventDefault(); e.stopPropagation();
                let key = e.key === ' ' ? 'Space' : e.key;
                if (['Backspace','Delete'].includes(key)) key = '';
                const configKey = input.id.replace('kk-', '');
                userConfig.keys[configKey] = key;
                input.value = key;
                input.blur();
            };
        });
    }

    setTimeout(() => {
        applyCleanUI();
        createSettingsUI();
        setInterval(checkDialog, 1500);
    }, 500);

})();
