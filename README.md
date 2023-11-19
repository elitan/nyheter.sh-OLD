# Nyheter.sh

Nyheter.sh is a fully automated online newspaper powered by AI.

I built Nyheter.sh because I wanted a project to try out all the new tools that have been available lately. Specifically, I wanted to have a project where I could try to do :

- Audio to text
- Text to text
- Text to image
- Text to audio

## How it works

1. Download new news audio clips from Sveriges Radio using [svtplay-dl](https://github.com/spaam/svtplay-dl).
2. Transcribe the audio (audio to text) using [Whisper.cpp](https://github.com/ggerganov/whisper.cpp).
3. Evaluate if the news is related to Sweden or not (text-to-text) using [OpenAI ChatGPT 3.5](https://platform.openai.com/docs/guides/text-generation)
4. Evaluate if the news article has a news value above 7 on a scale from 0-10. (text-to-text) using [OpenAI ChatGPT 3.5](https://platform.openai.com/docs/guides/text-generation)
5. Write a new unique news in English article based on the transcript (text-to-text) using [OpenAI ChatGPT 4](https://platform.openai.com/docs/guides/text-generation). The following is generated: Headline, body, category, image prompt, and social media hook.
6. Translate the English article to 10 other languages using [Google Translation API](https://cloud.google.com/translate).
7. Generate an image based on the image prompt (text-to-image) using [OpenAI DALL·E 3](https://platform.openai.com/docs/guides/images).
8. Generate audio based on the news article so it's possible to listen to the news article using [OpenAI TTS](https://platform.openai.com/docs/guides/text-to-speech).

## Why is [Nyheter.sh](https://nyheter.sh/) down?

I've received legal threats from [Sveriges Radio](https://sverigesradio.se/). The website is down, but the code is available for anyone to understand how the website works.
