import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }

  try {
    const apiKey = process.env.SCREENSHOT_MACHINE_API_KEY;
    const screenshotUrl = `https://api.screenshotmachine.com/?key=${apiKey}&url=${encodeURIComponent(url)}&dim=1280x720&format=png`;

    const response = await axios.get(screenshotUrl, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(response.data).toString('base64');

    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src data: https:;");
    res.status(200).json({ image: `data:image/png;base64,${base64Image}` });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to generate screenshot' });
  }
}
