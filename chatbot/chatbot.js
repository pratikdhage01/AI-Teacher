// Replace with your actual Gemini API key
const API_KEY = 'AIzaSyBbMqcZP9FSOTB7yLCNkVXMu7XpJ5JefEs';
let uploadedFileContent = '';

// Listen for file content from index.html
window.addEventListener('message', function(event) {
    if (event.data.type === 'fileContent') {
        uploadedFileContent = event.data.content;
        document.getElementById('file-status').textContent = '📄 File loaded and ready for questions';
        addMessage('left', 'File received. You can now ask questions about the file or any other general questions.');
    }
});

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (message === '') return;

    addMessage('right', message);
    userInput.value = '';

    const thinkingId = addMessage('left', 'Thinking...');

    let context;
    if (uploadedFileContent) {
        context = `You are a helpful AI assistant. You have access to the following file content:
${uploadedFileContent}

Instructions for response:
1. If the question is about the file, refer to the file content in your response
2. If it's a general question, answer it to the best of your ability
3. Format your response in a clear, readable way using:
   - Paragraphs for explanations
   - Bullet points for lists
   - Numbers for steps
4. Do not use asterisks or markdown formatting
5. Keep the tone professional but conversational

User question: ${message}`;
    } else {
        context = `You are a helpful AI assistant. Please answer the following question:
${message}

Instructions for response:
1. Provide a clear and informative response
2. Format your response in a clear, readable way using:
   - Paragraphs for explanations
   - Bullet points for lists
   - Numbers for steps
3. Do not use asterisks or markdown formatting
4. Keep the tone professional but conversational
5. If you're unsure about something, please say so`;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: context
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        const data = await response.json();
        
        document.getElementById(thinkingId).remove();
        
        if (data.candidates && data.candidates[0]) {
            const botResponse = data.candidates[0].content.parts[0].text;
            const cleanResponse = botResponse.replace(/\*/g, '');
            addMessage('left', cleanResponse);
        } else {
            addMessage('left', 'Sorry, I encountered an error processing your request.');
            console.error('Unexpected response structure:', data);
        }
    } catch (error) {
        document.getElementById(thinkingId).remove();
        console.error('Error sending message to Gemini:', error);
        addMessage('left', 'Sorry, I encountered an error processing your request.');
    }
}

// Add event listener for Enter key
document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

function addMessage(position, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    const messageId = 'msg-' + Date.now();
    messageElement.id = messageId;
    
    messageElement.classList.add('message');
    messageElement.classList.add(position === 'right' ? 'user-message' : 'bot-message');
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeElement = `<div class="time">${timestamp}</div>`;
    
    messageElement.innerHTML = `${timeElement}${message.replace(/\n/g, '<br>')}`;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageId;
}