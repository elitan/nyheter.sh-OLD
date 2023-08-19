import 'dotenv/config';

(async () => {
  const imagePrompt =
    'funny cartoon on a mountain with a glowing sun in the background';

  const url = process.env.STABLE_DIFFUSION_TEXT2IMG_ENDPOINT as string;
  const headers = {
    accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const suBody = JSON.stringify({
    prompt: imagePrompt,
    negative_prompt: 'BadDream, UnrealisticDream',
    steps: 65,
    cfg_scale: 8,
    sampler_index: 'Euler a',
    restore_faces: true,
    width: 1200,
    height: 800,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: suBody,
  });

  const data = await response.json();

  console.log('data from SU:');
  console.log(data);

  // base64 encoded image data
  const imageData = `${data.images[0]}`;

  console.log(imageData);
})();
