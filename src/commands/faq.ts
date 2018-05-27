import { Client, Command, CommandDecorators, Message, Middleware, Logger, logger } from 'yamdbf';
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
		this._logger.log(`${message.guild.name} (${message.author.username}): ${message.content}`);

		if (!name) {
			let cmd = this.client.commands.resolve('faq-list');
			cmd.action(message, []);
			return;
		}

		let cmd = this.client.commands.resolve('faq-' + name);
		if (cmd) {
			cmd.action(message, args);
		} else {
			cmd = this.client.commands.resolve('faq-show');
			cmd.action(message, [name]);
		}
	}
}
