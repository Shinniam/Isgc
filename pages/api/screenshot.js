import puppeteer from 'puppeteer';
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

// Redisクライアント（キャッシング用）
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// レート制限（1ユーザーにつき1分に10リクエスト）
const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 10,
  duration: 60,
  keyPrefix: 'rl-screenshot',
});

export default async function handler(req, res) {
  // メソッドチェック
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  // URLバリデーション
  if (!url || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }

  try {
    // レート制限チェック
    await rateLimiter.consume(req.ip);

    // キャッシュチェック
    const cacheKey = `screenshot:${url}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({ image: cached });
    }

    // Puppeteerでブラウザ起動
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // 本番環境用
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // ページ読み込み（タイムアウト30秒）
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // スクリーンショット生成
    const screenshot = await page.screenshot({ encoding: 'base64', type: 'png' });
    await browser.close();

    // キャッシュ保存（1時間）
    await redis.set(cacheKey, screenshot, 'EX', 3600);

    // レスポンス
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src data: https:;");
    res.status(200).json({ image: `data:image/png;base64,${screenshot}` });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to generate screenshot' });
  }
}
