import { Client, Command, CommandDecorators, Message, Middleware, Logger, logger, GuildStorage } from 'yamdbf';
import { createEmbed, sendEmbed, prompt, PromptResult } from '../utils/util';
import { IFAQ } from '../iFAQ';
const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'add',
			aliases: [],
			desc: 'Add new FAQ',
			usage: '<prefix>add <name> <answer>',
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

		const [keyResult, keyValue] = await prompt(
			message,
			'Please enter a key.',
		)
		if (keyResult === PromptResult.TIMEOUT) return message.channel.send('Command timed out, aborting ban.');
		if (keyResult === PromptResult.FAILURE) return message.channel.send('Okay, aborting ban.');

		const [questionResult, questionValue] = await prompt(
			message,
			'Please enter the question.',
		)
		if (questionResult === PromptResult.TIMEOUT) return message.channel.send('Command timed out, aborting ban.');
		if (questionResult === PromptResult.FAILURE) return message.channel.send('Okay, aborting ban.');

		const [answerResult, answerValue] = await prompt(
			message,
			'Please enter the answer.',
		)
		if (answerResult === PromptResult.TIMEOUT) return message.channel.send('Command timed out, aborting ban.');
		if (answerResult === PromptResult.FAILURE) return message.channel.send('Okay, aborting ban.');

		await storage.set('faq', faqs);

		embed.setTitle(`Added: ${name}`);
		embed.setDescription(`${formattedanswer}`);

		sendEmbed(message.channel, embed, message.author);
	}
}
