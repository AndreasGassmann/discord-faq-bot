import { Client, Command, Message, Logger, logger, GuildStorage } from 'yamdbf';
import { createEmbed, sendEmbed } from '../utils/util';
import { IFAQ } from '../iFAQ';

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'faq-all',
			aliases: ['faqall'],
			desc: 'Show all FAQs including answers',
			usage: '<prefix>faq-all',
			info: '',
			callerPermissions: [],
			guildOnly: true
		});
	}

	public async action(message: Message): Promise<any> {
		this._logger.log(`${message.guild.name} (${message.author.username}): ${message.content}`);

		const storage: GuildStorage = message.guild.storage;
		let faqs: { [key: string]: IFAQ } = await storage.get('faq');

		if (!faqs || Object.keys(faqs).length === 0) {
			message.channel.send('Please add FAQs using the "add" command.');
			return;
		}

		const embed = createEmbed(this.client);

		Object.keys(faqs).forEach(key => {
			embed.addField(
				`${faqs[key].question ? faqs[key].question : key}`,
				faqs[key].answer
			);
		})

		sendEmbed(message.channel, embed, message.author);
	}
}
