import { sendDiscordMessage } from './utils/discord';
import { textIsRelatedToSweden } from './utils/openai';

(async () => {
  // await sendDiscordMessage('test 123');

  // console.log('done');

  const text = ` Nästan 40 000 scouter från hela världen har evakuerats från ett scoutläger i Sydkorea efter tyfånvarning.
 2000 svenska scouter har åkt till lägret.
 En av dem är Axel Christensen som reser med Dalby Scout Corps och befinner sig på en evakueringsbuss.
 Man vill ju vara kvar på lägret. Det känns lite sorgligt. Det känns som att man lämnar någonting som inte är slutat.
 Erik Selen är projektledare för det svenska deltagandet på det internationella scoutlägret och säger att 20 av 42 svenska avdelningar nu evakuerats med bussar.
 Under 14 timmar så ska det gå en buss var 30 sekund från lägreområdet.
 Så det är ju en enorm logistisk utmaning. Men den flyter på förvånansvärt väl.
 Det är ju en försiktighetsåtgärd som lägreorganisationen vidtar för att trygga boendet.
 För Axel Christensen betyder det mycket att få åka på scoutläger.
 Möta andra kulturer, se olika saker. Att få träffa nya människor. Att byta marken och sånt kul. Det betyder liksom scouting.
 Emilia Berggrens-Sölin, Ekot.
`;

  const related = await textIsRelatedToSweden(text);

  console.log({ related });
})();
