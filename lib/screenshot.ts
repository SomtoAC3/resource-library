export async function captureScreenshot(url: string): Promise<string | null> {
  const apiKey = process.env.SCREENSHOT_API_KEY;
  const apiUrl = process.env.SCREENSHOT_API_URL ?? "https://api.screenshotone.com/take";

  if (!apiKey) return null;

  const params = new URLSearchParams({
    access_key: apiKey,
    url,
    viewport_width: "1280",
    viewport_height: "800",
    format: "webp",
    image_quality: "85",
    block_ads: "true",
    block_cookie_banners: "true",
    cache: "true",
    cache_ttl: "2592000", // 30 days
  });

  const screenshotUrl = `${apiUrl}?${params.toString()}`;

  // Verify the URL resolves (HEAD request)
  const res = await fetch(screenshotUrl, {
    method: "HEAD",
    signal: AbortSignal.timeout(15_000),
  });

  return res.ok ? screenshotUrl : null;
}
