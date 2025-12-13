// 문장 분리 함수
export function splitIntoSentences(text) {
  // 마침표, 물음표, 느낌표로 문장 분리
  // 약어 등을 고려한 간단한 분리 로직
  const sentences = text
    .replace(/([.!?])\s+/g, '$1|SPLIT|')
    .split('|SPLIT|')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  return sentences;
}

// 간단한 문법 요소 추출 (초기 버전 - 규칙 기반)
export function analyzeSentence(sentence) {
  const analysis = {
    original: sentence,
    subjects: [],
    verbs: [],
    objects: [],
    complements: [],
    modifiers: [],
    clauses: [],
    prepositions: [],
    conjunctions: []
  };

  // 접속사 감지
  const conjunctions = ['and', 'or', 'but', 'so', 'because', 'although', 'though', 'while', 'when', 'if', 'that', 'which', 'who', 'whom', 'whose', 'where', 'since', 'until', 'unless', 'whether'];
  const words = sentence.split(/\s+/);
  
  conjunctions.forEach(conj => {
    const regex = new RegExp(`\\b${conj}\\b`, 'gi');
    const matches = sentence.match(regex);
    if (matches) {
      // 접속사의 위치 찾기
      const positions = [];
      words.forEach((word, idx) => {
        if (word.toLowerCase().replace(/[.,!?;:]/g, '') === conj.toLowerCase()) {
          positions.push(idx);
        }
      });
      analysis.conjunctions.push(...matches.map((m, i) => ({ word: m, position: positions[i] || 0 })));
    }
  });

  // 전치사 감지
  const prepositions = ['in', 'on', 'at', 'by', 'for', 'with', 'from', 'to', 'of', 'about', 'into', 'onto', 'upon', 'within', 'without', 'through', 'during', 'before', 'after', 'above', 'below', 'under', 'over', 'between', 'among', 'against', 'along', 'around', 'behind', 'beside', 'besides', 'beyond'];
  prepositions.forEach(prep => {
    const regex = new RegExp(`\\b${prep}\\b`, 'gi');
    const matches = sentence.match(regex);
    if (matches) {
      const positions = [];
      words.forEach((word, idx) => {
        if (word.toLowerCase().replace(/[.,!?;:]/g, '') === prep.toLowerCase()) {
          positions.push(idx);
        }
      });
      analysis.prepositions.push(...matches.map((m, i) => ({ word: m, position: positions[i] || 0 })));
    }
  });

  // 동사 목록 확장
  const commonVerbs = ['is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'done', 'will', 'would', 'can', 'could', 'should', 'shall', 'may', 'might', 'must', 'ought'];
  const actionVerbs = ['go', 'goes', 'went', 'gone', 'come', 'comes', 'came', 'get', 'gets', 'got', 'gotten', 'make', 'makes', 'made', 'take', 'takes', 'took', 'taken', 'see', 'sees', 'saw', 'seen', 'know', 'knows', 'knew', 'known', 'think', 'thinks', 'thought', 'say', 'says', 'said', 'tell', 'tells', 'told', 'want', 'wants', 'wanted', 'like', 'likes', 'liked', 'look', 'looks', 'looked', 'find', 'finds', 'found', 'give', 'gives', 'gave', 'given', 'use', 'uses', 'used', 'work', 'works', 'worked', 'call', 'calls', 'called', 'try', 'tries', 'tried', 'ask', 'asks', 'asked', 'need', 'needs', 'needed', 'feel', 'feels', 'felt', 'become', 'becomes', 'became', 'leave', 'leaves', 'left', 'put', 'puts', 'let', 'lets', 'help', 'helps', 'helped', 'keep', 'keeps', 'kept', 'turn', 'turns', 'turned', 'start', 'starts', 'started', 'show', 'shows', 'showed', 'shown', 'hear', 'hears', 'heard', 'play', 'plays', 'played', 'run', 'runs', 'ran', 'move', 'moves', 'moved', 'live', 'lives', 'lived', 'believe', 'believes', 'believed', 'bring', 'brings', 'brought', 'happen', 'happens', 'happened', 'write', 'writes', 'wrote', 'written', 'sit', 'sits', 'sat', 'stand', 'stands', 'stood', 'lose', 'loses', 'lost', 'add', 'adds', 'added', 'change', 'changes', 'changed', 'follow', 'follows', 'followed', 'study', 'studies', 'studied', 'learn', 'learns', 'learned', 'learned', 'understand', 'understands', 'understood', 'watch', 'watches', 'watched', 'stop', 'stops', 'stopped', 'create', 'creates', 'created', 'speak', 'speaks', 'spoke', 'spoken', 'read', 'reads', 'spend', 'spends', 'spent', 'grow', 'grows', 'grew', 'grown', 'open', 'opens', 'opened', 'walk', 'walks', 'walked', 'win', 'wins', 'won', 'teach', 'teaches', 'taught', 'offer', 'offers', 'offered', 'remember', 'remembers', 'remembered', 'consider', 'considers', 'considered', 'appear', 'appears', 'appeared', 'buy', 'buys', 'bought', 'serve', 'serves', 'served', 'die', 'dies', 'died', 'send', 'sends', 'sent', 'build', 'builds', 'built', 'stay', 'stays', 'stayed', 'fall', 'falls', 'fell', 'fallen', 'cut', 'cuts', 'reach', 'reaches', 'reached', 'kill', 'kills', 'killed', 'raise', 'raises', 'raised', 'pass', 'passes', 'passed', 'sell', 'sells', 'sold', 'decide', 'decides', 'decided', 'return', 'returns', 'returned', 'explain', 'explains', 'explained', 'develop', 'develops', 'developed', 'carry', 'carries', 'carried', 'break', 'breaks', 'broke', 'broken', 'receive', 'receives', 'received', 'agree', 'agrees', 'agreed', 'support', 'supports', 'supported', 'hit', 'hits', 'produce', 'produces', 'produced', 'eat', 'eats', 'ate', 'eaten', 'cover', 'covers', 'covered', 'catch', 'catches', 'caught', 'draw', 'draws', 'drew', 'drawn', 'choose', 'chooses', 'chose', 'chosen'];
  
  // 동사 찾기
  let verbFound = false;
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase().replace(/[.,!?;:]/g, '');
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    
    // 동사 패턴 확인
    const isVerb = commonVerbs.includes(cleanWord) || 
                   actionVerbs.includes(cleanWord) ||
                   (cleanWord.endsWith('ed') && cleanWord.length > 3 && i > 0) ||
                   (cleanWord.endsWith('ing') && cleanWord.length > 4 && i > 0) ||
                   (cleanWord.endsWith('s') && cleanWord.length > 2 && i > 0 && !cleanWord.endsWith('ss') && !cleanWord.endsWith('us'));
    
    if (isVerb && !verbFound) {
      analysis.verbs.push({ word: words[i], position: i });
      verbFound = true;
      
      // 주어 찾기 (동사 앞)
      if (i > 0) {
        // 주어는 보통 문장 시작부터 동사 전까지 (단, 접속사나 전치사가 있으면 제외)
        let subjectStart = 0;
        for (let j = 0; j < i; j++) {
          const prevWord = words[j].toLowerCase().replace(/[.,!?;:]/g, '');
          if (conjunctions.includes(prevWord)) {
            subjectStart = j + 1;
          }
        }
        
        if (subjectStart < i) {
          const subjectWords = words.slice(subjectStart, i);
          // 전치사나 접속사 제거
          const filteredSubject = subjectWords.filter(w => {
            const wClean = w.toLowerCase().replace(/[.,!?;:]/g, '');
            return !prepositions.includes(wClean) && !conjunctions.includes(wClean);
          });
          
          if (filteredSubject.length > 0) {
            analysis.subjects.push({ 
              words: filteredSubject.join(' '), 
              position: subjectStart 
            });
          }
        }
      }
      
      // 목적어 또는 보어 찾기 (동사 뒤)
      if (i < words.length - 1) {
        // be 동사 계열이면 보어, 아니면 목적어
        const beVerbs = ['is', 'are', 'was', 'were', 'be', 'been', 'being', 'become', 'becomes', 'became'];
        const verbLower = words[i].toLowerCase().replace(/[.,!?;:]/g, '');
        const isBeVerb = beVerbs.includes(verbLower);
        
        let objStart = i + 1;
        // 조동사나 부사 건너뛰기
        const auxiliaries = ['not', 'never', 'always', 'often', 'very', 'quite', 'really', 'just', 'only', 'also', 'too', 'even', 'still', 'already', 'yet'];
        while (objStart < words.length && auxiliaries.includes(words[objStart].toLowerCase().replace(/[.,!?;:]/g, ''))) {
          objStart++;
        }
        
        if (objStart < words.length) {
          // 전치사구 시작 전까지 또는 문장 끝까지
          let objEnd = words.length;
          for (let j = objStart; j < words.length; j++) {
            const wClean = words[j].toLowerCase().replace(/[.,!?;:]/g, '');
            if (prepositions.includes(wClean) && j > objStart + 1) {
              objEnd = j;
              break;
            }
            if (conjunctions.includes(wClean) && j > objStart + 1) {
              objEnd = j;
              break;
            }
          }
          
          const objWords = words.slice(objStart, objEnd);
          if (objWords.length > 0) {
            if (isBeVerb) {
              analysis.complements.push({ 
                words: objWords.join(' '), 
                position: objStart 
              });
            } else {
              analysis.objects.push({ 
                words: objWords.join(' '), 
                position: objStart 
              });
            }
          }
        }
      }
      
      break;
    }
  }
  
  // 절 구분 (접속사 기준)
  if (analysis.conjunctions.length > 0) {
    let lastPos = 0;
    analysis.conjunctions.forEach(conj => {
      if (conj.position > lastPos) {
        analysis.clauses.push({
          start: lastPos,
          end: conj.position,
          type: 'main'
        });
        lastPos = conj.position + 1;
      }
    });
    if (lastPos < words.length) {
      analysis.clauses.push({
        start: lastPos,
        end: words.length,
        type: 'subordinate'
      });
    }
  }

  return analysis;
}

// 문법 포인트 추출
export function extractGrammarPoints(analysis) {
  const points = [];
  
  if (analysis.conjunctions.length > 0) {
    const conj = analysis.conjunctions[0].word.toLowerCase();
    if (['and', 'or', 'but'].includes(conj)) {
      points.push(`등위접속사 "${conj}" 사용 - 병렬 구조`);
    } else if (['because', 'since', 'as'].includes(conj)) {
      points.push(`원인/이유를 나타내는 접속사 "${conj}" 사용`);
    } else if (['although', 'though', 'even though'].includes(conj)) {
      points.push(`양보를 나타내는 접속사 "${conj}" 사용`);
    } else if (['when', 'while', 'as'].includes(conj)) {
      points.push(`시간을 나타내는 접속사 "${conj}" 사용`);
    } else if (['if', 'unless'].includes(conj)) {
      points.push(`조건을 나타내는 접속사 "${conj}" 사용`);
    } else {
      points.push(`접속사 "${conj}" 사용 - 복문 구조`);
    }
  }
  
  if (analysis.prepositions.length > 0) {
    if (analysis.prepositions.length === 1) {
      points.push(`전치사 "${analysis.prepositions[0].word}" 사용`);
    } else {
      points.push(`${analysis.prepositions.length}개의 전치사구 포함`);
    }
  }
  
  if (analysis.verbs.length > 0) {
    const verb = analysis.verbs[0].word.toLowerCase();
    const cleanVerb = verb.replace(/[.,!?;:]/g, '');
    
    if (cleanVerb.includes('ing')) {
      points.push('진행형/동명사 구조');
    } else if (cleanVerb.endsWith('ed')) {
      points.push('과거형/과거분사 구조');
    } else if (['is', 'are', 'was', 'were'].includes(cleanVerb)) {
      points.push('be 동사 사용 - 주어-동사-보어 구조');
    } else if (['have', 'has', 'had'].includes(cleanVerb)) {
      points.push('have/has/had 동사 - 완료형 또는 소유 표현');
    } else if (['can', 'could', 'may', 'might', 'must', 'should', 'will', 'would'].includes(cleanVerb)) {
      points.push(`조동사 "${cleanVerb}" 사용`);
    }
  }
  
  if (analysis.complements.length > 0) {
    points.push('주어-동사-보어(SVC) 구조');
  } else if (analysis.objects.length > 0) {
    points.push('주어-동사-목적어(SVO) 구조');
  }
  
  if (analysis.clauses.length > 1) {
    points.push(`${analysis.clauses.length}개의 절을 포함한 복문`);
  }
  
  if (points.length === 0) {
    points.push('기본 주어-동사 구조');
  }
  
  return points;
}

// 번역 함수 (GPT API 사용)
export async function translateSentence(sentence) {
  // GPT API를 사용한 번역
  const { translateWithGPT } = await import('./gptApi.js');
  return await translateWithGPT(sentence);
}

// 문장 구조 문자열 생성
export function generateStructureString(analysis) {
  const parts = [];
  
  if (analysis.subjects.length > 0) {
    parts.push(`[주어: ${analysis.subjects[0].words}]`);
  }
  
  if (analysis.verbs.length > 0) {
    parts.push(`[동사: ${analysis.verbs[0].word}]`);
  }
  
  if (analysis.objects.length > 0) {
    parts.push(`[목적어: ${analysis.objects[0].words}]`);
  } else if (analysis.complements.length > 0) {
    parts.push(`[보어: ${analysis.complements[0].words}]`);
  }
  
  if (analysis.prepositions.length > 0) {
    const prepPhrases = analysis.prepositions.slice(0, 3).map(p => p.word).join(', ');
    parts.push(`[전치사구: ${prepPhrases}]`);
  }
  
  if (analysis.conjunctions.length > 0) {
    parts.push(`[접속사: ${analysis.conjunctions[0].word}]`);
  }
  
  return parts.join(' + ') || '[구조 분석 중]';
}

