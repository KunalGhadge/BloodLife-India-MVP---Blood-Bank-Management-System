/**
 * Universal AI Chat Layer - Standalone Widget
 * Features: Shadow DOM isolation, Embedded CSS, Auto-Initialization
 */

(function () {
  const CSS_CONTENT = `
        :host {
            --ai-primary: #0078d4;
            --ai-bg: rgba(255, 255, 255, 0.85);
            --ai-glass-bg: rgba(255, 255, 255, 0.1);
            --ai-glass-border: rgba(255, 255, 255, 0.2);
            --ai-text: #323130;
            --ai-radius: 12px;
            --ai-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            --ai-font: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            all: initial; /* Reset everything inside host */
        }

        .ai-floating-bar {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 600px;
            background: var(--ai-bg);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid var(--ai-glass-border);
            border-radius: 40px;
            padding: 8px 15px;
            display: flex;
            align-items: center;
            box-shadow: var(--ai-shadow);
            z-index: 2147483647;
            transition: all 0.3s ease;
            font-family: var(--ai-font);
        }

        .ai-floating-bar:hover {
            transform: translateX(-50%) translateY(-5px);
        }

        .ai-floating-bar input {
            flex: 1;
            background: transparent;
            border: none;
            outline: none;
            color: var(--ai-text);
            font-size: 16px;
            padding: 10px;
            font-family: var(--ai-font);
        }

        .ai-send-btn {
            background: var(--ai-primary);
            border: none;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .ai-send-btn svg { fill: white; width: 18px; }

        .ai-sidebar {
            position: fixed;
            top: 0;
            right: -400px;
            width: 380px;
            height: 100vh;
            background: var(--ai-bg);
            backdrop-filter: blur(25px);
            border-left: 1px solid var(--ai-glass-border);
            box-shadow: -10px 0 30px rgba(0,0,0,0.1);
            z-index: 2147483647;
            transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            font-family: var(--ai-font);
        }

        .ai-sidebar.open { right: 0; }

        .ai-header {
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--ai-glass-border);
        }

        .ai-content {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .msg {
            padding: 12px;
            border-radius: 12px;
            max-width: 85%;
            font-size: 14px;
            line-height: 1.5;
        }

        .user { background: var(--ai-primary); color: white; align-self: flex-end; }
        .bot { background: rgba(0,0,0,0.05); color: var(--ai-text); align-self: flex-start; }

        .ai-footer {
            padding: 20px;
            border-top: 1px solid var(--ai-glass-border);
        }

        .ai-footer input {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            border: 1px solid var(--ai-glass-border);
            background: rgba(255,255,255,0.5);
            outline: none;
        }
    `;

  class AIChatWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      this.render();
      console.log('AI Assistant: Standalone Widget connected.');
    }

    render() {
      const container = document.createElement('div');
      container.innerHTML = `
                <style>${CSS_CONTENT}</style>
                <div class="ai-floating-bar" id="f-bar">
                    <input type="text" placeholder="Ask anything..." id="main-input">
                    <button class="ai-send-btn" id="send-trigger">
                        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                    </button>
                </div>
                <div class="ai-sidebar" id="sidebar">
                    <div class="ai-header">
                        <h3 style="margin:0">AI Assistant</h3>
                        <button id="close-x" style="background:none; border:none; cursor:pointer; font-size:20px;">×</button>
                    </div>
                    <div class="ai-content" id="chat-box">
                        <div class="msg bot">Hello! How can I help you today?</div>
                    </div>
                    <div class="ai-footer">
                        <input type="text" id="side-input" placeholder="Type a message...">
                    </div>
                </div>
            `;

      this.shadowRoot.appendChild(container);
      this.setupEvents();
    }

    setupEvents() {
      const root = this.shadowRoot;
      const sidebar = root.getElementById('sidebar');
      const mainInput = root.getElementById('main-input');
      const sideInput = root.getElementById('side-input');
      const sendBtn = root.getElementById('send-trigger');
      const closeX = root.getElementById('close-x');
      const chatBox = root.getElementById('chat-box');

      const toggle = (force) => sidebar.classList.toggle('open', force);

      const appendMsg = (role, text) => {
        const m = document.createElement('div');
        m.className = \`msg \${role}\`;
                m.innerText = text;
                chatBox.appendChild(m);
                chatBox.scrollTop = chatBox.scrollHeight;
            };

            const handleQuery = async (q) => {
                if (!q.trim()) return;
                toggle(true);
                appendMsg('user', q);
                
                const loading = document.createElement('div');
                loading.className = 'msg bot';
                loading.innerText = '...';
                chatBox.appendChild(loading);

                try {
                    const res = await fetch('http://localhost:3001/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: q })
                    });
                    const data = await res.json();
                    chatBox.removeChild(loading);
                    appendMsg('bot', data.response);
                } catch (e) {
                    chatBox.removeChild(loading);
                    appendMsg('bot', 'Error: Could not connect to AI server.');
                }
            };

            sendBtn.onclick = () => { handleQuery(mainInput.value); mainInput.value = ''; };
            mainInput.onkeypress = (e) => { if(e.key === 'Enter') { handleQuery(mainInput.value); mainInput.value = ''; } };
            sideInput.onkeypress = (e) => { if(e.key === 'Enter') { handleQuery(sideInput.value); sideInput.value = ''; } };
            closeX.onclick = () => toggle(false);
        }
    }

    if (!customElements.get('ai-chat-widget')) {
        customElements.define('ai-chat-widget', AIChatWidget);
    }

    const inject = () => {
        if (!document.querySelector('ai-chat-widget')) {
            const el = document.createElement('ai-chat-widget');
            document.body.appendChild(el);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})();
