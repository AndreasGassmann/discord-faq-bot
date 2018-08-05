import { Client, Command, CommandDecorators, Message, Middleware, Logger, logger, GuildStorage } from '@yamdbf/core';
import { User } from 'discord.js';
import { createEmbed, sendEmbed, printError, sendMessage } from '../utils/util';
import { IFAQ } from '../iFAQ';
const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'show',
			aliases: [],
			desc: 'Show specific FAQ',
			usage: '<prefix>show <name> (@user)',
			info: '',
			callerPermissions: [],
			guildOnly: true
		});
	}

	@using(resolve('name: String, user: User'))
	@using(expect('name: String'))
	public async action(message: Message, [name, user]: [string, User]): Promise<any> {
		printError(this._logger.log(
			`${message.guild ? message.guild.name : 'DM'} (${message.author.username}): ${message.content}`
		));

		const storage: GuildStorage = message.guild.storage;
		let faqs: { [key: string]: IFAQ } = await storage.get('faq');

		if (!faqs) {
			printError(sendMessage(message.channel, 'Please add FAQs using the "add" command.', null, message.author));
			return;
		} else if (!faqs[name]) {
			printError(sendMessage(message.channel, 'This FAQ doesn\'t exist', null, message.author));
			return;
		}

		let key = name.toLowerCase();

		let faq = faqs[key];
		const embed = createEmbed(this.client);

		embed.setTitle(faq.question ? faq.question : name);
		embed.setDescription(faq.answer);

		if (user) {
			printError(sendMessage(message.channel, `<@${user.id}>`, embed, message.author));
		} else {
			printError(sendEmbed(message.channel, embed, message.author));
		}

		faq.usage++;
		await storage.set('faq', faqs);
	}
}
