import { Client, Command, CommandDecorators, Message, Middleware, Logger, logger, GuildSettings } from '@yamdbf/core';
import { createEmbed, sendEmbed, printError } from '../utils/util';
const { expect, resolve } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'auto-response',
			aliases: ['autoResponse'],
			desc: 'Enable or disable automatic responses of the bot.',
			usage: '<prefix>autoResponse <yes/no>',
			info: '',
			callerPermissions: ['MANAGE_GUILD'],
			guildOnly: true
		});
	}

	@using(resolve('enabled: Boolean'))
	@using(expect('enabled: Boolean'))
	public async action(message: Message, [enabled]: [Boolean]): Promise<any> {
		printError(this._logger.log(
			`${message.guild ? message.guild.name : 'DM'} (${message.author.username}): ${message.content}`
		));

		const settings: GuildSettings = message.guild.storage.settings;

		const embed = createEmbed(this.client);

		await settings.set('auto-response', enabled);

		embed.setTitle('Auto responses');
		embed.setDescription(`Are now **${enabled ? 'enabled' : 'disabled'}**`);

		printError(sendEmbed(message.channel, embed, message.author));
	}
}
