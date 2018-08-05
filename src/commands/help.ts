import { User, TextChannel, DMChannel, GroupDMChannel } from 'discord.js';
import { Client, Command, CommandDecorators, Logger, logger, Message, Middleware } from '@yamdbf/core';
import { createEmbed, sendEmbed, printError } from '../utils/util';
const { resolve } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<Client> {
	@logger('Command') private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'help',
			aliases: [],
			desc: 'Display help',
			usage: '<prefix>help (command)'
		});
	}

	@using(resolve('commandString: String'))
	public async action(message: Message, [commandString]: [string]): Promise<any> {
		printError(this._logger.log(
			`${message.guild ? message.guild.name : 'DM'} (${message.author.username}): ${message.content}`
		));

		const embed = createEmbed(this.client);

		const prefix = message.guild ? await this.client.getPrefix(message.guild) : '!';

		const command = this.client.commands.resolve('faq-' + commandString);

		if (command) {
			const cmd = {
				...command,
				name: command.name.startsWith('faq-') ? command.name.substring(4) : command.name,
				usage: command.usage.replace('<prefix>', `${prefix}`).split('faq-').join('faq ')
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
					name: c.name.startsWith('faq-') ? c.name.substring(4) : c.name,
					usage: c.usage.replace('<prefix>', `${prefix}`).split('faq-').join('faq ')
				}))
				.sort((a, b) => a.name.localeCompare(b.name));

			let allDescription = ``;
			const allLen = commands
				.filter(c => c.callerPermissions.every(p => p !== 'MANAGE_GUILD'))
				.reduce((acc, c) => Math.max(acc, c.usage.length), 0);
			commands
				.filter(c => c.callerPermissions.every(p => p !== 'MANAGE_GUILD'))
				.forEach(
					c => (allDescription += `\`${c.usage}  ${' '.repeat(allLen - c.usage.length)}${c.desc}\`\n`)
				);
			if (allDescription) {
				embed.addField('Public commands', allDescription);
			}

			let modDescription = ``;
			const modLen = commands
				.filter(c => c.callerPermissions.some(p => p === 'MANAGE_GUILD'))
				.reduce((acc, c) => Math.max(acc, c.usage.length), 0);
			commands
				.filter(c => c.callerPermissions.some(p => p === 'MANAGE_GUILD'))
				.forEach(
					c => (modDescription += `\`${c.usage}  ${' '.repeat(modLen - c.usage.length)}${c.desc}\`\n`)
				);
			if (modDescription) {
				embed.addField('Admin commands', modDescription);
			}
		}

		printError(sendEmbed(message.channel, embed, message.author));
	}
}
