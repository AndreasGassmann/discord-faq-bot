interface IConfig {
	discordToken: string;
	owner: string | string[];
	botName: string;
	/**
	 * The channel where imporant messages will be sent to
	 */
	logChannel: string;
	dmChannel?: string;
}

const configFile: IConfig = require('./config.json');

export class Config implements IConfig {
	discordToken = configFile.discordToken;
	owner = configFile.owner;
	botName = configFile.botName;
	logChannel = configFile.logChannel;
	get dmChannel(): string {
		return configFile.dmChannel ? configFile.dmChannel : configFile.logChannel;
	}
}

let config = new Config();
console.log(config.discordToken);