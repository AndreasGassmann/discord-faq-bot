import { Client, Command, CommandDecorators, Message, Middleware, Logger, logger, GuildStorage, GuildSettings } from '@yamdbf/core';
import { printError } from '../utils/util';
import { FAQSettingsKeys, AutoResponseLocation } from '../iFAQ';
const { resolve } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'config',
			aliases: [],
			desc: 'View and edit configs',
			usage: '<prefix>config <key> <value>',
			info: '',
			callerPermissions: [],
			guildOnly: true
		});
	}

	@using(resolve('key: String, value: String'))
	public async action(message: Message, [key, value]: [string, string]): Promise<any> {
		printError(this._logger.log(
			`${message.guild ? message.guild.name : 'DM'} (${message.author.username}): ${message.content}`
		));

		const FAQSettings: { [key in FAQSettingsKeys]: any[] } = {
			[FAQSettingsKeys.AUTO_RESPONSE]: ['true', 'false'],
			[FAQSettingsKeys.AUTO_RESPONSE_LOCATION]: Object.values(AutoResponseLocation) as AutoResponseLocation[]
		}

		const settings: GuildSettings = message.guild.storage.settings;

		if (key) {
			if (!Object.values(FAQSettingsKeys).includes(key)) {
				return message.channel.send(`Invalid key. Possible keys are:\n${Object.values(FAQSettingsKeys).map(v => `\`${v}\``).join(', ')}`);
			}
			if (value) {
				if (!FAQSettings[key as FAQSettingsKeys].includes(value)) {
					return message.channel.send(`Invalid value. Possible values are:\n${FAQSettings[key as FAQSettingsKeys].map(v => `\`${v}\``).join(', ')}`);
				}
				let insertValue: any = value;
				if (insertValue === 'true') insertValue = true;
				if (insertValue === 'false') insertValue = false;
				settings.set(key, value);
				message.channel.send(`Set ${key} to ${insertValue}`);
			} else {
				let settingValue = await settings.get(key);
				message.channel.send(`${key} is set to ${settingValue}`);
			}
		} else {
			message.channel.send(`Config options are:`);
		}
	}
}
