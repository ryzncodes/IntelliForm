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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a survey design expert. Create clear, relevant, and well-structured survey questions based on the given requirements.
            You must respond with a valid JSON object containing an array of questions under the "questions" key.
            Each question object must have these exact properties:
            {
              "type": string (must be one of the following exact values):
                - "short_text": for single-line text input (names, titles, brief answers)
                - "long_text": for multi-line text input (detailed responses, feedback)
                - "single_choice": for selecting ONE option from a list (radio buttons)
                - "multiple_choice": for selecting MULTIPLE options (checkboxes)
                - "rating": for 5-star rating questions
                - "scale": for numeric scale questions (with min/max values)
              "text": string (the question text),
              "options": string[] (REQUIRED for single_choice and multiple_choice types only),
              "required": boolean,
              "validation": object (format: { min?: number, max?: number })
            }
            
            Strict rules for question types:
            1. "short_text": Use for brief answers that fit on one line
               Example: "What is your name?"
               
            2. "long_text": Use for detailed responses needing multiple lines
               Example: "Please describe your experience in detail."
               
            3. "single_choice": MUST include "options" array, user can select ONE
               Example: "How often do you exercise?"
               options: ["Daily", "Weekly", "Monthly", "Never"]
               
            4. "multiple_choice": MUST include "options" array, user can select MANY
               Example: "Which features do you use? (Select all that apply)"
               options: ["Feature A", "Feature B", "Feature C"]
               
            5. "rating": Always uses 5-star scale, no validation needed
               Example: "How would you rate our service?"
               
            6. "scale": MUST include validation with min and max values
               Example: "On a scale of 1-10, how likely are you to recommend us?"
               validation: { "min": 1, "max": 10 }

            Response Format Example:
            {
              "questions": [
                {
                  "type": "short_text",
                  "text": "What is your name?",
                  "required": true
                },
                {
                  "type": "multiple_choice",
                  "text": "Which products do you use? (Select all that apply)",
                  "options": ["Product A", "Product B", "Product C"],
                  "required": true
                },
                {
                  "type": "scale",
                  "text": "How likely are you to recommend us?",
                  "required": true,
                  "validation": { "min": 1, "max": 10 }
                }
              ]
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
