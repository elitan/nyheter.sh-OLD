import axios from 'axios';
import * as cheerio from 'cheerio';
import { db, pool } from './utils/db';
import 'dotenv/config';
import { format, parseISO } from 'date-fns';

const url = 'https://sverigesradio.se/ekot/textarkiv'; // Replace this with the URL you want to fetch
const baseUrl = 'https://sverigesradio.se';

const ALLOWED_TAGS = [
  'inrikes',
  'svensk politik',
  'Nationell säkerhet',
  'väder',
  'IT & internet',
];

(async () => {
  const response = await axios.get(url);

  let $ = cheerio.load(response.data);
  const elements = $('.heading.heading-link.h4 a');

  for (const element of elements) {
    const link = $(element).attr('href');
    const text = $(element).text();

    console.log(``);
    console.log(`Link: ${link}`);
    console.log(`Text: ${text}`);

    const sverigesRadioTitle = text;
    const sverigesRadioLink = `${baseUrl}${link}`;

    if (sverigesRadioTitle === 'Ekot på en minut') {
      console.log('Ekot på en minut, skipping');
      continue;
    }

    const sverigesRadioLinkResponse = await axios.get(sverigesRadioLink);
    let articleContent = cheerio.load(sverigesRadioLinkResponse.data);

    let tags: string[] = []; // an array to store the tags

    // select all 'a' elements in li elements that have the class 'keyword-list__item'
    articleContent('li.keyword-list__item a').each((i, link) => {
      tags.push($(link).text()); // get the text of the link and push it to the tags array
    });

    const articleHasAllowedTag = tags.some((tag) =>
      ALLOWED_TAGS.includes(tag.toLocaleLowerCase()),
    );

    if (!articleHasAllowedTag) {
      console.log('No allowed tag found, skipping');
      continue;
    }

    // check for duplicates
    const articles = await db
      .selectFrom('articles')
      .select(['id'])
      .where('sverigesRadioLink', '=', sverigesRadioLink)
      .execute();

    // get actual article and publication date
    const articleResponse = await axios.get(sverigesRadioLink);
    $ = cheerio.load(articleResponse.data);
    let timeElement = $(
      'div.publication-metadata time.publication-metadata__item',
    );

    let date = parseISO(timeElement.attr('datetime') as string);

    // Format the Date object as a string
    let formattedDateStr = format(date, 'yyyy-MM-dd HH:mm:ss') + '+2';

    console.log(`Date: ${formattedDateStr}`);

    if (articles.length > 0) {
      console.log('Already exists');
      continue;
    }

    await db
      .insertInto('articles')
      .values({
        sverigesRadioTitle,
        sverigesRadioLink,
        createdAt: formattedDateStr,
      })
      .execute();
  }

  console.log('Done');

  pool.end();
  process.exit(0);
})();
