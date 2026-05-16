// Groq API for AI features
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const generateQuestionsWithGemini = async (words) => {
  if (words.length < 3) return [];

  try {
    const wordList = words.map(w => `- ${w.word} (${w.translation}): ${w.example}`).join('\n');

    const prompt = `You are an English teacher for Uzbek students. Generate 10 practice questions based on these vocabulary words:

${wordList}

Generate questions in this JSON format (no other text):
[
  {
    "type": "translation|fillBlank|meaning|sentence",
    "question": "the question in English or Uzbek",
    "answer": "the correct answer",
    "hint": "a helpful hint in Uzbek"
  }
]

Rules:
- Use "translation" for English to Uzbek translation
- Use "fillBlank" for fill in the blank ( Uzbek sentence with _____ )
- Use "meaning" for "What does X mean in Uzbek?"
- Use "sentence" for completing a sentence with the word
- Mix question types evenly
- Return exactly 10 questions`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an English teacher. Respond only with valid JSON array, no explanations or markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      return questions.map(q => ({
        ...q,
        word: words.find(w => w.word.toLowerCase() === q.answer?.toLowerCase().split(' ')[0]) || words[0]
      }));
    }

    return [];
  } catch (error) {
    console.error('Groq API error:', error);
    return null;
  }
};

export const checkAnswerWithGemini = async (question, userAnswer, word) => {
  try {
    const prompt = `You are an English teacher for Uzbek students.

Question: ${question}
User's answer: ${userAnswer}
Correct answer: ${word.word}
Word translation: ${word.translation}
Example: ${word.example}

Determine if the user's answer is correct. Consider:
- Synonyms and alternative translations
- Minor spelling variations
- Partial matches for multi-word answers

Respond in this JSON format:
{
  "isCorrect": true or false,
  "feedback": "short feedback message in Uzbek (1-2 sentences)",
  "suggestion": "if wrong, suggest what the correct answer might be"
}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an English teacher. Respond only with JSON, no explanations.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 512
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error('Groq API error:', error);
    return null;
  }
};

export const generateTopicsQuestions = async (topics) => {
  if (topics.length === 0) return [];

  try {
    const topicList = topics.map(t => {
      const keywords = Array.isArray(t.keywords) ? t.keywords.join(', ') : (t.keywords || '');
      return `- ${t.title}: ${t.description || ''} (keywords: ${keywords})`;
    }).join('\n');

    console.log('Generating questions for topics:', topics.length);

    const prompt = `You are an English teacher for Uzbek students. Generate exactly 15 questions (5 of each type) based on these topics:

${topicList}

Generate questions in this JSON format (no other text, just the array):
[
  {
    "type": "fillBlank|wordOrder|translation",
    "question": "the question text",
    "correctAnswer": "the correct answer",
    "shuffledWords": "for wordOrder: comma separated shuffled words",
    "uzbekText": "for translation: Uzbek text to translate"
  }
]

Type details:
- fillBlank: English sentence with _____ (5 questions)
- wordOrder: Give shuffled English words, user orders them (5 questions)
- translation: Translate Uzbek sentence to English (5 questions)

Rules:
- Return exactly 15 questions (5 fillBlank, 5 wordOrder, 5 translation)
- Use simple English in questions
- For wordOrder: shuffledWords should be the words of the correct sentence shuffled
- For translation: include uzbekText field with the Uzbek sentence to translate`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an English teacher. Respond only with valid JSON array.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3072
      })
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('Parsed questions:', parsed.length, 'types:', parsed.filter(q => q.type === 'fillBlank').length, 'fillBlank,', parsed.filter(q => q.type === 'wordOrder').length, 'wordOrder,', parsed.filter(q => q.type === 'translation').length, 'translation');
      return parsed;
    }

    console.error('No JSON found in response');
    return [];
  } catch (error) {
    console.error('Groq API error:', error);
    return null;
  }
};

export const checkSentenceWithAI = async (question, userAnswer, correctAnswer) => {
  try {
    const prompt = `You are an English teacher for Uzbek students.

Question: ${question}
Expected concept: ${correctAnswer}

Student's answer: "${userAnswer}"

Determine if the student's answer is correct. Consider:
- Understanding of the concept
- Accuracy of the answer
- Completeness

Respond in this JSON format:
{
  "isCorrect": true or false,
  "feedback": "short feedback message in Uzbek (1-2 sentences)"
}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an English teacher. Respond only with JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 512
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error('Groq API error:', error);
    return null;
  }
};