import React, { useState } from 'react';
import JsSIP from 'jssip';

const SoftphoneExtension = () => {
	const [phone, setPhone] = useState<JsSIP.UA | null>(null);

	const registerUser = () => {
		const configuration = {
			sockets: [new JsSIP.WebSocketInterface('wss://voip.uiscom.ru')],
			uri: 'sip:0332057@voip.uiscom.ru',
			password: 'fuP7YqwR_R',
		};

		const phoneInstance = new JsSIP.UA(configuration);

		// Обработчик события 'connected'
		phoneInstance.on('connected', () => {
			console.log('connected');
		});

		// Обработчик события 'connecting'
		phoneInstance.on('connecting', () => {
			console.log('connecting');
		});

		// Обработчик события 'registered'
		phoneInstance.on('registered', () => {
			console.log('Phone is registered');
		});

		// Обработчик события 'unregistered'
		phoneInstance.on('unregistered', () => {
			console.log('Phone is unregistered');
		});

		// Начать процесс регистрации
		phoneInstance.start();
		setPhone(phoneInstance);

		// Обработчик для события входящего звонка
		phoneInstance.on('newRTCSession', (e) => {
			const session = e.session;

			session.on('addstream', (e) => {
				const audio = new Audio();
				if (e.stream) {
					audio.srcObject = e.stream;
					audio.play();
				} else {
					console.error('Stream is null or undefined');
				}
			});

			console.log(session);

			if (session._direction === 'incoming') {
				session.answer({
					mediaConstraints: { audio: true, video: false },
				});
			}

			session.on('accepted', () => {
				console.log('Call accepted');
			});

			session.on('ended', () => {
				console.log('Call ended');
			});
		});
	};

	const makeCall = () => {
		if (!phone) {
			console.error('Phone is not initialized');
			return;
		}

		const session = phone.call('sip:0332056@voip.uiscom.ru', {
			mediaConstraints: { audio: true, video: false },
		});

		session.on('connecting', () => {
			console.log('Connecting call');
		});

		session.on('failed', (data) => {
			console.log('failed', data);
		});

		session.on('peerconnection', (data) => {
			console.log('Peer connection established');
		});

		session.on('ended', (data) => {
			console.log('Call ended:', data);
		});
	};

	return (
		<>
			<button onClick={registerUser}>Register User</button>
			<button onClick={makeCall}>Make Call</button>
		</>
	);
};

export default SoftphoneExtension;
