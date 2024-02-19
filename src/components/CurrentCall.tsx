import { Button, Flex, Typography } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { Status } from '../utils/interfaces';
import { RTCSession } from 'jssip/lib/RTCSession';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { formatTime } from '../utils/formatTime';

interface Props {
	currentStatus: Status;
	currentSession: RTCSession | null;
}

const CurrentCall: React.FC<Props> = ({ currentStatus, currentSession }) => {
	const [currentSeconds, setCurrentSeconds] = useState<number>(0);
	const [isMuted, setIsMuted] = useState<boolean>(false);
	const [isHolded, setIsHolded] = useState<boolean>(false);

	useEffect(() => {
		const timerId = setInterval(() => {
			if (currentStatus === 'connected') {
				setCurrentSeconds((prev: number) => prev + 1);
			}
		}, 1000);

		return () => {
			clearInterval(timerId);
		};
	}, [currentStatus]);

	const handleCall = useCallback(
		(flag: boolean) => {
			if (currentSession) {
				flag ? currentSession.answer() : currentSession.terminate();
			}
		},
		[currentSession]
	);

	const toggleMute = useCallback(() => {
		setIsMuted((isMuted: boolean) => {
			if (isMuted) {
				currentSession?.unmute();
			} else {
				currentSession?.mute();
			}
			return !isMuted;
		});
	}, [currentSession, setIsMuted]);

	const toggleHold = useCallback(() => {
		setIsHolded((isHolded: boolean) => {
			if (isHolded) {
				currentSession?.unhold();
			} else {
				currentSession?.hold();
			}
			return !isHolded;
		});
	}, [currentSession, setIsHolded]);

	useEffect(() => {
		const handleCallWithHotKeys = (key: KeyboardEvent) => {
			key.code === 'Escape' && handleCall(false);
			key.code === 'Enter' && handleCall(true);
		};

		window.addEventListener('keydown', handleCallWithHotKeys);

		return () => {
			window.removeEventListener('keydown', handleCallWithHotKeys);
		};
	}, [handleCall]);

	return (
		<Flex
			style={{
				marginBlockStart: 'auto',
				inlineSize: '100%',
				textTransform: 'uppercase',
			}}
			justify='space-between'
		>
			<Flex
				align='center'
				gap={'.5em'}
			>
				<Typography.Text
					strong
					type={`${currentStatus === 'ended' ? 'danger' : 'success'}`}
				>
					{currentStatus}
				</Typography.Text>
				{(currentStatus === 'connected' || currentStatus === 'ended') && (
					<>
						<Typography.Text type='secondary'>
							{formatTime(currentSeconds * 1000)}
						</Typography.Text>
						<Typography.Text
							mark
							strong
						>
							{(currentSession?.isOnHold().local ||
								currentSession?.isOnHold().remote) &&
								'holded'}
						</Typography.Text>
					</>
				)}
			</Flex>
			<Flex
				gap={'.5em'}
				align='center'
			>
				{' '}
				{currentStatus === 'connected' && (
					<>
						<Button onClick={toggleMute}>{!isMuted ? 'mute' : 'unmute'}</Button>
						<Button onClick={toggleHold}>
							{!isHolded ? 'hold' : 'unhold'}
						</Button>
					</>
				)}
				{currentStatus === 'incoming' && (
					<Button
						style={{ background: '#0f07' }}
						onClick={() => {
							handleCall(true);
						}}
					>
						<CheckOutlined />
					</Button>
				)}
				<Button
					style={{ background: '#f007' }}
					onClick={() => {
						handleCall(false);
					}}
				>
					<CloseOutlined />
				</Button>
			</Flex>
		</Flex>
	);
};

export default CurrentCall;
