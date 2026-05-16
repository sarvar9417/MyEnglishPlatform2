const API_KEY = 'AIzaSyAaE1xmBze2xSH2MaosfyBykBNPW4agOPI';
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