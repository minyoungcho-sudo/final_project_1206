// GPT API를 사용한 번역 함수
export async function translateWithGPT(sentence) {
  const apiKey = import.meta.env.VITE_GPT_API_KEY;
  
  // 디버깅: 환경 변수 확인
  console.log('=== API Key Debug Info ===');
  console.log('import.meta.env.VITE_GPT_API_KEY:', apiKey ? `존재함 (길이: ${apiKey.length}, 처음 7자: ${apiKey.substring(0, 7)}...)` : '없음');
  console.log('apiKey 타입:', typeof apiKey);
  console.log('apiKey 값:', apiKey);
  console.log('모든 import.meta.env 키:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
  console.log('========================');
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined' || apiKey === 'null') {
    console.error('❌ GPT API Key가 설정되지 않았습니다.');
    console.error('📋 해결 방법:');
    console.error('1. 프로젝트 루트(package.json과 같은 위치)에 .env 파일 확인');
    console.error('2. .env 파일 내용: VITE_GPT_API_KEY=sk-your-actual-key-here');
    console.error('3. 등호(=) 양쪽에 공백 없어야 함');
    console.error('4. 따옴표 없이 직접 입력');
    console.error('5. 개발 서버를 완전히 중지(Ctrl+C) 후 재시작');
    return '번역을 위해 API 키가 필요합니다. 브라우저 콘솔(F12)에서 디버깅 정보를 확인하세요.';
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional English to Korean translator. Translate the given English sentence to natural Korean. Only provide the translation without any additional explanation.'
          },
          {
            role: 'user',
            content: `Translate this English sentence to Korean: "${sentence}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Translation failed');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || '번역을 가져올 수 없습니다.';
  } catch (error) {
    console.error('Translation error:', error);
    return `번역 오류: ${error.message}`;
  }
}

// GPT API를 사용한 종합 문법 분석 함수
export async function analyzeSentenceWithGPT(sentence) {
  const apiKey = import.meta.env.VITE_GPT_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined' || apiKey === 'null') {
    console.warn('GPT API Key가 설정되지 않았습니다.');
    return null;
  }

  try {
    const prompt = `Analyze the following English sentence using the systematic 5-step method below.

Sentence: "${sentence}"

[분석 단계]

[1단계] 동사(V)를 먼저 찾는다. 동사가 여러 개면 절을 나누어 핵심동사를 판단한다.

[2단계] **중요: 동사를 찾은 후, 그 동사를 기준으로 주어(S)를 찾는다.**
        - 동사 바로 앞에 있는 명사구가 주어이다.
        - 주어는 반드시 명사구 전체를 포함하며 단어 일부만 주어로 선택하지 않는다.
        - 분사구문이나 다른 수식어구는 주어가 아니다. 동사 앞의 핵심 명사구만 주어이다.
        - 예: "Dealing with problems, mirroring real-world problems requires..." 에서 'requires'가 동사이면, 그 바로 앞의 'mirroring real-world problems'가 주어이다. 'Dealing with problems'는 분사구문으로 수식어이다.

[3단계] 목적어(O) 또는 보어(C)를 찾는다.
        목적어: 동사의 의미상 필요한 대상
        보어: 주어나 목적어를 설명하는 성분

[4단계] 위의 필수 성분(S/V/O/C)을 제외한 모든 수식어는 M(Modifier)로 분류한다.
        전치사구, 부사구, 접속사구, 분사구문 등은 모두 M이다.
        분사구문은 'participialPhrases'에도 별도로 표시한다.

[5단계] 구문 유형을 탐지한다.
        예: 도치, 부정어도치, 분사구문, 관계사절, 준동사, 강조구문 등

Provide a detailed JSON object with the following exact structure:
{
  "subject": "the complete subject noun phrase with ALL words (exact match from sentence)",
  "verb": "the main verb phrase (exact words from sentence, if multiple verbs exist, identify the core verb of each clause)",
  "object": "the object phrase if exists (exact words, otherwise empty string)",
  "complement": "the complement phrase if exists (exact words, otherwise empty string)",
  "modifiers": ["modifier phrase 1", "modifier phrase 2"],
  "participialPhrases": ["participial phrase 1", "participial phrase 2"],
  "relativeClauses": [
    {
      "text": "the complete relative clause text (exact match)",
      "antecedent": "the word/phrase the relative clause modifies"
    }
  ],
  "sentenceType": "구문 유형 (도치, 부정어도치, 분사구문, 관계사절, 준동사, 강조구문 등)",
  "structure": "concise description of sentence structure in Korean (e.g., 'SVO', 'SVC', 'Complex sentence with...')",
  "grammarPoints": [
    "Detailed grammar point 1 in Korean",
    "Detailed grammar point 2 in Korean"
  ]
}

Critical requirements:
1. Follow the 5-step analysis method exactly as described above
2. **MOST IMPORTANT: Find the verb FIRST, then identify the subject based on that verb. The subject is the noun phrase immediately before the verb, NOT participial phrases or other modifiers.**
3. Identify the EXACT words/phrases from the original sentence - copy them exactly as they appear, including punctuation and capitalization
4. Subject must include the COMPLETE noun phrase immediately before the verb, never just a partial word, and never include participial phrases that come before it
5. For verbs: if multiple verbs exist, analyze clauses separately and identify the core verb of each clause
6. All modifiers (prepositional phrases, adverbial phrases, participial phrases, etc.) should be classified as M
7. For participialPhrases: identify all participial constructions (including -ing, -ed forms used as modifiers) that are NOT the subject
8. For relativeClauses: identify all relative clauses (who, which, that, whose, whom, where, when) with their exact text
9. Detect and describe special sentence types (inversion, negative inversion, participial phrases, relative clauses, non-finite verbs, emphasis, etc.)
10. Grammar points should be in Korean and educational
11. Return ONLY valid JSON, no additional text or explanations`;

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
            content: 'You are an expert English grammar analyzer and teacher. You provide precise grammatical analysis in valid JSON format only. Never add any explanatory text outside the JSON structure.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Analysis failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    // JSON 파싱
    try {
      let parsed;
      
      // response_format이 json_object이면 직접 파싱 가능
      if (content.startsWith('{')) {
        parsed = JSON.parse(content);
      } else {
        // 코드 블록이나 다른 텍스트가 있는 경우
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      }
      
      // 기본값 설정
      return {
        subject: parsed.subject || '',
        verb: parsed.verb || '',
        object: parsed.object || '',
        complement: parsed.complement || '',
        modifiers: parsed.modifiers || [],
        participialPhrases: parsed.participialPhrases || [],
        relativeClauses: parsed.relativeClauses || [],
        sentenceType: parsed.sentenceType || '',
        structure: parsed.structure || '',
        grammarPoints: parsed.grammarPoints || []
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', content);
      return null;
    }
  } catch (error) {
    console.error('GPT Analysis error:', error);
    return null;
  }
}

// GPT API를 사용한 지문 전체 내용 분석 함수
export async function analyzeContentWithGPT(fullText) {
  const apiKey = import.meta.env.VITE_GPT_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined' || apiKey === 'null') {
    console.warn('GPT API Key가 설정되지 않았습니다.');
    return null;
  }

  try {
    const prompt = `Analyze the following English passage comprehensively. Provide a detailed analysis of the passage's main idea, structure, key concepts, and organization.

Passage: "${fullText}"

Provide a detailed JSON object with the following exact structure:
{
  "mainIdea": "지문의 주제를 1~2문장으로 요약 (한국어)",
  "developmentPattern": "글의 전개 방식 (한국어, 예: 문제-해결, 비교-대조, 원인-결과, 시간순, 논증-반박, 일반-구체 등)",
  "keyKeywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "topicSentenceLocation": "주제문 위치 (한국어, 예: 첫 문장, 마지막 문장, 중간, 암묵적 등)",
  "paragraphStructure": "문단 구조 설명 (한국어, 각 문단의 역할과 연결 방식)",
  "mainArguments": [
    "주요 논점 1 (한국어)",
    "주요 논점 2 (한국어)"
  ]
}

Critical requirements:
1. Main idea should be concise (1-2 sentences) and capture the central theme
2. Development pattern should accurately describe how the passage is organized
3. Key keywords should be the most important terms (3-5 keywords)
4. Topic sentence location should indicate where the main idea is expressed
5. All text should be in Korean
6. Return ONLY valid JSON, no additional text or explanations`;

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
            content: 'You are an expert English passage analyzer and educator. You provide comprehensive passage analysis in valid JSON format only. Never add any explanatory text outside the JSON structure.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Content analysis failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    // JSON 파싱
    try {
      let parsed;
      
      if (content.startsWith('{')) {
        parsed = JSON.parse(content);
      } else {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      }
      
      // 기본값 설정
      return {
        mainIdea: parsed.mainIdea || '',
        developmentPattern: parsed.developmentPattern || '',
        keyKeywords: parsed.keyKeywords || [],
        topicSentenceLocation: parsed.topicSentenceLocation || '',
        paragraphStructure: parsed.paragraphStructure || '',
        mainArguments: parsed.mainArguments || []
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', content);
      return null;
    }
  } catch (error) {
    console.error('GPT Content Analysis error:', error);
    return null;
  }
}

// GPT API를 사용한 연습 문제 생성 함수
export async function generateExerciseWithGPT(fullText, questionType) {
  const apiKey = import.meta.env.VITE_GPT_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined' || apiKey === 'null') {
    console.warn('GPT API Key가 설정되지 않았습니다.');
    return null;
  }

  // 문제 유형 설명
  const questionTypeDescriptions = {
    'grammar_sv_agreement': '주어-동사 일치 문제',
    'grammar_tense': '시제 선택 문제',
    'grammar_relative': '관계대명사/관계부사 문제',
    'grammar_participle': '분사 구문 문제',
    'grammar_subjunctive': '가정법 문제',
    'reading_main_idea': '주제 찾기 문제',
    'reading_title': '제목 고르기 문제',
    'vocabulary_context': '문맥상 적절한 단어 선택 문제'
  };

  const questionTypeName = questionTypeDescriptions[questionType] || questionType;

  try {
    const prompt = `Create a practice question based on the following English passage. The question type is: ${questionTypeName}.

Passage: "${fullText}"

Generate a multiple-choice question with 5 options (A, B, C, D, E) based on the passage. Provide a detailed explanation including:
1. The correct answer and why it's correct
2. Why each incorrect option is wrong
3. Additional grammar/vocabulary explanations related to the question

Provide a detailed JSON object with the following exact structure:
{
  "questionType": "${questionType}",
  "questionTypeName": "${questionTypeName}",
  "question": "문제 내용 (한국어 또는 영어, 문제 유형에 맞게)",
  "passageExcerpt": "문제와 관련된 지문의 일부 (있는 경우)",
  "options": {
    "A": "선택지 A (영어 또는 한국어)",
    "B": "선택지 B (영어 또는 한국어)",
    "C": "선택지 C (영어 또는 한국어)",
    "D": "선택지 D (영어 또는 한국어)",
    "E": "선택지 E (영어 또는 한국어)"
  },
  "correctAnswer": "A",
  "explanation": {
    "correctAnswerExplanation": "정답인 이유 설명 (한국어)",
    "incorrectOptions": {
      "A": "선택지 A가 틀린 이유 (한국어, A가 정답이 아닌 경우에만)",
      "B": "선택지 B가 틀린 이유 (한국어, B가 정답이 아닌 경우에만)",
      "C": "선택지 C가 틀린 이유 (한국어, C가 정답이 아닌 경우에만)",
      "D": "선택지 D가 틀린 이유 (한국어, D가 정답이 아닌 경우에만)",
      "E": "선택지 E가 틀린 이유 (한국어, E가 정답이 아닌 경우에만)"
    },
    "additionalNotes": "관련 문법/어휘 추가 설명 (한국어)"
  }
}

Critical requirements:
1. The question must be directly related to the provided passage
2. All 5 options should be plausible but only one should be correct
3. For grammar questions: create sentences or blanks based on the passage context
4. For reading questions: create comprehension questions about the main idea or title
5. For vocabulary questions: create context-based word choice questions
6. All explanations should be in Korean and educational
7. The correct answer should be clearly indicated (A, B, C, D, or E)
8. Return ONLY valid JSON, no additional text or explanations`;

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
            content: 'You are an expert English educator who creates high-quality practice questions. You provide questions in valid JSON format only. Never add any explanatory text outside the JSON structure.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Exercise generation failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    // JSON 파싱
    try {
      let parsed;
      
      if (content.startsWith('{')) {
        parsed = JSON.parse(content);
      } else {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      }
      
      // 기본값 설정 및 정답 검증
      const correctAnswer = parsed.correctAnswer?.toUpperCase().trim();
      if (!['A', 'B', 'C', 'D', 'E'].includes(correctAnswer)) {
        throw new Error('Invalid correct answer');
      }

      // 정답이 아닌 선택지들의 설명만 포함
      const incorrectOptions = {};
      if (parsed.explanation?.incorrectOptions) {
        Object.keys(parsed.options || {}).forEach(key => {
          if (key !== correctAnswer && parsed.explanation.incorrectOptions[key]) {
            incorrectOptions[key] = parsed.explanation.incorrectOptions[key];
          }
        });
      }
      
      return {
        questionType: parsed.questionType || questionType,
        questionTypeName: parsed.questionTypeName || questionTypeName,
        question: parsed.question || '',
        passageExcerpt: parsed.passageExcerpt || '',
        options: parsed.options || {},
        correctAnswer: correctAnswer,
        explanation: {
          correctAnswerExplanation: parsed.explanation?.correctAnswerExplanation || '',
          incorrectOptions: incorrectOptions,
          additionalNotes: parsed.explanation?.additionalNotes || ''
        }
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', content);
      return null;
    }
  } catch (error) {
    console.error('GPT Exercise Generation error:', error);
    return null;
  }
}

