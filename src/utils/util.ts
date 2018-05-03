import { Message, Guild, GuildStorage } from 'yamdbf';
import { Client, RichEmbed } from 'discord.js';
const config = require('../../config.json');

export function createEmbed(client: Client, color: string = '#00AE86'): RichEmbed {
	const embed = new RichEmbed();
	embed.setColor(color);
	if (client) {
		embed.setFooter(config.botName, client.user.avatarURL);
	} else {
		embed.setFooter(config.botName);
	}
	embed.setTimestamp();
	return embed;
}