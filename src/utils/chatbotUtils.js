import { askChatbot } from './chatbotApi.js';

// 챗봇 설정 함수
export function setupChatbot() {
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const closeChatbotBtn = document.getElementById('close-chatbot');

  if (!chatForm || !chatInput || !chatMessages) return;

  // 챗봇 닫기 버튼
  if (closeChatbotBtn) {
    closeChatbotBtn.addEventListener('click', () => {
      const chatbot = document.getElementById('chatbot-container');
      if (chatbot) {
        chatbot.style.display = chatbot.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  // 채팅 전송
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = chatInput.value.trim();
    
    if (!question) return;

    // 사용자 메시지 추가
    addChatMessage(question, 'user');
    chatInput.value = '';

    // 로딩 표시
    const loadingId = addLoadingMessage();

    try {
      // 챗봇 응답 받기
      const answer = await askChatbot(question);
      
      // 로딩 메시지 제거
      removeLoadingMessage(loadingId);
      
      // 챗봇 응답 추가
      addChatMessage(answer, 'assistant');
    } catch (error) {
      removeLoadingMessage(loadingId);
      addChatMessage('오류가 발생했습니다. 다시 시도해주세요.', 'assistant');
    }
  });
}

// 채팅 메시지 추가 함수
export function addChatMessage(message, role) {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return null;

  const messageDiv = document.createElement('div');
  messageDiv.className = `flex items-start gap-3 ${role === 'user' ? 'flex-row-reverse' : ''}`;
  
  if (role === 'user') {
    messageDiv.innerHTML = `
      <div class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm p-4 max-w-[85%] ml-auto shadow-sm">
        <p class="text-sm leading-relaxed">${escapeHtml(message)}</p>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
        <span class="material-symbols-outlined text-white text-sm">smart_toy</span>
      </div>
      <div class="flex-1 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-gray-100 dark:border-gray-700/50">
        <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">${escapeHtml(message)}</p>
      </div>
    `;
  }

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return messageDiv;
}

// 로딩 메시지 추가
export function addLoadingMessage() {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return null;

  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'chat-loading';
  loadingDiv.className = 'flex items-start gap-3';
  loadingDiv.innerHTML = `
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
      <span class="material-symbols-outlined text-white text-sm">smart_toy</span>
    </div>
    <div class="flex-1 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-gray-100 dark:border-gray-700/50">
      <div class="flex gap-1.5">
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
    </div>
  `;

  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return loadingDiv;
}

// 로딩 메시지 제거
export function removeLoadingMessage(loadingElement) {
  if (loadingElement && loadingElement.parentNode) {
    loadingElement.parentNode.removeChild(loadingElement);
  }
}

// HTML 이스케이프 함수
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

