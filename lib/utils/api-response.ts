type ApiData = Record<string, unknown> | Array<unknown> | null

export function successResponse(data: ApiData, message = 'Success') {
  return Response.json({
    success: true,
    message,
    data,
  })
}

export function errorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      message,
    }),
    { status }
  )
} 