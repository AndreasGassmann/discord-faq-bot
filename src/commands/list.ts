import { Client, Command, Message, Logger, logger, GuildStorage } from 'yamdbf';
import { createEmbed } from '../utils/util';

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'list',
			aliases: ['list-faq', 'listfaq'],
			desc: 'Show all FAQs',
			usage: '<prefix>list',
			info: '',
			callerPermissions: [],
			guildOnly: true
		});
	}

	public async action(message: Message): Promise<any> {
		this._logger.log(`${message.guild.name} (${message.author.username}): ${message.content}`);

		const storage: GuildStorage = message.guild.storage;
		let faqs = await storage.get('faq');

		if (!faqs || Object.keys(faqs).length === 0) {
			message.channel.send('Please add FAQs using the "add" command.');
			return;
		}

		const embed = createEmbed(this.client);

		Object.keys(faqs).forEach(key => {
			embed.addField(key, faqs[key]);
		})

		message.channel.send({ embed });
	}
}
