import { Client, Command, CommandDecorators, Message, Middleware, Logger, logger, GuildSettings } from 'yamdbf';
import { createEmbed, sendEmbed } from '../utils/util';
const { resolve } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'faq-auto-response',
			aliases: ['faq-autoResponse'],
			desc: 'Enable or disable automatic responses of the bot.',
			usage: '<prefix>faq autoResponse <yes/no>',
			info: '',
			callerPermissions: [],
			guildOnly: true
		});
	}

	@using(resolve('enabled: Boolean'))
	public async action(message: Message, [enabled]: [Boolean]): Promise<any> {
		this._logger.log(`${message.guild.name} (${message.author.username}): ${message.content}`);

		const settings: GuildSettings = await message.guild.storage.settings;

		const embed = createEmbed(this.client);

		await settings.set('auto-response', enabled);

		embed.setTitle('Auto responses');
		embed.setDescription(`Are now **${enabled ? 'enabled' : 'disabled'}**`);

		sendEmbed(message.channel, embed, message.author);
	}
}
