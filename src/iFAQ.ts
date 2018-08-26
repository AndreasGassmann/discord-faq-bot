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