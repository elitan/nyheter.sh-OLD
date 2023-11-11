# Nyheter.sh

Nyheter.sh is a fully automated online newspaper powered by AI.

I built Nyheter.sh because I wanted a project to try out all the new tools that has been available lately. Specifically I wanted to have a project where I could try to do :

- Audio to text
- Text to text
- Text to image
- Text to audio

## How it works

1. Download new news audio clips from Sveriges Radio using [svtplay-dl](https://github.com/spaam/svtplay-dl).
2. Transcribe the audio (audio to text) using [Whisper.cpp](https://github.com/ggerganov/whisper.cpp).
3. Evaluate if the news is related to Sweden or not (text-to-text) using [OpenAI ChatGPT 3.5](https://platform.openai.com/docs/guides/text-generation)
4. Evaluate if the news article has a newsvalue above 7 on a scale from 0-10. (text-to-text) using [OpenAI ChatGPT 3.5](https://platform.openai.com/docs/guides/text-generation)
5. Write a new unique news in English article based on the transcript (text-to-text) using [OpenAI ChatGPT 4](https://platform.openai.com/docs/guides/text-generation). The following is generated: Headline, body, category, image prompt, and social media hook.
6. Translate the english article to 10 other languages using [Google Translation API](https://cloud.google.com/translate).
7. Generate an image based on the image prompt (text-to-image) using [OpenAI DALL·E 3](https://platform.openai.com/docs/guides/images).
8. Generate audio based on the news article so it's possible to listen to the news article, using [OpenAI TTS](https://platform.openai.com/docs/guides/text-to-speech).

## Why is [Nyheter.sh](https://nyheter.sh/) down?

I've received legal threats from [Sveriges Radio](https://sverigesradio.se/), and since this is a hobby project of mine, I don't have the time or willingness to fight them. The website is down, but the code is available for anyone to understand how the website worked.

### What did Sveriges Radio say?

This is what they wrote:

> Sveriges Radio's attitude to the material published via SR's digital channels is that SR is the owner of the copyright that accrues to the material. SR provides the material for linking via open API. Linking to the material may take place in accordance with the conditions for SR's open API, which can be found here: https://sverigesradio.se/artikel/api-vyllor. One of these conditions is that the material may not be used for machine learning without SR's consent.
>
> As SR understood that the service works, not only machine learning is actualized, but also a direct use of SR's material by transcribing the material, which requires the permission of the copyright holder. The permission of the copyright holder is also required to process the material for the purpose of generating images. Using copyrighted material without the author's permission constitutes an infringement of the copyright holder's exclusive rights.
>
> Furthermore, as a public service company, Sveriges Radio protects its independence and credibility. By transcribing the content in the way that happens on nyheter.sh, questions also arise regarding the journalistic and legal responsibility. Sveriges Radio does not allow material to be stored, downloaded, copied or preserved by another actor because Sveriges Radio then loses actual control over the content. This means that the changes that may be made to the material for legal or journalistic reasons will not be reflected on other platforms. It risks damaging trust in both the journalistic content and Swedish Radio as a company. The starting point is that it is the responsible publisher at Sveriges Radio who must make decisions about all content. Therefore, Sveriges Radio always requires that the material provided via other platforms only takes place through linking/streaming in accordance with the terms of our open API.
>
> We therefore ask you to discontinue the service in its current form. At the same time, we thank you for the good dialogue so far regarding this issue.

Here's my take:

- I don't use their content to train any AI model. The model is already trained by OpenAI.
- Yes I transcribe the audio, but I don't store it. I delete it after I've transcribed it. So I don't understand how this is a copyright claim. OpenAI also has something called [Copyright Sheild](https://openai.com/blog/new-models-and-developer-products-announced-at-devday#:~:text=account%20settings.-,Copyright%20Shield,-OpenAI%20is%20committed). I've reached out to OpenAI asking for guidence. Still waiting for an answer.
- I don't publish any of their material.
