import React from "react";
import * as _ from "lodash";
import "./VideoSingle.view.scss";
import { Link } from "react-router-dom";

const VideoSingle = ({ socket, match }) => {
	const [messages, setMessages] = React.useState([]);

	React.useEffect(() => {
		const roomName = match.params.roomName;
		console.log(roomName, "IS CHANGING AT RANDOM TIMES");

		socket.emit("joining_room", roomName);

		socket.on("message", (messageObject) => {
			setMessages((prevState) => {
				const message = {
					name: messageObject.user,
					message: `${messageObject.user} has ${messageObject.type} the chatroom`,
					timestamp: new Date(),
					type: "join",
				};

				return [...prevState, message];
			});
		});
	}, []);

	return (
		<div className="videosingle">
			<h1>VideoSingle</h1>

			<div className="chat">
				<p>MESSAGES</p>
				{messages.map((message, index) => (
					<div key={index}>{message.message}</div>
				))}
			</div>
		</div>
	);
};

export default VideoSingle;
