import axios from "axios";
import * as cheerio from "cheerio";
import { db, pool } from "./utils/db";
import "dotenv/config";

const url = "https://sverigesradio.se/ekot/textarkiv"; // Replace this with the URL you want to fetch
const baseUrl = "https://sverigesradio.se";

(async () => {
  const response = await axios.get(url);

  const $ = cheerio.load(response.data);
  const elements = $(".heading.heading-link.h4 a");

  for (const element of elements) {
    const link = $(element).attr("href");
    const text = $(element).text();

    console.log(`Link: ${link}`);
    console.log(`Text: ${text}`);
    console.log(``);

    const sverigesRadioTitle = text;
    const sverigesRadioLink = `${baseUrl}${link}`;

    const articles = await db
      .selectFrom("articles")
      .select(["id"])
      .where("sverigesRadioLink", "=", sverigesRadioLink)
      .execute();

    if (articles.length > 0) {
      console.log("Already exists");
      continue;
    }

    await db
      .insertInto("articles")
      .values({
        sverigesRadioTitle,
        sverigesRadioLink,
      })
      .execute();
  }

  console.log("Done");

  pool.end();
})();
