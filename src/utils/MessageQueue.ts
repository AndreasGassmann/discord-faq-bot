import { Client } from 'yamdbf';
import { TextChannel, RichEmbed } from 'discord.js';
const config = require('../../config.json');

export class MessageQueue {
	private client: Client = null;
	private messages: string[] = [];

	public constructor(client: Client) {
		this.client = client;

		setInterval(() => {
			this.sendMessages();
		}, 2000);
	}

	public addMessage(message: string) {
		this.messages.push(`${new Date().toISOString()} - ${message}`);
	}

	public addEmbed(embed: RichEmbed) {
		// tslint:disable-next-line
		let channel = <TextChannel>this.client.channels.get(config.logChannel);
		if (channel) {
			channel.send({ embed }).then(() => { }).catch(console.error);
		}
	}

	private sendMessages() {
		if (this.messages.length === 0) return;
		// tslint:disable-next-line
		let channel = <TextChannel>this.client.channels.get(config.logChannel);
		if (channel) {
			channel.send(this.messages.join('\n')).then(() => { }).catch(console.error);
			this.messages = [];
		}
	}
}
