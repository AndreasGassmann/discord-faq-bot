import { Client, Command, Message, Logger, logger, GuildStorage } from '@yamdbf/core';
import { createEmbed, sendEmbed, confirmation, ConfirmationResult, printError } from '../utils/util';
import { IFAQ } from '../iFAQ';

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'add',
			aliases: [],
			desc: 'Add new FAQ',
			usage: '<prefix>add',
			info: '',
			callerPermissions: ['MANAGE_GUILD'],
			guildOnly: true
		});
	}

	public async action(message: Message, [..._args]: [string]): Promise<any> {
		printError(this._logger.log(
			`${message.guild ? message.guild.name : 'DM'} (${message.author.username}): ${message.content}`
		));

		const embed = createEmbed(this.client);

		const storage: GuildStorage = message.guild.storage;
		let faqs: { [key: string]: IFAQ } = await storage.get('faq');

		if (!faqs) {
			faqs = {};
		}

		await message.channel.send('Please enter one word that describes your FAQ (like `prefix` or `name`. (You have 60 seconds to answer, `cancel` to abort)');
		let keyResult, keyValue, keyVerifyError;
		do {
			[keyResult, keyValue, keyVerifyError] = await confirmation(
				message.channel,
				message.author,
				60,
				(text) => {
					if (text === 'cancel') return [ConfirmationResult.CANCEL, 'Aborting...'];
					let key = text;
					if (key.split(' ').length === 1) {
						if (faqs[key] === undefined) {
							return [ConfirmationResult.SUCCESS, null];
						}
						return [ConfirmationResult.TRY_AGAIN, 'Key already exists!'];
					}
					return [ConfirmationResult.TRY_AGAIN, 'Key must only be one word'];
				}
			)

			if (keyResult === ConfirmationResult.TRY_AGAIN) message.channel.send(keyVerifyError);
		} while (keyResult === ConfirmationResult.TRY_AGAIN);

		if (keyResult === ConfirmationResult.TIMEOUT) return message.channel.send(keyVerifyError);
		if (keyResult === ConfirmationResult.CANCEL) return message.channel.send(keyVerifyError);

		await message.channel.send('Please enter the question. (You have 60 seconds to answer, `cancel` to abort)');
		const [questionResult, questionValue, questionVerifyError] = await confirmation(
			message.channel,
			message.author,
			60,
			(text) => {
				if (text === 'cancel') return [ConfirmationResult.CANCEL, 'Aborting...'];
				return [ConfirmationResult.SUCCESS, null];
			}
		)
		if (questionResult === ConfirmationResult.TIMEOUT) return message.channel.send(questionVerifyError);
		if (questionResult === ConfirmationResult.CANCEL) return message.channel.send(questionVerifyError);

		await message.channel.send('Please enter the answer. (You have 60 seconds to answer, `cancel` to abort)')
		const [answerResult, answerValue, answerVerifyError] = await confirmation(
			message.channel,
			message.author,
			60,
			(text) => {
				if (text === 'cancel') return [ConfirmationResult.CANCEL, 'Aborting...'];
				return [ConfirmationResult.SUCCESS, null];
			}
		)
		if (answerResult === ConfirmationResult.TIMEOUT) return message.channel.send(answerVerifyError);
		if (answerResult === ConfirmationResult.CANCEL) return message.channel.send(answerVerifyError);

		let key = keyValue.content.toLowerCase();

		let formattedanswer = answerValue.content
			.split('\\n').join('\n')
			.split('{break}').join('\n');

		if (!faqs[key]) {
			faqs[key] = {
				key: keyValue.content,
				question: questionValue.content,
				answer: formattedanswer,
				trigger: '',
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
				enableAutoAnswer: true,
				antoAnswerUsage: 0,
				autoAnswerWasHelpful: 0,
				autoAnswerWasNotHelpful: 0
			};
		}

		await storage.set('faq', faqs);

		embed.setTitle(`Added: ${keyValue.content}`);
		embed.setDescription(`${formattedanswer}`);

		printError(sendEmbed(message.channel, embed, message.author));
	}
}
