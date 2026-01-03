/**
 * AI Chat Layer Widget
 * Microsoft Hackathon MVP
 */

(function () {
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = './ai-assistant/styles.css';
    document.head.appendChild(styles);

    // Create Floating Bar
    const floatingBar = document.createElement('div');
    floatingBar.className = 'ai-floating-bar';
    floatingBar.innerHTML = `
    <input type="text" placeholder="Ask docs..." id="ai-input">
    <button class="ai-send-btn" id="ai-send">
      <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
    </button>
  `;
    document.body.appendChild(floatingBar);

    // Create Sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'ai-sidebar';
    sidebar.id = 'ai-sidebar';
    sidebar.innerHTML = `
    <div class="ai-sidebar-header">
      <h3 style="margin:0; font-family:var(--ai-font)">Assistant</h3>
      <button onclick="document.getElementById('ai-sidebar').classList.remove('open')" style="background:transparent; border:none; color:var(--ai-text); cursor:pointer; font-size:20px;">×</button>
    </div>
    <div class="ai-sidebar-content" id="ai-chat-history">
      <div style="color:var(--ai-text); opacity:0.7; font-size:14px; text-align:center; margin-top:50px;">
        Welcome! Ask anything about this website.
      </div>
    </div>
    <div class="ai-sidebar-footer">
       <div style="display:flex; gap:10px;">
          <input type="text" id="ai-sidebar-input" placeholder="Continue chatting..." style="flex:1; padding:10px; border-radius:10px; border:1px solid var(--ai-glass-border); background:var(--ai-glass-bg); color:var(--ai-text);">
       </div>
    </div>
  `;
    document.body.appendChild(sidebar);

    // Interaction Logic
    const input = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send');

    function openChat(query) {
        sidebar.classList.add('open');
        if (query) {
            appendMessage('user', query);
            fetchAIResponse(query);
        }
    }

    async function fetchAIResponse(message) {
        const history = document.getElementById('ai-chat-history');
        const loading = document.createElement('div');
        loading.innerText = 'AI is thinking...';
        loading.style.fontSize = '12px';
        loading.style.opacity = '0.5';
        history.appendChild(loading);

        try {
            const res = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await res.json();
            history.removeChild(loading);
            appendMessage('ai', data.response);
        } catch (err) {
            history.removeChild(loading);
            appendMessage('ai', 'Error: Could not connect to AI engine. Make sure the server is running.');
        }
    }

    function appendMessage(role, text) {
        const history = document.getElementById('ai-chat-history');
        const msg = document.createElement('div');
        msg.style.margin = '10px 0';
        msg.style.padding = '10px';
        msg.style.borderRadius = '10px';
        msg.style.background = role === 'user' ? 'var(--ai-primary)' : 'var(--ai-glass-bg)';
        msg.style.color = role === 'user' ? 'white' : 'var(--ai-text)';
        msg.style.alignSelf = role === 'user' ? 'flex-end' : 'flex-start';
        msg.innerText = text;
        history.appendChild(msg);
    }

    sendBtn.addEventListener('click', () => {
        if (input.value.trim()) {
            openChat(input.value);
            input.value = '';
        }
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            openChat(input.value);
            input.value = '';
        }
    });

})();
