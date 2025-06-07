export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  return Response.json({
    hasKey: !!apiKey,
    keyStart: apiKey?.substring(0, 12),
    keyLength: apiKey?.length,
    envKeys: Object.keys(process.env).filter((k) => k.includes("OPENROUTER")),
    nodeEnv: process.env.NODE_ENV,
  });
}
