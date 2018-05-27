import { Client, Command, CommandDecorators, Message, Middleware, Logger, logger, GuildStorage } from 'yamdbf';
import { createEmbed, sendEmbed } from '../utils/util';
import { IFAQ } from '../iFAQ';
const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'faq-add',
			aliases: ['faqadd'],
			desc: 'Add new FAQ',
			usage: '<prefix>faq-add <name> <answer>',
			info: '',
			callerPermissions: ['MANAGE_GUILD'],
			guildOnly: true
		});
	}

	@using(resolve('name: String, ...answer: String'))
	@using(expect('name: String, ...answer: String'))
	public async action(message: Message, [name, answer]: [string, string]): Promise<any> {
		this._logger.log(`${message.guild.name} (${message.author.username}): ${message.content}`);

		const embed = createEmbed(this.client);

		let hasReservedName = this.client.commands.some(c => c.name === `faq-${name}`);

		if (hasReservedName) {
			embed.setTitle(`Error`);
			embed.setDescription(`${name} is a reserved name, please choose another one.`);

			sendEmbed(message.channel, embed, message.author);
			return;
		}

		const storage: GuildStorage = message.guild.storage;
		let faqs: { [key: string]: IFAQ } = await storage.get('faq');

		if (!faqs) {
			faqs = {};
		}

		let key = name.toLowerCase();

		let formattedanswer = answer
			.split('\\n').join('\n')
			.split('{break}').join('\n');

		if (!faqs[key]) {
			faqs[key] = {
				key: name,
				question: '',
				answer: formattedanswer,
				trigger: [''],
				created: {
					userId: message.author.id,
					userName: message.author.username,
					timestamp: new Date()
				},
				lastChanged: {
					userId: '',
					userName: '',
					timestamp: null
				},
				usage: 0,
				enableAutoAnswer: true
			};
		}

		await storage.set('faq', faqs);

		embed.setTitle(`Added: ${name}`);
		embed.setDescription(`${formattedanswer}`);

		sendEmbed(message.channel, embed, message.author);
	}
}
