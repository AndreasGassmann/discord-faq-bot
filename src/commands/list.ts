import { Client, Command, Message, Logger, logger, GuildStorage } from '@yamdbf/core';
import { createEmbed, sendEmbed, printError, sendMessage } from '../utils/util';
import { IFAQ } from '../iFAQ';

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'list',
			aliases: [],
			desc: 'Show all FAQs',
			usage: '<prefix>list',
			info: '',
			callerPermissions: [],
			guildOnly: true
		});
	}

	public async action(message: Message): Promise<any> {
		printError(this._logger.log(
			`${message.guild ? message.guild.name : 'DM'} (${message.author.username}): ${message.content}`
		));

		const storage: GuildStorage = message.guild.storage;
		let faqs: { [key: string]: IFAQ } = await storage.get('faq');

		if (!faqs || Object.keys(faqs).length === 0) {
			printError(sendMessage(message.channel, 'Please add FAQs using the "add" command.', null, message.author));
			return;
		}

		const embed = createEmbed(this.client);
		const prefix = message.guild ? await this.client.getPrefix(message.guild) : '!';

		embed.setDescription('The following FAQs are available:')
		Object.keys(faqs).forEach(key => {
			embed.addField(
				`${faqs[key].question ? faqs[key].question : key}`,
				`\`${prefix}faq ${key}\``
			);
		})

		printError(sendEmbed(message.channel, embed, message.author));
	}
}
