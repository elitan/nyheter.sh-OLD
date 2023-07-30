import { db } from "./utils/db";
import "dotenv/config";
import { openai } from "./utils/openai";
import slugify from "slugify";

/**
 * Removes the last sentence from a string.
 */
function removeLastSentence(str: string) {
  let sentences = str.match(/[^.!?]+[.!?]*/g); // matches sentences ending with ., ! or ?
  if (sentences) {
    sentences.pop(); // removes the last sentence
    return sentences.join("");
  }
  return str;
}

const GPT_PROMPT = `Du är en journalist som skriver oberoende nyhetsartikelar. Nyhetsartiklarna du skriver följer journalistisk standard och är informativ och engagerande för läsaren.`;

(async () => {
  const articlesToRefine = await db
    .selectFrom("articles")
    .select(["id", "transcribedText"])
    .where("transcribedText", "is not", null)
    .where("body", "is", null)
    .execute();

  for (const article of articlesToRefine) {
    console.log("article: ", article);

    // body
    const bodyContent = `INFORMATION: ${removeLastSentence(
      article.transcribedText!
    )} SLUT PÅ INFORMATION. Skriv en kort, informativ och enkel nyhetsartikel utan rubrik och utan att nämna ditt namn.`;

    const openAiBodyResponse = await openai.createChatCompletion({
      messages: [
        {
          role: "system",
          content: GPT_PROMPT,
        },
        {
          role: "user",
          content: bodyContent,
        },
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      max_tokens: 1200,
    });

    const body = openAiBodyResponse.data.choices[0].message?.content;
    console.log("body: ", body);

    // title
    const titleContent = `Skriv mycker kort rubrik på max 8 ord för följande nyetsartikel:

    ${body}`;

    const openAiTitleResponse = await openai.createChatCompletion({
      messages: [
        {
          role: "system",
          content: GPT_PROMPT,
        },
        {
          role: "user",
          content: titleContent,
        },
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      max_tokens: 1200,
    });

    let title = openAiTitleResponse.data.choices[0].message?.content as string;

    // remove optional quotes in the beginnning and end of the title
    title = title?.replace(/^"/, "");
    title = title?.replace(/"$/, "");

    const slug = slugify(title, {
      lower: true,
    });

    await db
      .updateTable("articles")
      .set({
        title,
        slug,
        body,
      })
      .where("id", "=", article.id)
      .execute();
  }
})();
