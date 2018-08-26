export interface IFAQ {
	key: string;
	question: string;
	answer: string;
	trigger: string[];
	usage: number;
	created: {
		userId: string;
		userName: string;
		timestamp: Date;
	};
	lastChanged: {
		userId: string;
		userName: string;
		timestamp: Date;
	};
	enableAutoAnswer: boolean;
	antoAnswerUsage: number;
	autoAnswerWasHelpful: number;
	autoAnswerWasNotHelpful: number;
}

export enum FAQSettingsKeys {
	AUTO_RESPONSE = 'auto-response',
	AUTO_RESPONSE_LOCATION = 'auto-response-location'
}

export enum AutoResponseLocation {
	CHANNEL = 'channel',
	DM = 'dm',
	BOTH = 'both'
}