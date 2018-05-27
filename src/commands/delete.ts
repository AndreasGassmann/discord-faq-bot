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
			name: 'faq-delete',
			aliases: ['faq-delete'],
			desc: 'Delete specific FAQ',
			usage: '<prefix>faq-delete <name>',
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
		let faqs: { [key: string]: IFAQ } = await storage.get('faq');

		let faq = undefined;
		let key = name.toLowerCase();

		if (faqs) {
			faq = faqs[key];
			if (faq) {
				delete faqs[key];
				await storage.set('faq', faqs);
			}
		}

		const embed = createEmbed(this.client);

		embed.setTitle(`${name}`);
		if (faq) {
			embed.setDescription(`Deleted successfully.`);
		} else {
			embed.setDescription(`An FAQ with the name ${name} does not exist.`);
		}

		sendEmbed(message.channel, embed, message.author);
	}
}
