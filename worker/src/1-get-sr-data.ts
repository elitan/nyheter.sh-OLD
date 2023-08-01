import axios from "axios";
import * as cheerio from "cheerio";
import { db, pool } from "./utils/db";
import "dotenv/config";
import { utcToZonedTime } from "date-fns-tz";

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
    datetimeAttr = datetimeAttr.replace("Z", "");
    console.log({ datetimeAttr });
    const utcDate = new Date(datetimeAttr);
    console.log({ utcDate });
    const localSwedishDatetime = utcToZonedTime(
      datetimeAttr,
      "Europe/Stockholm"
    );

    console.log({ localSwedishDatetime });

    if (articles.length > 0) {
      console.log("Already exists");
      continue;
    }

    await db
      .insertInto("articles")
      .values({
        sverigesRadioTitle,
        sverigesRadioLink,
        createdAt: localSwedishDatetime,
      })
      .execute();
  }

  console.log("Done");

  pool.end();
})();
