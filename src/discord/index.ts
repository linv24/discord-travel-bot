import { Client, Events, GatewayIntentBits } from 'discord.js';
import 'dotenv/config'; 

const client = new Client({ intents: [GatewayIntentBits.Guilds] }); 

// When the lcient is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN)