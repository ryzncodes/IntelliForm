import {generateFormQuestions} from '@/lib/openai/form-generator';
import {successResponse, errorResponse} from '@/lib/utils/api-response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {topic, purpose, targetAudience, additionalContext} = body;

    // Validate required fields
    if (!topic || !purpose) {
      return errorResponse('Topic and purpose are required', 400);
    }

    // Generate form questions using OpenAI
    const questions = await generateFormQuestions({
      topic,
      purpose,
      targetAudience,
      additionalContext,
    });

    return successResponse({questions}, 'Form questions generated successfully');
  } catch (error) {
    console.error('Error in generate-form route:', error);
    return errorResponse('Failed to generate form questions', 500);
  }
}
