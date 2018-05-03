import { Client, Command, CommandDecorators, Message, Middleware, Logger, logger, GuildStorage } from 'yamdbf';
import { createEmbed } from '../utils/util';
const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'delete',
			aliases: [],
			desc: 'Delete specific FAQ',
			usage: '<prefix>delete <name>',
			info: '',
			callerPermissions: ['MANAGE_GUILD'],
			guildOnly: true
		});
	}

	@using(resolve('name: String'))
	@using(expect('name: String'))
	public async action(message: Message, [name]: [string]): Promise<any> {
		this._logger.log(`${message.guild.name} (${message.author.username}): ${message.content}`);

		const storage: GuildStorage = message.guild.storage;
		let faqs = await storage.get('faq');

		let faq = undefined;

		if (faqs) {
			faq = faqs[name];
			if (faq) {
				delete faqs[name];
				await storage.set('faq', faqs);
			}
		}

		const embed = createEmbed(this.client);

		embed.setTitle(`${name}`);
		if (faq) {
			embed.setDescription(`Deleted successfully. The old message was: \n${faq}`);
		} else {
			embed.setDescription(`An FAQ with the name ${name} does not exist.`);
		}

		message.channel.send({ embed });
	}
}
