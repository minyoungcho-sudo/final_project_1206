// 챗봇 API 함수
export async function askChatbot(question) {
  const apiKey = import.meta.env.VITE_GPT_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined' || apiKey === 'null') {
    return 'API 키가 설정되지 않았습니다.';
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful English language tutor and assistant. Answer questions about English grammar, vocabulary, expressions, and language learning in Korean. Be concise, clear, and educational.'
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Chatbot request failed');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || '응답을 생성할 수 없습니다.';
  } catch (error) {
    console.error('Chatbot error:', error);
    return `오류가 발생했습니다: ${error.message}`;
  }
}










