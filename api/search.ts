import type { NextApiRequest, NextApiResponse } from "next";

type ResultItem = {
  title: string;
  url: string;
  thumbnail?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q, page = "1" } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "検索クエリが必要です" });
  }

  try {
    // ダミーデータ（本番では外部APIを呼び出す）
    const results: ResultItem[] = [
      {
        title: `サンプル結果 for ${q} - ページ${page}`,
        url: `https://example.com/?q=${q}&page=${page}`,
        thumbnail: `https://api.screenshotmachine.com/?key=${process.env.SCREENSHOT_MACHINE_API_KEY}&url=https://example.com&dimension=1024x768`,
      },
      {
        title: `もう一つの結果 for ${q}`,
        url: `https://example.org/?q=${q}`,
      },
    ];

    // 本番用の外部API呼び出し例（コメントアウト）
    /*
    const response = await fetch(`https://external-search-api.com?q=${encodeURIComponent(q)}&page=${page}`);
    const data = await response.json();
    const results = data.results.map((item: any) => ({
      title: item.title,
      url: item.url,
      thumbnail: item.thumbnail,
    }));
    */

    res.status(200).json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "検索に失敗しました" });
  }
}
