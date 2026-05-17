import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const bigPickle = createOpenAICompatible({
  name: 'opencode-zen',
  baseURL: 'https://opencode.ai/zen/v1',
});

export const bigPickleModel = bigPickle('big-pickle');

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  studyGuide?: string;
  flashCards?: { question: string; answer: string }[];
}

export interface AIProcessingOptions {
  temperature?: number;
  maxTokens?: number;
}

const DEFAULT_OPTIONS: AIProcessingOptions = {
  temperature: 0.7,
  maxTokens: 8192,
};

export async function generateLectureSummary(
  transcription: string,
  lectureTitle: string,
  options: AIProcessingOptions = {}
): Promise<SummaryResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const response = await bigPickleModel.doGenerate({
    prompt: `You are an educational AI assistant helping students learn from lecture transcripts. Analyze the following lecture transcript and generate comprehensive study materials.

LECTURE TITLE: ${lectureTitle}

TRANSCRIPT:
${transcription}

Please provide a JSON response with the following structure:
{
  "summary": "A comprehensive 3-5 paragraph summary of the lecture covering all major topics discussed",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6", "Point 7", "Point 8", "Point 9", "Point 10"],
  "studyGuide": "A detailed study guide with sections for review questions, key terms, and main concepts",
  "flashCards": [
    {"question": "Question 1", "answer": "Answer 1"},
    {"question": "Question 2", "answer": "Answer 2"},
    {"question": "Question 3", "answer": "Answer 3"},
    {"question": "Question 4", "answer": "Answer 4"},
    {"question": "Question 5", "answer": "Answer 5"}
  ]
}

Ensure the summary is educational and focused on key learning outcomes.`,
    temperature: opts.temperature,
    maxTokens: opts.maxTokens,
  });

  const text = response.text;
  
  try {
    const parsed = JSON.parse(text);
    return {
      summary: parsed.summary || '',
      keyPoints: parsed.keyPoints || [],
      studyGuide: parsed.studyGuide,
      flashCards: parsed.flashCards,
    };
  } catch {
    return {
      summary: text.substring(0, 1000),
      keyPoints: [],
    };
  }
}

export async function generateTranscriptFromAudio(
  _audioUrl: string
): Promise<TranscriptionResult> {
  throw new Error('Audio transcription requires a dedicated speech-to-text service. Please provide a pre-transcribed transcript.');
}

export async function enhanceTranscript(
  transcription: string,
  language: string = 'en'
): Promise<string> {
  const response = await bigPickleModel.doGenerate({
    prompt: `You are an educational AI assistant. The following is a transcript that may contain errors, filler words, or unclear phrasing due to automatic speech recognition. Please clean and enhance this transcript for educational use.

Original transcript:
${transcription}

Language: ${language}

Please return the enhanced, cleaned transcript that:
1. Removes filler words (um, uh, like, you know, etc.)
2. Fixes obvious transcription errors
3. Adds proper punctuation
4. Maintains the original meaning and educational content
5. Preserves technical terms accurately

Return only the enhanced transcript without any preamble.`,
    temperature: 0.3,
    maxTokens: 8192,
  });

  return response.text;
}

export async function generateCaptions(
  transcription: string,
  durationSeconds: number
): Promise<string> {
  const response = await bigPickleModel.doGenerate({
    prompt: `Convert the following lecture transcript into WebVTT subtitle format. The lecture duration is ${durationSeconds} seconds. Create timestamped captions that appear in sync with speech.

TRANSCRIPT:
${transcription}

Return only the WebVTT formatted captions without any preamble. Example format:
WEBVTT

00:00:00.000 --> 00:00:05.000
First caption text here

00:00:05.000 --> 00:00:10.000
Second caption text here`,
    temperature: 0.3,
    maxTokens: 8192,
  });

  return response.text;
}

export async function generateQuizFromTranscript(
  transcription: string,
  lectureTitle: string,
  questionCount: number = 10
): Promise<{ question: string; options: string[]; correctAnswer: number; explanation: string }[]> {
  const response = await bigPickleModel.doGenerate({
    prompt: `Generate ${questionCount} multiple choice quiz questions based on the following lecture transcript.

LECTURE TITLE: ${lectureTitle}

TRANSCRIPT:
${transcription}

Return a JSON array of quiz questions with the following structure:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this is the correct answer"
  }
]

Ensure:
- Questions cover key concepts from the lecture
- Options are plausible but only one is correct
- Explanations help students understand the material`,
    temperature: 0.7,
    maxTokens: 8192,
  });

  try {
    return JSON.parse(response.text);
  } catch {
    return [];
  }
}

export async function explainConcept(
  concept: string,
  context: string
): Promise<string> {
  const response = await bigPickleModel.doGenerate({
    prompt: `Explain the following concept in an educational context:

CONCEPT: ${concept}

CONTEXT (related lecture material):
${context}

Provide a clear, educational explanation that:
1. Defines the concept clearly
2. Explains why it's important
3. Provides examples
4. Connects it to the broader topic`,
    temperature: 0.7,
    maxTokens: 4096,
  });

  return response.text;
}

export async function translateTranscript(
  transcription: string,
  targetLanguage: string
): Promise<string> {
  const response = await bigPickleModel.doGenerate({
    prompt: `Translate the following lecture transcript to ${targetLanguage}. Maintain educational tone and technical accuracy.

TRANSCRIPT:
${transcription}

Return only the translated transcript.`,
    temperature: 0.3,
    maxTokens: 8192,
  });

  return response.text;
}
