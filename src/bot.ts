import { Client, Providers } from 'yamdbf';
const { SQLiteProvider } = Providers;
import { MessageQueue } from './utils/MessageQueue';
import { createEmbed } from './utils/util';

const config = require('../config.json');
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
	disableBase: ['setlang', 'blacklist', 'eval', 'eval:ts', 'limit', 'reload', 'ping', 'help'],
	plugins: [
	],
	provider: SQLiteProvider('sqlite://./storage/db.sqlite')
}).start();

client.on('pause', async () => {
	await client.setDefaultSetting('prefix', '!faq');
	client.emit('continue');
});

let setActivity = () => {
	let user: any = client.user;
	user.setPresence({ game: { name: `prefix !faq - ${client.guilds.size} servers!`, type: 0 } });
};

setInterval(() => {
	setActivity();
}, 30000);

client.once('clientReady', async () => {
	messageQueue = new MessageQueue(client);
	messageQueue.addMessage('clientReady executed');
	console.log(`Client ready! Serving ${client.guilds.size} guilds.`);
	setActivity();
});

client.on('guildCreate', async guild => {
	console.log('EVENT(guildCreate):', guild.id, guild.name, guild.memberCount);
	const embed = createEmbed(client, '#33cc33');
	embed.setAuthor(`Guild added`, guild.iconURL);
	embed.setDescription(`**${guild.name}** started using the bot!\n**${guild.memberCount}** members.`);
	messageQueue.addEmbed(embed);
});

client.on('guildDelete', async guild => {
	console.log('EVENT(guildDelete):', guild.id, guild.name, guild.memberCount);
	const embed = createEmbed(client, '#cc0000');
	embed.setAuthor(`Guild removed`, guild.iconURL);
	embed.setDescription(`**${guild.name}** stopped using the bot!\n**${guild.memberCount}** members.`);
	messageQueue.addEmbed(embed);
});

client.on('reconnecting', async () => {
	console.log('EVENT(reconnecting)');
});

client.on('disconnect', async event => {
	console.log('EVENT(disconnect)', event);
});

client.on('resume', async replayed => {
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
