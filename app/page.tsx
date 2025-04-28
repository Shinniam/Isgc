"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Head from "next/head";

type ResultItem = {
  title: string;
  url: string;
  thumbnail?: string;
  favicon?: string;
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver>();
  const page = useRef(1);

  // キャッシュ（メモリキャッシュ）
  const cache = useRef<Map<string, ResultItem[]>>(new Map());

  const fetchResults = useCallback(async (searchQuery: string, pageNum: number) => {
    const cacheKey = `${searchQuery}_${pageNum}`;
    if (cache.current.has(cacheKey)) {
      setResults((prev) => [...prev, ...cache.current.get(cacheKey)!]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}`);
      if (!res.ok) throw new Error("検索に失敗しました");
      const data = await res.json();

      const enriched = data.results.map((item: any) => ({
        title: item.title || "タイトルなし",
        url: item.url,
        thumbnail: item.thumbnail || `https://api.screenshotmachine.com/?key=${process.env.NEXT_PUBLIC_SCREENSHOT_MACHINE_API_KEY}&url=${item.url}&dimension=1024x768`,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}`,
      }));

      cache.current.set(cacheKey, enriched);
      setResults((prev) => [...prev, ...enriched]);
      if (enriched.length === 0) setHasMore(false);
    } catch (error) {
      console.error(error);
      setError("結果の取得に失敗しました。もう一度お試しください。");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    page.current = 1;
    setResults([]);
    setHasMore(true);
    setError(null);
    fetchResults(query, 1);
  };

  const lastResultRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          page.current += 1;
          fetchResults(query, page.current);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, query, fetchResults]
  );

  return (
    <>
      <Head>
        <title>爆速検索エンジン</title>
        <meta name="description" content="世界最速クラスのインスタント検索エンジン" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <main className="flex flex-col items-center px-4 py-8 min-h-screen bg-white dark:bg-gray-900">
        <form onSubmit={handleSearch} className="flex gap-2 mb-8 w-full max-w-xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="検索ワードを入力..."
            className="flex-grow p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            aria-label="検索ワード"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-black text-white rounded-lg dark:bg-white dark:text-black"
            disabled={loading}
          >
            検索
          </button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="w-full max-w-3xl space-y-6">
          {results.map((item, index) => {
            if (results.length === index + 1) {
              return (
                <div ref={lastResultRef} key={item.url}>
                  <ResultCard item={item} />
                </div>
              );
            } else {
              return <ResultCard key={item.url} item={item} />;
            }
          })}
          {loading && (
            <div className="text-center py-6">
              <p>読み込み中...</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function ResultCard({ item }: { item: ResultItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
    >
      {item.thumbnail && (
        <div className="relative w-24 h-24 shrink-0">
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            sizes="96px"
            className="rounded-lg object-cover"
            loading="lazy"
            onError={(e) => (e.currentTarget.src = "/fallback-image.png")} // フォールバック画像
          />
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {item.favicon && (
            <Image
              src={item.favicon}
              alt="favicon"
              width={20}
              height={20}
              className="rounded"
              onError={(e) => (e.currentTarget.src = "/favicon-fallback.png")} // フォールバック
            />
          )}
          <p className="text-blue-600 text-sm truncate">{item.url}</p>
        </div>
        <h2 className="font-semibold text-lg">{item.title}</h2>
      </div>
    </a>
  );
}
