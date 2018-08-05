import { Client, Command, CommandDecorators, Message, Middleware, Logger, logger, GuildStorage } from '@yamdbf/core';
import { createEmbed, sendEmbed, prompt, PromptResult, printError } from '../utils/util';
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

	public async action(message: Message, [name, answer]: [string, string]): Promise<any> {
		printError(this._logger.log(
			`${message.guild ? message.guild.name : 'DM'} (${message.author.username}): ${message.content}`
		));

		const embed = createEmbed(this.client);

		const storage: GuildStorage = message.guild.storage;
		let faqs: { [key: string]: IFAQ } = await storage.get('faq');

		if (!faqs) {
			faqs = {};
		}

		const [keyResult, keyValue] = await prompt(
			message,
			'Please enter one word that describes your FAQ (like `prefix` or `name`. (You have 60 seconds to answer)',
		)
		if (keyResult === PromptResult.TIMEOUT) return message.channel.send('Command timed out.');
		if (keyResult === PromptResult.FAILURE) return message.channel.send('Okay, aborting... :(');

		const [questionResult, questionValue] = await prompt(
			message,
			'Please enter the question. (You have 60 seconds to answer)',
		)
		if (questionResult === PromptResult.TIMEOUT) return message.channel.send('Command timed out.');
		if (questionResult === PromptResult.FAILURE) return message.channel.send('Okay, aborting... :(');

		const [answerResult, answerValue] = await prompt(
			message,
			'Please enter the answer. (You have 60 seconds to answer)',
		)
		if (answerResult === PromptResult.TIMEOUT) return message.channel.send('Command timed out.');
		if (answerResult === PromptResult.FAILURE) return message.channel.send('Okay, aborting... :(');

		let key = keyValue.content.toLowerCase();

		let formattedanswer = answerValue.content
			.split('\\n').join('\n')
			.split('{break}').join('\n');

		if (!faqs[key]) {
			faqs[key] = {
				key: keyValue.content,
				question: questionValue.content,
				answer: formattedanswer,
				trigger: [],
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

		embed.setTitle(`Added: ${keyValue.content}`);
		embed.setDescription(`${formattedanswer}`);

		printError(sendEmbed(message.channel, embed, message.author));
	}
}
