import openai from './config';

export interface FormGenerationPrompt {
  topic: string;
  purpose: string;
  targetAudience?: string;
  additionalContext?: string;
}

interface OpenAIError {
  status?: number;
  error?: {
    type?: string;
    code?: string;
  };
}

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to check if error is rate limit error
const isRateLimitError = (error: unknown): error is OpenAIError => {
  const apiError = error as OpenAIError;
  return apiError?.status === 429 || apiError?.error?.type === 'insufficient_quota' || apiError?.error?.code === 'rate_limit_exceeded';
};

async function makeRequestWithRetry(prompt: FormGenerationPrompt, retries = 3, initialDelay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106',
        messages: [
          {
            role: 'system',
            content: `You are a survey design expert. Create clear, relevant, and well-structured survey questions based on the given requirements.
            You must respond with a valid JSON object containing an array of questions under the "questions" key.
            Each question object must have these exact properties:
            {
              "type": string (one of: "text", "multipleChoice", "checkbox", "rating"),
              "text": string (the question text),
              "options": string[] (required for multipleChoice and checkbox types),
              "required": boolean,
              "validation": object (optional validation rules)
            }`,
          },
          {
            role: 'user',
            content: `Create a survey about: ${prompt.topic}
            Purpose: ${prompt.purpose}
            ${prompt.targetAudience ? `Target Audience: ${prompt.targetAudience}` : ''}
            ${prompt.additionalContext ? `Additional Context: ${prompt.additionalContext}` : ''}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: {type: 'json_object'},
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in response');
      }

      const parsedContent = JSON.parse(content);
      if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
        throw new Error('Invalid response format from AI');
      }

      return parsedContent.questions;
    } catch (error) {
      if (isRateLimitError(error)) {
        if (i === retries - 1) throw error; // If last retry, throw the error

        // Calculate delay with exponential backoff
        const waitTime = initialDelay * Math.pow(2, i);
        console.log(`Rate limit hit. Retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
      throw error; // If not a rate limit error, throw immediately
    }
  }
  throw new Error('Max retries reached');
}

export async function generateFormQuestions(prompt: FormGenerationPrompt) {
  try {
    return await makeRequestWithRetry(prompt);
  } catch (error) {
    console.error('Error generating form questions:', error);
    if (isRateLimitError(error)) {
      throw new Error('Rate limit reached. Please try again in a few moments.');
    }
    throw error;
  }
}
