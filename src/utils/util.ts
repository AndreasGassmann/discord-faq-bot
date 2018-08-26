import { Client, Guild } from '@yamdbf/core';
import { MessageEmbed, User, TextChannel, DMChannel, GroupDMChannel, Message, } from 'discord.js';

const config = require('../../config.json');

export function createEmbed(client: Client, color: string = '#00AE86'): MessageEmbed {
	const embed = new MessageEmbed();
	embed.setColor(color);
	if (client) {
		embed.setFooter(config.botName, client.user.avatarURL());
	} else {
		embed.setFooter(config.botName);
	}
	embed.setTimestamp();
	return embed;
}

function convertEmbedToPlain(embed: MessageEmbed) {
	const url = embed.url ? `(${embed.url})` : '';
	const authorUrl =
		embed.author && embed.author.url ? `(${embed.author.url})` : '';

	return (
		'**Embedded links are disabled for this channel.\n' +
		'Please tell an admin to enable them in the server settings.**\n\n' +
		(embed.author ? `_${embed.author.name}_ ${authorUrl}\n` : '') +
		(embed.title ? `**${embed.title}** ${url}\n` : '') +
		(embed.description ? embed.description + '\n' : '') +
		(embed.fields && embed.fields.length
			? '\n' +
			embed.fields.map(f => `**${f.name}**\n${f.value}`).join('\n\n') +
			'\n\n'
			: '') +
		(embed.footer ? `_${embed.footer.text}_` : '')
	);
}

export async function sendEmbed(
	target: User | TextChannel | DMChannel | GroupDMChannel,
	embed: MessageEmbed,
	fallbackUser?: User,
	plainMessage?: String
): Promise<Message | Message[]> {
	let [err, response] = await to(target.send(plainMessage, { embed }));
	if (!err) { return response; }

	const content = convertEmbedToPlain(embed);

	return sendMessage(target, content, embed, fallbackUser);
}

export async function sendMessage(
	target: User | TextChannel | DMChannel | GroupDMChannel,
	content: any,
	embed?: MessageEmbed,
	fallbackUser?: User
) {
	let [err, value] = await to(target.send(content));
	if (!err) { return value; }

	if (!fallbackUser) { return err; }

	const notice =
		`**I do not have permissions to post to that channel.\n` +
		`Please tell an admin to allow me to send messages in the channel.**`;

	if (!embed) {
		return fallbackUser.send(`${notice}\n${content}`);
	} else {
		return fallbackUser.send(notice, { embed });
	}
}

export function to<T, U = any>(
	promise: Promise<T>,
	errorExt?: object
): Promise<[U | null, T | undefined]> {
	return promise
		.then<[null, T]>((data: T) => [null, data])
		.catch<[U, undefined]>(err => {
			if (errorExt) {
				Object.assign(err, errorExt)
			}

			console.error(err);
			return [err, undefined]
		})
}

export function printError<T>(promise: Promise<T>) {
	promise.then(_value => { }).catch(error => { console.error(error) });
}

// Send welcome message to owner with setup instructions
export function greetOwner(guild: Guild) {
	let owner = guild.owner;
	printError(owner.send(
		`Hi! Thanks for inviting me to your server \`${guild.name}\`!\n\n` +
		'You can see a list of all commands using the `!help` command.\n\n' +
		`That's it! Enjoy the bot and if you have any questions feel free to join our support server!\n` +
		'https://discord.gg/ugjweS7'
	));
}

export async function respondToInitialDM(client: Client, message: Message) {
	if (message.channel instanceof DMChannel) {
		const user = message.author;
		const dmChannel = client.channels.get(config.dmChannel) as TextChannel;

		let oldMessages = await message.channel.messages.fetch({ limit: 2 });
		const isInitialMessage = oldMessages.size <= 1;
		if (isInitialMessage) {
			const initialMessage =
				`Hi there, thanks for writing me!\n\n` +
				`To invite me to your own server, just click here: https://discordapp.com/api/oauth2/authorize?client_id=441430430403526657&permissions=0&scope=bot\n\n` +
				`If you need help, please join our discord support server:\n\n` +
				`https://discord.gg/ugjweS7.\n\n` +
				`Have a good day!`;
			const embed = createEmbed(client);
			embed.setDescription(initialMessage);
			printError(sendEmbed(user, embed));
		}

		if (dmChannel) {
			const embed = createEmbed(client);
			embed.setAuthor(`${user.username}-${user.discriminator}`, user.avatarURL());
			embed.addField('User ID', user.id, true);
			embed.addField('Initial message', isInitialMessage, true);
			embed.setDescription(message.content);
			printError(sendEmbed(dmChannel, embed));
		}
	}
}

/**
 * Represents possible results of Util#prompt
 */
export enum ConfirmationResult {
	SUCCESS = 'SUCCESS',
	CANCEL = 'CANCEL',
	TRY_AGAIN = 'TRY_AGAIN',
	TIMEOUT = 'TIMEOUT'
}

export async function confirmation(
	channel: TextChannel | DMChannel | GroupDMChannel,
	author: User,
	timeToWaitInSeconds: number,
	verifyInput: (text: string) => [ConfirmationResult, string],
): Promise<[ConfirmationResult, Message, string]> {
	const confirmation: Message = (await channel.awaitMessages(
		m => m.author.id === author.id,
		{ max: 1, time: timeToWaitInSeconds * 1000 }
	)).first();

	if (!confirmation) {
		return [ConfirmationResult.TIMEOUT, confirmation, `I did not get an answer in time, aborting...`];
	}

	let [verifyResult, verifyFailedReason] = verifyInput(confirmation.content);

	if (verifyResult === ConfirmationResult.SUCCESS) {
		return [ConfirmationResult.SUCCESS, confirmation, null];
	}

	if (verifyResult === ConfirmationResult.TRY_AGAIN) {
		return [ConfirmationResult.TRY_AGAIN, confirmation, verifyFailedReason];
	}

	return [ConfirmationResult.CANCEL, confirmation, verifyFailedReason];
}