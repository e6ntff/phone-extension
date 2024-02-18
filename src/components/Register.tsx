import { Button, Form, Input } from 'antd';
import React, { useCallback, useState } from 'react';
import JsSIP from 'jssip';

export interface Config {
	sockets: JsSIP.WebSocketInterface[];
	uri: string;
	password: string;
}

interface Props {
	registerUser: (arg0: Config) => void;
}

const Register: React.FC<Props> = ({ registerUser }) => {
	const [values, setValues] = useState({
		server: 'voip.uiscom.ru',
		login: '0332057',
		password: 'fuP7YqwR_R',
	});

	const compileConfiguration = useCallback(() => {
		const { server, login, password } = values;

		const configuration = {
			sockets: [new JsSIP.WebSocketInterface(`wss://${server}`)],
			uri: `sip:${login}@${server}`,
			password: password,
		};

		registerUser(configuration);
	}, [registerUser, values]);

	const changeValues = useCallback((event: any) => {
		const { name, value } = event.target;

		setValues((prevConfiguration: any) => {
			const newConfiguration = {
				...prevConfiguration,
				[name]: value,
			};

			return newConfiguration;
		});
	}, []);

	return (
		<>
			<Form
				labelCol={{
					span: 8,
				}}
				wrapperCol={{
					span: 12,
				}}
				onChange={changeValues}
			>
				<Form.Item label='Server'>
					<Input
						type='text'
						required
						name='server'
						value={values.server}
					/>
				</Form.Item>
				<Form.Item label='Login'>
					<Input
						type='text'
						required
						name='login'
						value={values.login}
					/>
				</Form.Item>
				<Form.Item label='Password'>
					<Input
						type='password'
						required
						name='password'
						value={values.password}
					/>
				</Form.Item>
			</Form>
			<Button onClick={compileConfiguration}>Register</Button>
		</>
	);
};

export default Register;
