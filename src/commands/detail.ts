import { Client, Command, Message, Logger, logger, GuildStorage, CommandDecorators, Middleware } from '@yamdbf/core';
import { createEmbed, sendEmbed, printError, sendMessage } from '../utils/util';
import { IFAQ } from '../iFAQ';
const { resolve } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'detail',
			aliases: ['detail'],
			desc: 'Show FAQ details',
			usage: '<prefix>faq-detail (name)',
			info: '',
			callerPermissions: ['MANAGE_GUILD'],
			guildOnly: true
		});
	}

	@using(resolve('name: String'))
	public async action(message: Message, [name]: [string]): Promise<any> {
		printError(this._logger.log(
			`${message.guild ? message.guild.name : 'DM'} (${message.author.username}): ${message.content}`
		));

		const storage: GuildStorage = message.guild.storage;
		let faqs: { [key: string]: IFAQ } = await storage.get('faq');

		if (!faqs || Object.keys(faqs).length === 0) {
			printError(sendMessage(message.channel, 'No FAQs, please add FAQs using the "add" command.', null, message.author));
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

				console.log('trigger: ', faq.trigger);
				if (faq.trigger.length > 0) embed.addField('Triggers', JSON.stringify(faq.trigger));
				if (faq.trigger.length === 0) embed.addField('Triggers', 'Not set');
				embed.addField('Auto Answer enabled?', faq.enableAutoAnswer);

				embed.addField('Usage', `${faq.usage} ${faq.usage === 1 ? 'time' : 'times'}`);
				embed.addField('Added by', `${faq.created.userName} (<@${faq.created.userId}>) at ${faq.created.timestamp}`);
				if (faq.lastChanged.userId && faq.lastChanged.userName && faq.lastChanged.timestamp) {
					embed.addField(
						'Last changed',
						`${faq.lastChanged.userName} (<@${faq.lastChanged.userId}>) at ${faq.lastChanged.timestamp}`);
				}
				if (faq.antoAnswerUsage) {
					embed.addField('Number of times triggered by Auto Response', `${faq.antoAnswerUsage}`);
				}
			} else {
				embed.setTitle('No FAQ with this name found!');
			}
		} else {
			Object.keys(faqs).forEach(key => {
				let description = '';
				if (!(faqs[key].trigger.length !== 0)) description += 'Trigger not set!\n';
				description += `Usage: ${faqs[key].usage} ${faqs[key].usage === 1 ? 'time' : 'times'}\n`;
				description += `Auto Answer enabled? ${faqs[key].enableAutoAnswer ? 'yes' : 'no'}`;
				embed.addField(
					`${key}`,
					description
				);
			});
		}

		printError(sendEmbed(message.channel, embed, message.author));
	}
}
