const API_KEY = 'AIzaSyAoqt2QYyqx6MFe9vs-zq8Sa9I48cGYs9U';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
        systemInstruction: {
          parts: [{ text: 'Respond only with valid JSON array, no explanations or markdown' }]
        }
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
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
    console.error('Gemini API error:', error);
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

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        },
        systemInstruction: {
          parts: [{ text: 'Respond only with JSON, no explanations' }]
        }
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error('Gemini API error:', error);
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

    const prompt = `You are an English teacher for Uzbek students. Generate 10 fill-in-the-blank questions based on these topics:

${topicList}

The questions should test understanding of:
- Grammar concepts
- Vocabulary usage
- Sentence formation
- Topic-specific knowledge

Generate questions in this JSON format (no other text, just the array):
[
  {
    "question": "What is the correct form? ___ have been to London before.",
    "correctAnswer": "has"
  }
]

Rules:
- Use fill-in-the-blank format, not multiple choice
- Questions should test grammar and vocabulary
- Return exactly 10 questions
- Use simple English in questions
- correctAnswer should be a short word or phrase`;

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response data:', JSON.stringify(data).substring(0, 200));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Response text:', text.substring(0, 200));

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('Parsed questions:', parsed.length);
      return parsed;
    }

    console.error('No JSON found in response');
    return [];
  } catch (error) {
    console.error('Gemini API error:', error);
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

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        }
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
};