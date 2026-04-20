// Allow pressing 'Enter' to send
document.getElementById("userInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const input = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");
    const container = document.querySelector(".chat-container");

    const userText = input.value.trim();
    if (!userText) return;

    // Clear input
    input.value = "";

    // Add user message to UI
    const userMessageHTML = `
        <div class="message user-msg">
            <div class="msg-avatar">👤</div>
            <div class="msg-bubble">${escapeHTML(userText)}</div>
        </div>
    `;
    chatBox.insertAdjacentHTML('beforeend', userMessageHTML);
    scrollToBottom(container);

    // Add typing indicator
    const typingId = "typing-" + Date.now();
    const typingHTML = `
        <div class="message bot-msg" id="${typingId}">
            <div class="msg-avatar">🤖</div>
            <div class="msg-bubble">
                <div class="typing-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
    `;
    chatBox.insertAdjacentHTML('beforeend', typingHTML);
    scrollToBottom(container);

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: userText })
        });

        const data = await response.json();
        
        // Remove typing indicator
        document.getElementById(typingId).remove();

        // Format bot response (simple markdown to HTML for bolding)
        const formattedReply = data.reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Add bot message
        const botMessageHTML = `
            <div class="message bot-msg">
                <div class="msg-avatar">🤖</div>
                <div class="msg-bubble">${formattedReply}</div>
            </div>
        `;
        chatBox.insertAdjacentHTML('beforeend', botMessageHTML);
        
    } catch (error) {
        document.getElementById(typingId).remove();
        const errorMessageHTML = `
            <div class="message bot-msg">
                <div class="msg-avatar">⚠️</div>
                <div class="msg-bubble" style="color: #ef4444; background: #fef2f2; border-color: #fca5a5;">
                    Sorry, I'm having trouble connecting right now. Please try again.
                </div>
            </div>
        `;
        chatBox.insertAdjacentHTML('beforeend', errorMessageHTML);
    }
    
    scrollToBottom(container);
}

function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}