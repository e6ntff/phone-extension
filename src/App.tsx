import React, { useState, useEffect, useCallback, useMemo } from 'react';
import JsSIP from 'jssip';
import Register, { Config } from './components/Register';
import Calls from './components/Calls';
import CurrentCall from './components/CurrentCall';
import { Call, Status } from './utils/interfaces';
import { RTCSession } from 'jssip/lib/RTCSession';
import callTemplates from './utils/callTemplates';

const App: React.FC = () => {
	const [phone, setPhone] = useState<JsSIP.UA | null>(null);
	const [currentSession, setCurrentSession] = useState<RTCSession | null>(null);
	const [callHistory, setCallHistory] = useState<Call[]>([]);
	const [isRegistered, setIsRegistered] = useState<boolean>(false);
	const [currentStatus, setCurrentStatus] = useState<Status>('incoming');
	const [isCall, setIsCalling] = useState<boolean>(false);

	const audio = useMemo(() => new Audio(), []);
	audio.autoplay = true;
	audio.volume = 1;

	useEffect(() => {
		const storedCallHistory = localStorage.getItem('callHistory');
		if (storedCallHistory) {
			setCallHistory(JSON.parse(storedCallHistory));
		}
	}, []);

	const updateCallHistory = useCallback(
		(call: Call) => {
			setCallHistory((prevHistory: Call[]) => {
				const newHistory = [call, ...prevHistory];
				localStorage.setItem('callHistory', JSON.stringify(newHistory));
				return newHistory;
			});
			setCurrentStatus('ended');
			setTimeout(() => {
				setIsCalling(false);
			}, 1000);
		},
		[setCallHistory, setCurrentStatus, setIsCalling]
	);

	const registerUser = useCallback(
		(configuration: Config) => {
			const phoneInstance = new JsSIP.UA(configuration);

			phoneInstance.on('registered', () => {
				setIsRegistered(true);
			});

			phoneInstance.on('unregistered', () => {
				console.error('Registration Error!');
			});

			phoneInstance.start();
			setPhone(phoneInstance);

			phoneInstance.on('newRTCSession', (event) => {
				const session = event.session;
				setCurrentSession(session);
				const isNewIncomingCall = session.direction === 'incoming';

				if (isNewIncomingCall) {
					setCurrentStatus('incoming');
					setIsCalling(true);
				}

				session.on('connecting', () => {
					setIsCalling(true);
					setCurrentStatus('connecting');
					session.connection.addEventListener('track', (event) => {
						if (event.streams && event.streams[0]) {
							audio.srcObject = event.streams[0];
						}
					});
				});

				session.on('accepted', () => {
					setCurrentStatus('connected');
					const remoteStream = session.connection.getRemoteStreams()[0];
					if (remoteStream) {
						audio.srcObject = remoteStream;
					}
				});

				session.on('ended', () => {
					if (isNewIncomingCall) {
						updateCallHistory(callTemplates.incomingEnded(session));
					}
				});

				session.on('failed', () => {
					if (isNewIncomingCall) {
						updateCallHistory(callTemplates.incomingFailed(session));
					}
				});
			});
		},
		[updateCallHistory, audio]
	);

	const makeCall = useCallback(
		(address: string) => {
			if (!phone) {
				console.error('Phone is not initialized');
				return;
			}

			const session = phone.call(address, {
				mediaConstraints: { audio: true, video: false },
			});

			session.on('ended', () => {
				updateCallHistory(callTemplates.outgoingEnded(session));
			});

			session.on('failed', (e) => {
				console.log(e);
				updateCallHistory(callTemplates.outgoingFailed(session));
			});
		},
		[phone, updateCallHistory]
	);

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
