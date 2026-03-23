module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const FAL_KEY = process.env.FAL_API_KEY;
  if (!FAL_KEY) {
    return res.status(500).json({ error: 'Clé API non configurée' });
  }

  // Utiliser status_url fourni par fal.ai directement
  const { status_url, response_url } = req.query;
  if (!status_url || !response_url) {
    return res.status(400).json({ error: 'status_url ou response_url manquant' });
  }

  try {
    // Vérifier le statut via l'URL exacte fournie par fal.ai
    const statusRes = await fetch(decodeURIComponent(status_url), {
      headers: { 'Authorization': `Key ${FAL_KEY}` }
    });
    const statusData = await statusRes.json();
    console.log('Status:', JSON.stringify(statusData));

    if (statusData.status !== 'COMPLETED') {
      return res.status(200).json({ status: statusData.status || 'IN_PROGRESS' });
    }

    // COMPLETED → récupérer le résultat via response_url
    const resultRes = await fetch(decodeURIComponent(response_url), {
      headers: { 'Authorization': `Key ${FAL_KEY}` }
    });
    const resultData = await resultRes.json();
    console.log('Result:', JSON.stringify(resultData));

    const videoUrl = resultData?.video?.url || null;
    console.log('videoUrl:', videoUrl);

    return res.status(200).json({
      status: 'COMPLETED',
      video_url: videoUrl,
      raw: resultData
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
