export function renderChatbot() {
  return `
    <!-- Chatbot Sidebar -->
    <div class="h-full bg-white dark:bg-gray-900 flex flex-col">
      <!-- Chatbot Header -->
      <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-lg">smart_toy</span>
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">영어 학습 도우미</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">온라인</p>
          </div>
        </div>
        <button id="close-chatbot" class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <!-- Chat Messages -->
      <div id="chat-messages" class="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30 dark:bg-gray-800/30">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <span class="material-symbols-outlined text-white text-sm">smart_toy</span>
          </div>
          <div class="flex-1 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-gray-100 dark:border-gray-700/50">
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">영어에 대해 궁금한 점이 있으시면 언제든지 질문해주세요! 문법, 어휘, 표현 등 무엇이든 도와드리겠습니다.</p>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <form id="chat-form" class="flex gap-2">
          <input 
            type="text" 
            id="chat-input" 
            placeholder="질문을 입력하세요..." 
            class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button 
            type="submit" 
            class="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <span class="material-symbols-outlined text-lg">send</span>
          </button>
        </form>
      </div>
    </div>
  `;
}

