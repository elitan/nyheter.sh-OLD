import { db } from "./utils/db";
import "dotenv/config";
import { openai } from "./utils/openai";
import slugify from "slugify";

const GPT_PROMPT = `Du är en journalist som skriver oberoende nyhetsartikel baserat på transiberade ljudinspelningar. Nyhetsartiklarna du skriver följer journalistisk standard och är informativ och engagerande för läsaren.  Nyhetsartiklen ska vara helt oberoende. Du kommer att rapportera om de senaste nyheterna, skriva reportage och åsiktsartiklar, utveckla forskningstekniker för att verifiera information och avslöja källor, följa journalistisk etik och leverera korrekt rapportering med din egen distinkta stil. Skriv inget om vem som spelat in ljudinspelningen. Skriv inget om SR, P4 eller Ekot.`;

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
    const bodyContent = `Skriv en nyhetsartikel som inte innehåller någon rubrik.

transkiberad ljudfil:

${article.transcribedText}`;

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
      model: "gpt-4",
      temperature: 0.5,
      max_tokens: 1200,
    });

    const body = openAiBodyResponse.data.choices[0].message?.content;
    console.log("body: ", body);

    // title
    const titleContent = `Skriv en titel för följande nyhetsartikel:

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
      model: "gpt-4",
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
