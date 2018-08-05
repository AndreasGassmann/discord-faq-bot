import { Client, Providers } from '@yamdbf/core';
import { MessageQueue } from './utils/MessageQueue';
import { createEmbed, sendEmbed, greetOwner, respondToInitialDM, to, printError, sendMessage } from './utils/util';
import { IFAQ } from './iFAQ';
import { TextChannel } from 'discord.js';

const { SQLiteProvider } = Providers;

let config = require('../config.json');

const path = require('path');

let messageQueue: MessageQueue = null;

process.on('unhandledRejection', (reason: any, p: any) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const client = new Client({
	commandsDir: path.join(__dirname, 'commands'),
	token: config.discordToken,
	owner: config.owner,
	pause: true,
	ratelimit: '2/5s',
	disableBase: ['setlang', 'blacklist', 'eval', 'eval:ts', 'limit', 'reload', 'ping', 'help', 'groups', 'shortcuts'],
	plugins: [
	],
	provider: SQLiteProvider('sqlite://./storage/db.sqlite')
}).start();

client.on('pause', async () => {
	await client.setDefaultSetting('prefix', '?');
	await client.setDefaultSetting('auto-response', false);
	client.emit('continue');
});

let setActivity = () => {
	printError(client.user.setActivity(`?faq - ${client.guilds.size} servers!`));
};

setInterval(() => {
	setActivity();
}, 30000);

client.once('clientReady', async () => {
	const startMessage = `Client ready! Serving ${client.guilds.size} guilds.`;
	console.log(startMessage);
	messageQueue = new MessageQueue(client);
	messageQueue.addMessage(startMessage);
	setActivity();
});

client.on('message', async message => {
	// Skip if this is a bot or empty message
	if (message.author.bot || !message.content.length) {
		return;
	}

	// Skip if this is a valid bot command
	// (technically we ignore all prefixes, but bot only responds to default one)
	const cmd = message.content.split(' ')[0].toLowerCase();
	if (client.commands.get(cmd) || client.commands.get(cmd.substring(1))) {
		return;
	}

	// Scan message for keywords
	const storage = client.storage.guilds.get(message.guild.id);
	const autoResponseEnabled = storage.settings.get('auto-response');
	if (autoResponseEnabled) {
		console.log('Scanning message', message.content);

		let faqs = await storage.get('faq');

		if (faqs) {
			Object.keys(faqs).forEach((value) => {
				let faq: IFAQ = faqs[value];
				if (!faq.enableAutoAnswer) return;
				if (faq.trigger.length === 0) return;
				let matchesTrigger = faq.trigger.every(trigger => {
					if (trigger.length === 0) return;
					return message.content.includes(trigger);
				})
				if (matchesTrigger) {
					printError(sendMessage(message.channel, `<@${message.author.id}>, we found an FAQ that might answer your question. We sent it to you via DM.`, null, message.author));
					const embed = createEmbed(client);

					embed.setTitle(faq.question ? faq.question : faq.key);
					embed.setDescription(faq.answer);

					printError(sendEmbed(message.author, embed));

					if (config.autoResponseChannel) {
						let channel = <TextChannel>client.channels.get(config.autoResponseChannel);
						if (channel) {
							let response = `\`\`\`Triggered in guild ${message.guild.name} by ${message.author.username}\`\`\`\n${message.content}`;
							channel.send(response, { embed }).then(() => { }).catch(console.error);
						}
					}
				}
			});
		}
	}

	printError(respondToInitialDM(client, message));
});

client.on('guildCreate', async guild => {
	console.log('EVENT(guildCreate):', guild.id, guild.name, guild.memberCount);

	greetOwner(guild);

	const embed = createEmbed(client, '#33cc33');
	embed.setAuthor(`Guild added`, guild.iconURL());
	embed.setDescription(`**${guild.name}** started using the bot!\n**${guild.memberCount}** members.`);
	messageQueue.sendEmbed(embed);
});

client.on('guildDelete', async guild => {
	console.log('EVENT(guildDelete):', guild.id, guild.name, guild.memberCount);
	const embed = createEmbed(client, '#cc0000');
	embed.setAuthor(`Guild removed`, guild.iconURL());
	embed.setDescription(`**${guild.name}** stopped using the bot!\n**${guild.memberCount}** members.`);
	messageQueue.sendEmbed(embed);
});

client.on('reconnecting', async () => {
	console.log('EVENT(reconnecting)');
});

client.on('disconnect', async event => {
	console.log('EVENT(disconnect)', event);
});

client.on('resume', async (replayed: any) => {
	console.log('EVENT(resume):', replayed);
});

client.on('guildUnavailable', async guild => {
	console.log('EVENT(guildUnavailable):', guild.id, guild.name, guild.memberCount);
});

client.on('warn', async info => {
	console.log('DISCORD WARNING:', info);
	try {
		messageQueue.addMessage(`EVENT(warn):${JSON.stringify(info)}`);
	} catch (e) {
		console.log('DISCORD WARNING:', e);
	}
});

client.on('error', async error => {
	console.log('DISCORD ERROR:', error);
	try {
		messageQueue.addMessage(`EVENT(error):${JSON.stringify(error)}`);
	} catch (e) {
		console.log('DISCORD ERROR:', e);
	}
});
