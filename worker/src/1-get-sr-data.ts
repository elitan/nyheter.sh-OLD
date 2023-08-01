import axios from "axios";
import * as cheerio from "cheerio";
import { db, pool } from "./utils/db";
import "dotenv/config";
import { utcToZonedTime } from "date-fns-tz";
import { sql } from "kysely";

const url = "https://sverigesradio.se/ekot/textarkiv"; // Replace this with the URL you want to fetch
const baseUrl = "https://sverigesradio.se";

(async () => {
  const response = await axios.get(url);

  let $ = cheerio.load(response.data);
  const elements = $(".heading.heading-link.h4 a");

  for (const element of elements) {
    const link = $(element).attr("href");
    const text = $(element).text();

    console.log(``);
    console.log(`Link: ${link}`);
    console.log(`Text: ${text}`);

    const sverigesRadioTitle = text;
    const sverigesRadioLink = `${baseUrl}${link}`;

    if (sverigesRadioTitle === "Ekot på en minut") {
      console.log("Ekot på en minut, skipping");
      continue;
    }

    // check for duplicates
    const articles = await db
      .selectFrom("articles")
      .select(["id"])
      .where("sverigesRadioLink", "=", sverigesRadioLink)
      .execute();

    // get actual article and publication date
    const articleResponse = await axios.get(sverigesRadioLink);
    $ = cheerio.load(articleResponse.data);
    let timeElement = $(
      "div.publication-metadata time.publication-metadata__item"
    );

    let datetimeAttr = timeElement.attr("datetime") as string;

    const date = new Date(datetimeAttr);
    console.log({ date });

    const a = db.insertInto("articles").values({
      sverigesRadioTitle,
      sverigesRadioLink,
      createdAt: date,
    });

    console.log(a.compile());

    if (articles.length > 0) {
      console.log("Already exists");
      continue;
    }

    await a.execute();

    // await db
    //   .insertInto("articles")
    //   .values({
    //     sverigesRadioTitle,
    //     sverigesRadioLink,
    //     createdAt: sql`(TIMESTAMP ${datetimeAttr} AT TIME ZONE 'Europe/Stockholm')`,
    //   })
    //   .execute();
  }

  console.log("Done");

  pool.end();
})();
