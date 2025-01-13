export type ApiData = Record<string, unknown>

export function successResponse(data: ApiData, message = 'Success') {
  return new Response(
    JSON.stringify({
      success: true,
      message,
      data,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

export function errorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      message,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
} 