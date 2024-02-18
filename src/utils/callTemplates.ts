import { RTCSession } from 'jssip/lib/RTCSession';
import { Call } from './interfaces';

const callTemplates = {
	incomingEnded: (session: RTCSession): Call => ({
		cause: 'incoming',
		date: session.start_time,
		address: session.remote_identity.uri.user,
		duration: session.end_time.getTime() - session.start_time.getTime(),
	}),
	incomingFailed: (session: RTCSession): Call => ({
		cause: 'missed',
		date: session.start_time ? new Date(session.start_time) : new Date(),
		address: session.remote_identity.uri.user,
		duration: 0,
	}),
	outgoingEnded: (session: RTCSession): Call => ({
		cause: 'outgoing',
		date: session.start_time,
		address: session.remote_identity.uri.user,
		duration: session.end_time.getTime() - session.start_time.getTime(),
	}),
	outgoingFailed: (session: RTCSession): Call => ({
		cause: 'failed',
		date: session.start_time ? new Date(session.start_time) : new Date(),
		address: session.remote_identity.uri.user,
		duration: 0,
	}),
};

export default callTemplates;
