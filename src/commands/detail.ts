import { Client, Command, Message, Logger, logger, GuildStorage, CommandDecorators, Middleware } from 'yamdbf';
import { createEmbed, sendEmbed } from '../utils/util';
import { IFAQ } from '../iFAQ';
const { resolve } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'faq-detail',
			aliases: ['faqdetail'],
			desc: 'Show FAQ details',
			usage: '<prefix>faq-detail (name)',
			info: '',
			callerPermissions: ['MANAGE_GUILD'],
			guildOnly: true
		});
	}

	@using(resolve('name: String'))
	public async action(message: Message, [name]: [string]): Promise<any> {
		this._logger.log(`${message.guild.name} (${message.author.username}): ${message.content}`);

		const storage: GuildStorage = message.guild.storage;
		let faqs: { [key: string]: IFAQ } = await storage.get('faq');

		if (!faqs || Object.keys(faqs).length === 0) {
			message.channel.send('No FAQs, please add FAQs using the "add" command.');
			return;
		}

		const embed = createEmbed(this.client);

		if (name) {
			let key = name.toLowerCase();
			let faq = faqs[key];
			if (faq) {
				embed.addField('Key', faq.key);
				if (faq.question) embed.addField('Question', faq.question);
				embed.addField('Answer', faq.answer);
				if (faq.trigger) embed.addField('Tags', faq.trigger.join(','));
				embed.addField('Auto Answer enabled?', faq.enableAutoAnswer);

				embed.addField('Usage', `${faq.usage} ${faq.usage === 1 ? 'time' : 'times'}`);
				embed.addField('Added by', `${faq.created.userName} (<@${faq.created.userId}>) at ${faq.created.timestamp}`);
				embed.addField('Added at', faq.created.timestamp);
				if (faq.lastChanged.userId && faq.lastChanged.userName && faq.lastChanged.timestamp) {
					embed.addField(
						'Last changed',
						`${faq.lastChanged.userName} (<@${faq.lastChanged.userId}>) at ${faq.lastChanged.timestamp}`);
				}
			}
		} else {
			Object.keys(faqs).forEach(key => {
				let description = '';
				if (!faqs[key].question) description += 'Question not set!\n';
				if (!faqs[key].trigger) description += 'Trigger not set!\n';
				description += `Usage: ${faqs[key].usage} ${faqs[key].usage === 1 ? 'time' : 'times'}`;
				embed.addField(
					`${key}`,
					description
				);
			});
		}

		sendEmbed(message.channel, embed, message.author);
	}
}
