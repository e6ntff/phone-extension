export interface Call {
	cause: 'incoming' | 'outgoing' | 'failed' | 'missed' | '';
	date: Date;
	address: string;
	duration: number;
}

export type Status = 'incoming' | 'connecting' | 'connected' | 'ended';
