import { DeleteOutlined, PhoneOutlined } from '@ant-design/icons';
import { Button, Flex, Input, List, Space, Typography } from 'antd';
import Item from 'antd/es/list/Item';
import React, { useCallback, useState } from 'react';
import { formatTime, formatDate } from '../utils/formatTime';
import { Call } from '../utils/interfaces';

interface Props {
	callHistory: Call[];
	makeCall: (arg0: string) => void;
	setCallHistory: (arg0: Call[]) => void;
}

const Calls: React.FC<Props> = ({ callHistory, setCallHistory, makeCall }) => {
	const [address, setAddress] = useState<string>('');

	const clearHistory = useCallback(() => {
		setCallHistory([]);
		localStorage.setItem('callHistory', JSON.stringify([]));
	}, [setCallHistory]);

	return (
		<>
			<Space direction='horizontal'>
				<Input
					value={address}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						setAddress(event.target.value);
					}}
					type='text'
				/>
				<Button
					onClick={() => {
						makeCall(address);
					}}
				>
					<PhoneOutlined />
				</Button>
				<Button onClick={clearHistory}>
					<DeleteOutlined />
				</Button>
			</Space>
			<List
				size='large'
				style={{ inlineSize: '100%', overflowY: 'scroll' }}
				bordered
			>
				{callHistory.map(({ date, address, cause, duration }: Call) => (
					<Item key={Math.random()}>
						<Flex
							vertical
							align='center'
						>
							<Typography.Text
								strong
								style={{ textTransform: 'uppercase' }}
								type={`${
									cause === 'failed' || cause === 'missed'
										? 'danger'
										: 'success'
								}`}
							>
								{cause}
							</Typography.Text>
							<Typography.Text type='secondary'>
								{formatTime(duration)}
							</Typography.Text>
						</Flex>
						<Typography.Text strong>{address}</Typography.Text>
						<Flex
							vertical
							align='center'
						>
							<Typography.Text type='secondary'>
								{formatDate(new Date(date).getTime()).date}
							</Typography.Text>
							<Typography.Text type='secondary'>
								{formatDate(new Date(date).getTime()).time}
							</Typography.Text>
						</Flex>
						<Button
							onClick={() => {
								makeCall(`sip:${address}@voip.uiscom.ru`);
							}}
						>
							<PhoneOutlined />
						</Button>
					</Item>
				))}
			</List>
		</>
	);
};

export default Calls;
