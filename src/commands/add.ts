import { Client, Command, CommandDecorators, Message, Middleware, Logger, logger, GuildStorage } from 'yamdbf';
import { createEmbed } from '../utils/util';
const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'add',
			aliases: ['add-faq', 'addfaq'],
			desc: 'Add new FAQ',
			usage: '<prefix>add <name> <description>',
			info: '',
			callerPermissions: ['MANAGE_GUILD'],
			guildOnly: true
		});
	}

	@using(resolve('name: String, ...description: String'))
	@using(expect('name: String, ...description: String'))
	public async action(message: Message, [name, description]: [string, string]): Promise<any> {
		this._logger.log(`${message.guild.name} (${message.author.username}): ${message.content}`);

		const storage: GuildStorage = message.guild.storage;
		let faqs = await storage.get('faq');

		if (!faqs) {
			faqs = {};
		}

		let formattedDescription = description.split('\\n').join('\n').split('{break}').join('\n');
		faqs[name] = formattedDescription;
		await storage.set('faq', faqs);

		const embed = createEmbed(this.client);

		embed.setTitle(`Added: ${name}`);
		embed.setDescription(`${formattedDescription}`);

		message.channel.send({ embed });
	}
}
