export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return Response.json({ error: 'Missing env vars', url: !!url, key: !!key })
  }

  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key, 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    return Response.json({ status: res.status, supabase: data, urlPrefix: url.slice(0, 30) })
  } catch (e) {
    return Response.json({ fetchError: (e as Error).message, urlPrefix: url.slice(0, 30) })
  }
}
