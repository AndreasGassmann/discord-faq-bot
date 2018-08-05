import { Client, Command, CommandDecorators, Message, Middleware, Logger, logger } from '@yamdbf/core';
import { printError } from '../utils/util';
const { resolve } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'faq',
			aliases: [''],
			desc: 'Show list of FAQ, or show specific FAQ',
			usage: '<prefix>faq (name)',
			info: '',
			callerPermissions: [],
			guildOnly: true
		});
	}

	@using(resolve('name: String'))
	public async action(message: Message, [name, ...args]: [string, Array<string>]): Promise<any> {
		printError(this._logger.log(
			`${message.guild ? message.guild.name : 'DM'} (${message.author.username}): ${message.content}`
		));

		console.log(name);
		if (!name) {
			let cmd = this.client.commands.resolve('list');
			cmd.action(message, []);
			return;
		}


		let cmd = this.client.commands.resolve('show');
		cmd.action(message, [name]);
	}
}
