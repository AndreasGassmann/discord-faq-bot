import { User, TextChannel, DMChannel, GroupDMChannel, RichEmbed } from 'discord.js';
import { Client, Command, CommandDecorators, Logger, logger, Message, Middleware } from 'yamdbf';
import { createEmbed } from '../utils/util';
const { resolve } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command') private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'help',
			desc: 'Display help',
			usage: '<prefix>help (command)'
		});
	}

	@using(resolve('command: Command'))
	public async action(message: Message, [command]: [Command]): Promise<any> {
		this._logger.log(
			`${message.guild ? message.guild.name : 'DM'} (${message.author.username}): ${
			message.content
			}`
		);

		const embed = createEmbed(this.client);

		const prefix = message.guild ? await this.client.getPrefix(message.guild) : '!faq';

		if (command) {
			const cmd = {
				...command,
				usage: command.usage.replace('<prefix>', `${prefix} `)
			};

			embed.addField('Command', cmd.name);
			embed.addField('Usage', `${cmd.usage}\n\n${cmd.info}`);
			embed.addField('Alises', cmd.aliases.join(', '), true);
			embed.addField('Description', cmd.desc, true);
			embed.addField(
				'User permissions',
				cmd.callerPermissions.length > 0 ? cmd.callerPermissions.join(', ') : 'None'
			);
			embed.addField(
				'Bot permissions',
				cmd.clientPermissions.length > 0 ? cmd.clientPermissions.join(', ') : 'None'
			);
		} else {

			const commands = this.client.commands
				.filter(c => c.name !== 'groups')
				.filter(c => c.name !== 'shortcuts')
				.filter(c => !c.ownerOnly && !c.hidden)
				.map(c => ({
					...c,
					usage: c.usage.replace('<prefix>', `${prefix} `)
				}))
				.sort((a, b) => a.name.localeCompare(b.name));

			let descr = '';
			const len = commands.reduce((acc, c) => Math.max(acc, c.usage.length), 0);
			commands.forEach(
				c => (descr += `\`${c.usage}  ${' '.repeat(len - c.usage.length)}${c.desc}\`\n`)
			);
			if (descr) {
				embed.addField('Commands', descr);
			}
		}

		message.channel.send({ embed });
	}
}
