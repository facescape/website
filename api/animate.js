module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const FAL_KEY = process.env.FAL_API_KEY;
  if (!FAL_KEY) {
    return res.status(500).json({ error: 'Clé API non configurée' });
  }

  try {
    const { image_url } = req.body;
    if (!image_url) {
      return res.status(400).json({ error: 'image_url manquant' });
    }

    const submitRes = await fetch('https://queue.fal.run/fal-ai/kling-video/v2.6/pro/image-to-video', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url,
        prompt: 'Dynamic cinematic camera movement, slow dramatic dolly-in with slight orbit around subject, subject has visible breathing and subtle body movement, hair and clothing move gently in wind, dramatic volumetric god rays, epic atmospheric particles floating in air, intense emotional expression, powerful cinematic color grade, IMAX film quality, highly detailed motion',
        negative_prompt: 'static, frozen, no movement, blur, distortion, watermark, text, bad quality, jitter, flickering, morphing face, deformed',
        duration: '5',
        aspect_ratio: '9:16',
        cfg_scale: 0.5
      })
    });

    const submitData = await submitRes.json();
    console.log('Submit response:', JSON.stringify(submitData));

    if (!submitRes.ok) {
      return res.status(submitRes.status).json({ error: submitData.detail || submitData.message || 'Erreur soumission' });
    }

    // Retourner request_id ET response_url directement fournis par fal.ai
    return res.status(200).json({
      request_id: submitData.request_id,
      status_url: submitData.status_url,
      response_url: submitData.response_url,
      status: 'IN_QUEUE'
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
