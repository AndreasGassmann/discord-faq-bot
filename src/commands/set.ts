import { Client, Command, CommandDecorators, Message, Middleware, Logger, logger, GuildStorage } from '@yamdbf/core';
import { createEmbed, sendEmbed, printError, sendMessage } from '../utils/util';
import { IFAQ } from '../iFAQ';
const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'set',
			aliases: [],
			desc: 'Set property of FAQ',
			usage: '<prefix>set <property> <name> <value>',
			info: 'Possible values are `question`, `answer`, `tags`, `enableAutoAnswer`',
			callerPermissions: ['MANAGE_GUILD'],
			guildOnly: true
		});
	}

	@using(resolve('property: String, name: String, ...value: String'))
	@using(expect('property: String, name: String, ...value: String'))
	public async action(message: Message, [property, name, value]: [string, string, string]): Promise<any> {
		printError(this._logger.log(
			`${message.guild ? message.guild.name : 'DM'} (${message.author.username}): ${message.content}`
		));

		const embed = createEmbed(this.client);

		let prop = property.toLowerCase();

		if (prop !== 'question' && prop !== 'answer' && prop !== 'trigger' && prop !== 'enableautoanswer') {
			printError(sendMessage(message.channel, 'Invalid property. Valid properties are: `question`, `answer`, `trigger`, `enableautoanswer`', null, message.author));
			return;
		}

		const storage: GuildStorage = message.guild.storage;
		let faqs: { [key: string]: IFAQ } = await storage.get('faq');

		let key = name.toLowerCase();

		if (!faqs[key]) {
			printError(sendMessage(message.channel, 'This FAQ doesn\'t exist', null, message.author));
			return;
		}

		if (prop === 'question') {
			faqs[key].question = value;
		}
		if (prop === 'answer') {
			faqs[key].answer = value.split('\\n').join('\n').split('{break}').join('\n');
		}
		if (prop === 'trigger') {
			try {
				let json = JSON.parse(value);
				faqs[key].trigger = json;
			} catch (e) {
				console.log(e);
			}
		}
		if (prop === 'enableautoanswer') {
			faqs[key].enableAutoAnswer = value === 'yes' || value === 'true' ? true : false;
		}

		faqs[key].lastChanged.userId = message.author.id;
		faqs[key].lastChanged.userName = message.author.username;
		faqs[key].lastChanged.timestamp = new Date();

		console.log(faqs[key]);

		await storage.set('faq', faqs);

		embed.setTitle(`Updated: ${name}`);
		embed.setDescription(`${property} of ${name} is now: ${value}`);

		printError(sendEmbed(message.channel, embed, message.author));
	}
}
