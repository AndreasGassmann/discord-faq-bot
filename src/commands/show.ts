import { Client, Command, CommandDecorators, Message, Middleware, Logger, logger, GuildStorage } from 'yamdbf';
import { User } from 'discord.js';
import { createEmbed } from '../utils/util';
const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'show',
			aliases: ['.'],
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
		this._logger.log(`${message.guild.name} (${message.author.username}): ${message.content}`);

		const storage: GuildStorage = message.guild.storage;
		let faqs = await storage.get('faq');

		if (!faqs) {
			message.channel.send('Please add FAQs using the "add" command.');
			return;
		} else if (!faqs[name]) {
			message.channel.send('This FAQ doesn\'t exist');
			return;
		}

		const embed = createEmbed(this.client);

		embed.setTitle(name);
		embed.setDescription(faqs[name]);

		if (user) {
			message.channel.send(`<@${user.id}>`, { embed });
		} else {
			message.channel.send({ embed });
		}
	}
}
