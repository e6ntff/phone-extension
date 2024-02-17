import React, { useState, useEffect } from 'react';
import JsSIP from 'jssip';
import Register, { Config } from './components/Register';
import Calls from './components/Calls';
import CurrentCall from './components/CurrentCall';
import { Call, Status } from './utils/interfaces';
import { RTCSession } from 'jssip/lib/RTCSession';

const App: React.FC = () => {
	const [phone, setPhone] = useState<JsSIP.UA | null>(null);
	const [currentSession, setCurrentSession] = useState<RTCSession | null>(null);
	const [callHistory, setCallHistory] = useState<Call[]>([]);
	const [isRegistered, setIsRegistered] = useState<boolean>(false);
	const [isIncomingCall, setIsIncomingCall] = useState<boolean>(false);
	const [currentStatus, setCurrentStatus] = useState<Status>('incoming');
	const [isCall, setIsCalling] = useState<boolean>(false);

	useEffect(() => {
		const storedCallHistory = localStorage.getItem('callHistory');
		if (storedCallHistory) {
			setCallHistory(JSON.parse(storedCallHistory));
		}
	}, []);

	const updateCallHistory = (call: Call) => {
		setCallHistory((prevHistory: Call[]) => {
			const newHistory = [call, ...prevHistory];
			localStorage.setItem('callHistory', JSON.stringify(newHistory));
			return newHistory;
		});
		setCurrentStatus('ended');
		setTimeout(() => {
			setIsCalling(false);
		}, 1000);
	};

	const registerUser = (configuration: Config) => {
		const phoneInstance = new JsSIP.UA(configuration);

		phoneInstance.on('registered', () => {
			setIsRegistered(true);
		});

		phoneInstance.on('unregistered', () => {
			console.error('Registration Error!');
		});

		phoneInstance.start();
		setPhone(phoneInstance);

		phoneInstance.on('newRTCSession', (e) => {
			const session = e.session;
			const isNewIncomingCall = session.direction === 'incoming';

			setCurrentSession(session);
			if (isNewIncomingCall) {
				setCurrentStatus('incoming');
				setIsCalling(true);
				setIsIncomingCall(true);
			} else {
				setIsIncomingCall(false);
			}

			session.on('addstream', (e) => {
				const audio = new Audio();
				if (e.stream) {
					audio.srcObject = e.stream;
					audio.play();
				} else {
					console.error('Stream is null or undefined');
				}
			});

			session.on('accepted', () => {
				setCurrentStatus('connected');
			});

			session.on('ended', () => {
				if (isNewIncomingCall) {
					const newCall: Call = {
						cause: 'incoming',
						date: session.start_time,
						address: session.remote_identity.uri.user,
						duration: session.end_time - session.start_time,
					};
					updateCallHistory(newCall);
				}
			});

			session.on('failed', () => {
				if (isNewIncomingCall) {
					const newCall: Call = {
						cause: 'missed',
						date: session.start_time
							? new Date(session.start_time)
							: new Date(),
						address: session.remote_identity.uri.user,
						duration: 0,
					};
					updateCallHistory(newCall);
				}
			});
		});
	};

	const makeCall = (address: string) => {
		if (!phone) {
			console.error('Phone is not initialized');
			return;
		}

		const session = phone.call(address, {
			mediaConstraints: { audio: true, video: false },
		});

		session.on('connecting', () => {
			setIsCalling(true);
			setCurrentStatus('connecting');
		});

		session.on('ended', () => {
			const newCall: Call = {
				cause: 'outgoing',
				date: session.start_time,
				address: session.remote_identity.uri.user,
				duration: session.end_time.getTime() - session.start_time.getTime(),
			};
			updateCallHistory(newCall);
		});

		session.on('failed', () => {
			const newCall: Call = {
				cause: 'failed',
				date: session.start_time ? new Date(session.start_time) : new Date(),
				address: session.remote_identity.uri.user,
				duration: 0,
			};
			updateCallHistory(newCall);
		});
	};

	return (
		<>
			{isRegistered ? (
				<>
					<Calls
						callHistory={callHistory}
						setCallHistory={setCallHistory}
						makeCall={makeCall}
					/>
					{isCall && (
						<CurrentCall
							currentStatus={currentStatus}
							isIncomingCall={isIncomingCall}
							currentSession={currentSession}
						/>
					)}
				</>
			) : (
				<Register registerUser={registerUser} />
			)}
		</>
	);
};

export default App;
