import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000'

/**
 * Universal API proxy - forwards requests to the backend with cookies.
 * Usage: /api/proxy?path=/pedidos
 * 
 * This avoids CORS issues by keeping all browser requests same-origin,
 * while the server-side proxy forwards cookies to the backend.
 */
async function proxyRequest(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
  }

  try {
    // Forward cookies from the browser request to the backend
    const cookieHeader = request.headers.get('cookie') || ''

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    }

    const config: RequestInit = {
      method: request.method,
      headers,
    }

    // Forward body for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const body = await request.text()
        if (body) {
          config.body = body
        }
      } catch {
        // No body - that's fine
      }
    }

    const backendRes = await fetch(`${BACKEND_URL}${path}`, config)

    // Handle 204 No Content
    if (backendRes.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await backendRes.text()

    const response = new NextResponse(data, {
      status: backendRes.status,
      headers: {
        'Content-Type': backendRes.headers.get('Content-Type') || 'application/json',
      },
    })

    // Forward any Set-Cookie headers from backend to browser
    const setCookies = backendRes.headers.getSetCookie()
    if (setCookies) {
      for (const cookie of setCookies) {
        response.headers.append('Set-Cookie', cookie)
      }
    }

    return response
  } catch (error) {
    console.error('[Proxy] Error forwarding request:', error)
    return NextResponse.json(
      { message: 'Error de conexion con el servidor' },
      { status: 502 }
    )
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request)
}

export async function POST(request: NextRequest) {
  return proxyRequest(request)
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request)
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request)
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request)
}
