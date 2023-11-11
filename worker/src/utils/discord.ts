import { WebhookClient } from 'discord.js';
import 'dotenv/config';

const webhookId = process.env.DISCORD_WEBHOOK_ID as string;
const webhookToken = process.env.DISCORD_WEBHOOK_TOKEN as string;

export const discordWebhookClient = new WebhookClient({
  id: webhookId,
  token: webhookToken,
});

export async function sendDiscordMessage(message: string) {
  return discordWebhookClient.send({
    content: message,
    username: 'anna',
  });
}
