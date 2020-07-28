import React from "react";
import * as _ from "lodash";
import "./VideoSingle.view.scss";
import { Link } from "react-router-dom";
import Button from "../../components/button/Button";
import ReactPlayer from 'react-player';


const VideoSingle = ({ socket, match }) => {
  const [messages, setMessages] = React.useState([]);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [queue, setQueue] = React.useState([]);
  const [currentVideo, setCurrentVideo] = React.useState('https://www.youtube.com/watch?v=aD_xkjDIAFM');

  const roomName = match.params.roomName;
  let videoPlayerReference = React.useRef(null)

	React.useEffect(() => {

		socket.emit("joining_room", roomName);

    socket.on("room_data", (roomData) => {
			// setIsTyping(roomData.isTyping);
			// setUsers(roomData.users);
			setQueue(roomData.queue);

			// const { title, privateroom, category, maxUsers } = roomData;
			// setRoomInfo({
			// 	title: title,
			// 	private: privateroom,
			// 	category: category,
			// 	maxUsers: maxUsers,
			// })
		});

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

    socket.on("playpause_changing", (isPlayingState) => {
      console.log('RECEIVED STATE', isPlayingState)
      setIsPlaying(isPlayingState);
    })  

    socket.on("next_video", (newPlaylist, newVideo) => {
      console.log('RECEIVED NEXTVIDEO', newPlaylist, newVideo)
      setQueue(newPlaylist);
      setCurrentVideo(newVideo);
    })

    socket.on("video_progress", (currentTime) => {
      videoPlayerReference.current.seekTo(currentTime, 'seconds');
    })

  }, []);

  const sendVideoState = (videoState) => {
    socket.emit("playpause_changing", roomName, videoState);
  }

  const playNextVideoInPlaylist = () => {
    socket.emit("next_video", roomName)
  }

  const handleProgress = (state) => {
    console.log('RECEIVED STATE', state);
    socket.emit("video_progress", roomName, state);
  }
    // const ref = (e) => {
  //   console.log('ref', e);

  // }

	return (
		<section className="videosingle">
			<section className="videosection">
        <section className="videosection__header">
        <h1>Video Room Name</h1>
        </section>
        {/* COMPONENT HERE */}
        <section classname="videosection__video">
          <ReactPlayer 
            className="videosection__video__player"
            width='auto'
            height='auto'
            ref={videoPlayerReference}
            url={currentVideo}
            playing={isPlaying}
            controls={true}
            volume={null}
            muted={true}
            onProgress={(e) => handleProgress(e)}
            onPlay={() => sendVideoState(true)}
            onPause={() => sendVideoState(false)}
            onEnded={() => playNextVideoInPlaylist()}
          />
          </section>        
        <section className="videosection__content">
          <section className="videosection__content__info">
            <h2>Cat Licks Paws (10 Hour Version)</h2>
            <h4>1.123.345 Views</h4>
          </section>
          <section className="videosection__content__queue">
            <section className="videosection__content__queue__header">
              <h2>Playlist</h2>
              <Button type="primary">Add to Queue</Button>
            </section>
            <section className="videosection__content__queue__videos">
              {queue.map((video, index) => (<h1 key={index}>{video}</h1>))}
            </section>
          </section>
        </section>
        
      </section>
      <section className="videochatsection">
        <div className="videochatsection__header">
          <h1>Chat</h1>
        </div>
        <div className="videochatsection__chat">
          <h1>testing</h1>
        </div>
        {/* chat component here */}
      </section>
		</section>
	);
};

export default VideoSingle;
