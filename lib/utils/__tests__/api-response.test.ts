import { successResponse, errorResponse } from '../api-response'

// Mock Response for Node.js environment
interface MockResponseInit extends ResponseInit {
  status?: number
}

interface MockBody {
  [key: string]: unknown
}

global.Response = class Response {
  status: number
  private body: string | undefined

  constructor(body?: string, init?: MockResponseInit) {
    this.body = body
    this.status = init?.status || 200
  }

  async json(): Promise<MockBody> {
    return JSON.parse(this.body || '{}')
  }
} as unknown as typeof Response

describe('API Response Utilities', () => {
  describe('successResponse', () => {
    it('returns a successful response with data', async () => {
      const data = { id: 1, name: 'Test' }
      const response = successResponse(data)
      const json = await response.json()

      expect(json).toEqual({
        success: true,
        message: 'Success',
        data,
      })
    })

    it('returns a successful response with custom message', async () => {
      const data = { id: 1 }
      const message = 'Custom success message'
      const response = successResponse(data, message)
      const json = await response.json()

      expect(json).toEqual({
        success: true,
        message,
        data,
      })
    })
  })

  describe('errorResponse', () => {
    it('returns an error response with default status code', async () => {
      const message = 'Error message'
      const response = errorResponse(message)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json).toEqual({
        success: false,
        message,
      })
    })

    it('returns an error response with custom status code', async () => {
      const message = 'Not Found'
      const status = 404
      const response = errorResponse(message, status)
      const json = await response.json()

      expect(response.status).toBe(status)
      expect(json).toEqual({
        success: false,
        message,
      })
    })
  })
}) 