import axios from "axios";
import * as cheerio from "cheerio";
import * as child_process from "child_process";
import { db } from "./utils/db";
import "dotenv/config";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const url = "https://sverigesradio.se/ekot/textarkiv"; // Replace this with the URL you want to fetch
const baseUrl = "https://sverigesradio.se";

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function runCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
        reject();
      }
      console.log(stdout);
      resolve(stdout ? stdout : stderr);
    });
  });
}

(async () => {
  console.log({ url });
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

    try {
      let res = "";
      res = await runCommand(
        `svtplay-dl ${sverigesRadioLink} --force -o /tmp/whisper/raw`
      );
      console.log(res);

      res = await runCommand(
        "ffmpeg -y -i /tmp/whisper/raw.mp4 -ar 16000 /tmp/whisper/converted.wav"
      );
      console.log(res);

      res = await runCommand(
        "whisper -m ../models/ggml-large.bin -l sv -nt -f /tmp/whisper/converted.wav --output-txt --output-file output"
      );
      console.log(res);
    } catch (error) {
      console.error(`Failed to execute script: ${error}`);
      process.exit(1);
    }

    const transcribedText = await runCommand("cat output.txt");
    console.log(text);

    await db
      .insertInto("articles")
      .values({
        sverigesRadioTitle,
        sverigesRadioLink,
        transcribedText,
      })
      .execute();

    // get body and title from open ai
  }
})();
