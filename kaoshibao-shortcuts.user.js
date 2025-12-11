// ==UserScript==
// @name         考试宝快捷键 (Kaoshibao Shortcuts)
// @namespace    http://tampermonkey.net/
// @version      2.0
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
        const keys = { submit: 'Enter', prev: 'ArrowLeft', next: 'ArrowRight', forceUnlock: 'v' };
        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i);
            keys[`op_${char}`] = i < 5 ? (i + 1).toString() : '';
        }
        return keys;
    };

    const DEFAULT_CONFIG = {
        features: { cleanUI: true, vipUnlock: true, autoClose: true, smartEnter: true, scriptNav: true, audioFeedback: false, keyVisual: false },
        keys: generateDefaultKeys(),
        audioCustom: { correct: '', wrong: '' },
        uiPos: { top: '', left: '' }
    };

    let userConfig = JSON.parse(localStorage.getItem('ksb_script_config')) || DEFAULT_CONFIG;
    userConfig.features = { ...DEFAULT_CONFIG.features, ...userConfig.features };
    userConfig.keys = { ...DEFAULT_CONFIG.keys, ...userConfig.keys };
    userConfig.audioCustom = { ...DEFAULT_CONFIG.audioCustom, ...userConfig.audioCustom };
    userConfig.uiPos = userConfig.uiPos || { top: '', left: '' };

    const saveConfig = () => {
        localStorage.setItem('ksb_script_config', JSON.stringify(userConfig));
        if (confirm('设置已保存。是否立即刷新页面以确保所有更改生效？')) location.reload();
    };

    const resetConfig = () => {
        if (confirm('确定要恢复默认设置吗？')) {
            localStorage.removeItem('ksb_script_config');
            location.reload();
        }
    };

    // ==========================================
    // 2. 核心功能模块
    // ==========================================
    // --- 音效系统 ---
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

    function checkAnswerAndPlaySound() {
        if (!userConfig.features.audioFeedback) return;
        const wrongIcon = document.querySelector('img[src*="FkA2c88PrD8eR23UlL1ejyer5axl"]');
        const correctIcon = document.querySelector('img[src*="FjteOgY4lCD4RSWPILZpiI0tHLIt"]');
        if (correctIcon?.offsetParent) {
            audioCtx.correct.currentTime = 0;
            audioCtx.correct.play().catch(console.error);
        } else if (wrongIcon?.offsetParent) {
            audioCtx.wrong.currentTime = 0;
            audioCtx.wrong.play().catch(console.error);
        }
    }

    // --- 按键视觉反馈 ---
    function showKeyIndicator(text) {
        if (!userConfig.features.keyVisual) return;
        let div = document.getElementById('ksb-key-indicator');
        if (div) div.remove();
        div = document.createElement('div');
        div.id = 'ksb-key-indicator';
        div.textContent = text;
        div.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 80px; font-weight: bold; color: rgba(64, 158, 255, 0.8); z-index: 99999; pointer-events: none; text-shadow: 0 0 20px rgba(255,255,255,0.8); opacity: 0; transition: all 0.4s ease;`;
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

    // --- 界面净化 (CSS) ---
    function applyCleanUI() {
        if (!userConfig.features.cleanUI) return;
        if (!document.getElementById('ksb-clean-style')) {
            const style = document.createElement('style');
            style.id = 'ksb-clean-style';
            style.textContent = `
                .header, .new-footer, .right-float-window, .advertisement, .ad-box, .vip-quanyi, .vip-tips, .breadcrumb, .lock-icon, [class*="lock"], [class*="vip-mask"], .hide-ai-analysis, .hide-ai-analysis-text, .check-all-btn-row { display: none !important; }
                .app-main { padding-top: 20px !important; }
                .answer-analysis, .answer-analysis-row, .answer-detail, .deepseek-row .content, .answer-box-detail p, .answer-box-detail span { color: #222 !important; opacity: 1 !important; filter: none !important; text-shadow: none !important; -webkit-text-fill-color: #222 !important; -webkit-line-clamp: 999 !important; line-clamp: 999 !important; max-height: none !important; height: auto !important; overflow: visible !important; white-space: pre-wrap !important; text-overflow: clip !important; user-select: text !important; }
                .answer-analysis-row, .answer-analysis { -webkit-box-orient: vertical !important; }
                [class*="mask"], [class*="blur"] { display: none !important; pointer-events: none !important; }
                .hide-height { height: auto !important; max-height: none !important; overflow: visible !important; }
            `;
            document.head.appendChild(style);
        }
    }

    // --- VIP 破解 (DOM操作) ---
    function unlockVIP() {
        if (!userConfig.features.vipUnlock) return;

        // 1. 常规移除
        ['.vip-quanyi', '.vip-tips', '.vip-mask', '.open-vip-btn', '[class*="pay"]', '.hide-ai-analysis', '.hide-ai-analysis-text', '.check-all-btn-row'].forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
        });

        // 2. 精准移除“开通VIP”
        const vipNodes = document.evaluate("//*[contains(text(), '开通VIP查看完整解析')]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < vipNodes.snapshotLength; i++) {
            let node = vipNodes.snapshotItem(i);
            let target = node.closest('button') || node.closest('.el-button') || node.closest('div[class*="vip"]') || node.closest('.check-all-btn-row') || node.parentElement;
            if (target && !target.classList.contains('app-main') && !target.classList.contains('answer-analysis')) target.remove();
            else node.remove();
        }

        // 3. 移除“深度解题”
        const deepResult = document.evaluate("//*[contains(text(), '深度解题')]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < deepResult.snapshotLength; i++) {
            let el = deepResult.snapshotItem(i);
            let wrapper = el.closest('.deepseek-row') || el.closest('.answer-box-detail > div') || el.parentElement;
            if (wrapper && !wrapper.classList.contains('app-main')) wrapper.remove();
        }

        // 4. 清理残留图标
        document.querySelectorAll('i, img, svg').forEach(icon => {
            const parentText = icon.parentElement?.innerText || '';
            if (parentText.includes('VIP') || parentText.includes('解析')) {
                const style = window.getComputedStyle(icon);
                if (style.position === 'absolute' || style.position === 'fixed') icon.remove();
            }
        });
    }

    // --- 自动弹窗处理 ---
    function checkDialog() {
        if (userConfig.features.autoClose) document.querySelector(".el-message-box__btns .el-button--primary")?.click();
    }

    // --- DOM 辅助 ---
    const clickByXPath = (xpath) => {
        const res = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < res.snapshotLength; i++) {
            let el = res.snapshotItem(i);
            if (el.offsetParent !== null) { el.click(); return true; }
        }
        return false;
    };
    const clickText = (text) => clickByXPath(`//*[contains(text(), '${text}')]`);
    const selectOption = (char) => {
        if (!clickByXPath(`//*[normalize-space(text())='${char}']`)) {
            clickByXPath(`//*[starts-with(normalize-space(text()), '${char} ') or starts-with(normalize-space(text()), '${char}.')]`);
        }
    };

    // ==========================================
    // 3. 全局监听
    // ==========================================
    let observerTimer = null;
    const observer = new MutationObserver((mutations) => {
        if (mutations.some(m => m.addedNodes.length > 0)) {
            if (observerTimer) clearTimeout(observerTimer);
            observerTimer = setTimeout(() => {
                unlockVIP();
                applyCleanUI();
            }, 100); // 防抖，避免卡顿
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('click', (e) => {
        if (userConfig.features.audioFeedback && (e.target.closest('.option') || e.target.textContent.includes('提交'))) {
            setTimeout(checkAnswerAndPlaySound, 200);
            setTimeout(checkAnswerAndPlaySound, 600);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) return;

        const k = e.key;
        const map = userConfig.keys;
        let isHandled = false;

        // 选项快捷键
        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i);
            if (map[`op_${char}`] === k) { selectOption(char); isHandled = true; break; }
        }

        if (!isHandled) {
            if (k === map.submit) {
                isHandled = true;
                if (!userConfig.features.smartEnter) clickText('提交答案');
                else if (clickText('提交答案')) setTimeout(() => { unlockVIP(); setTimeout(unlockVIP, 150); }, 50);
                else if (!clickText('下一题')) clickText('交卷');
            } else if (k === map.prev && userConfig.features.scriptNav) {
                isHandled = true; showKeyIndicator('←'); clickText('上一题');
            } else if (k === map.next && userConfig.features.scriptNav) {
                isHandled = true; showKeyIndicator('→'); clickText('下一题');
            } else if (k === map.forceUnlock) {
                isHandled = true; unlockVIP(); applyCleanUI(); showKeyIndicator('🔓');
            }
        }

        if (isHandled) { e.stopPropagation(); e.stopImmediatePropagation(); e.preventDefault(); }
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
            .ksb-input, .ksb-input-long { padding: 6px; border: 1px solid #dcdfe6; border-radius: 4px; outline: none; }
            .ksb-input { width: 100px; text-align: center; font-family: monospace; font-weight: bold; }
            .ksb-input-long { width: 250px; font-size: 12px; }
            .ksb-input:focus, .ksb-input-long:focus { border-color: #409EFF; box-shadow: 0 0 0 2px rgba(64,158,255,0.2); }
            .ksb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .ksb-btns { margin-top: 25px; text-align: right; border-top: 1px solid #eee; padding-top: 15px; }
            .ksb-btn { padding: 8px 20px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 14px; }
            .ksb-save { background: #67C23A; color: white; }
            .ksb-close { background: #909399; color: white; }
            .ksb-sub-row { margin-left: 20px; border-left: 2px solid #eee; padding-left: 10px; font-size: 13px; color: #666; }
        `;
        document.head.appendChild(style);

        const btn = document.createElement('div'); btn.id = 'ksb-btn'; btn.innerHTML = '⚙️'; btn.title = '设置';
        if (userConfig.uiPos.top) Object.assign(btn.style, { bottom: 'auto', right: 'auto', top: userConfig.uiPos.top, left: userConfig.uiPos.left });

        let isDragging = false, startX, startY, initLeft, initTop;
        btn.onmousedown = (e) => {
            isDragging = false; startX = e.clientX; startY = e.clientY;
            const rect = btn.getBoundingClientRect(); initLeft = rect.left; initTop = rect.top;
            const onMove = (mv) => {
                if (!isDragging && (Math.abs(mv.clientX - startX) > 5 || Math.abs(mv.clientY - startY) > 5)) isDragging = true;
                if (isDragging) Object.assign(btn.style, { bottom: 'auto', right: 'auto', left: `${initLeft + mv.clientX - startX}px`, top: `${initTop + mv.clientY - startY}px` });
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp);
                if (isDragging) { userConfig.uiPos = { top: btn.style.top, left: btn.style.left }; saveConfig(); }
            };
            document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
        };

        const mask = document.createElement('div'); mask.className = 'ksb-mask';
        const panel = document.createElement('div'); panel.id = 'ksb-panel';
        btn.onclick = () => { if (!isDragging) { panel.style.display = 'block'; mask.style.display = 'block'; } };

        const renderSwitch = (k, l) => `<div class="ksb-row"><label for="kf-${k}" style="flex:1;cursor:pointer;">${l}</label><input type="checkbox" id="kf-${k}" class="ksb-checkbox" ${userConfig.features[k]?'checked':''}></div>`;
        const renderKey = (k, n) => `<div class="ksb-row"><label>${n}</label><input type="text" class="ksb-input" id="kk-${k}" value="${userConfig.keys[k]}" readonly></div>`;

        let html = `<div class="ksb-title">考试宝助手 v2.0 设置</div><div class="ksb-sec-title">核心功能</div>${renderSwitch('smartEnter', '🧠 智能回车')}${renderSwitch('vipUnlock', '🔓 强力VIP破解')}${renderSwitch('cleanUI', '🧹 界面净化')}${renderSwitch('autoClose', '🚫 自动关弹窗')}${renderSwitch('scriptNav', '🎮 脚本翻页')}<div class="ksb-sec-title">增强体验</div>${renderSwitch('audioFeedback', '🎵 答题音效')}`;
        html += `<div id="ksb-audio-custom-wrapper" style="display:${userConfig.features.audioFeedback?'block':'none'};"><div class="ksb-row ksb-sub-row"><label>正确音效(URL)</label><input class="ksb-input-long" id="kac-correct" value="${userConfig.audioCustom.correct}"></div><div class="ksb-row ksb-sub-row"><label>错误音效(URL)</label><input class="ksb-input-long" id="kac-wrong" value="${userConfig.audioCustom.wrong}"></div></div>${renderSwitch('keyVisual', '👀 按键视觉反馈')}`;
        html += `<div class="ksb-sec-title">按键映射</div><div class="ksb-grid">${renderKey('submit', '提交/确认')}${renderKey('prev', '上一题')}${renderKey('next', '下一题')}${renderKey('forceUnlock', '强制破解')}</div><div class="ksb-sec-title">选项快捷键 (A-Z)</div><div class="ksb-grid">`;
        for (let i=0; i<26; i++) html += renderKey(`op_${String.fromCharCode(65+i)}`, `选项 ${String.fromCharCode(65+i)}`);
        html += `</div><div class="ksb-btns"><button class="ksb-btn" id="ksb-reset" style="float:left;background:#f56c6c;color:white;">重置</button><button class="ksb-btn ksb-close">取消</button><button class="ksb-btn ksb-save">保存配置</button></div>`;

        panel.innerHTML = html; document.body.append(btn, mask, panel);

        const close = () => { panel.style.display = 'none'; mask.style.display = 'none'; };
        mask.onclick = close; panel.querySelector('.ksb-close').onclick = close; panel.querySelector('#ksb-reset').onclick = resetConfig;

        document.getElementById('kf-audioFeedback')?.addEventListener('change', e => document.getElementById('ksb-audio-custom-wrapper').style.display = e.target.checked ? 'block' : 'none');
        panel.querySelector('.ksb-save').onclick = () => {
            Object.keys(userConfig.features).forEach(k => { const el = document.getElementById(`kf-${k}`); if (el) userConfig.features[k] = el.checked; });
            userConfig.audioCustom = { correct: document.getElementById('kac-correct').value.trim(), wrong: document.getElementById('kac-wrong').value.trim() };
            saveConfig();
        };

        panel.querySelectorAll('.ksb-input').forEach(inp => {
            inp.onfocus = () => { inp.style.borderColor = '#409EFF'; inp.value = '...'; };
            inp.onblur = () => { inp.style.borderColor = '#dcdfe6'; inp.value = userConfig.keys[inp.id.replace('kk-', '')] || ''; };
            inp.onkeydown = (e) => {
                e.preventDefault(); e.stopPropagation();
                let key = ['Backspace','Delete'].includes(e.key) ? '' : (e.key === ' ' ? 'Space' : e.key);
                userConfig.keys[inp.id.replace('kk-', '')] = key; inp.value = key; inp.blur();
            };
        });
    }

    setTimeout(() => { applyCleanUI(); createSettingsUI(); unlockVIP(); setInterval(unlockVIP, 1500); setInterval(checkDialog, 1500); }, 500);
})();
