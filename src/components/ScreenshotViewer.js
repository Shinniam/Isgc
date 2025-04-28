import { useState } from 'react';

export default function ScreenshotViewer() {
  const [url, setUrl] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setImage(data.image);
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div sthttps://godfield.net/yle={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Screenshot Generator</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL (e.g., https://example.com)"
          style={{ width: '70%', padding: '10px', marginRight: '10px' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Generating...' : 'Generate Screenshot'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      {image && (
        <div style={{ marginTop: '20px' }}>
          <h3>Preview</h3>
          <img src={image} alt="Screenshot" style={{ maxWidth: '100%', border: '1px solid #ddd' }} />
        </div>
      )}
    </div>
  );
}
