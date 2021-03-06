import React from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import axios from "axios";
import {
  uniqueNamesGenerator,
  adjectives,
  animals
} from "unique-names-generator";
import openSocket from "socket.io-client";

import Homepage from "./modules/homepage/Homepage.view";
import Videos from "./modules/videos/Videos.view";
import Chats from "./modules/chats/Chats.view";
import VideoSingle from "./modules/videosingle/VideoSingle.view";
import ChatSingle from "./modules/chatsingle/ChatSingle.view";

import Layout from "./components/layout/Layout";
import Sidebar from "./components/sidebar/Sidebar";

const generateNameConfig = {
  dictionaries: [adjectives, animals],
  style: "capital",
  separator: " ",
  length: 2
};

const socket = openSocket("https://hangouts-server.herokuapp.com/");

const App = ({ history }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [triedLocation, setTriedLocation] = React.useState("/");
  const [formError, setFormError] = React.useState(false);
  const [visitorData, setVisitorData] = React.useState({
    name: "",
    country: "",
    countryCode: ""
  });

  const showSidebarArray = ["/"];
  const currentPage = history.location.pathname;
  const showSidebar = !showSidebarArray.includes(currentPage);

  React.useEffect(() => {
    if (currentPage === "/" && visitorData.name === "") {
      generateUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location.pathname]);

  React.useEffect(() => {
    const sessionVisitorData = JSON.parse(localStorage.getItem("userData"));

    if (!sessionVisitorData) {
      setTriedLocation(currentPage);
      history.push("/");
      generateUserData();
    } else {
      const visitor = {
        name: sessionVisitorData.name,
        countryCode: sessionVisitorData.countryCode,
        country: sessionVisitorData.country
      };

      socket.emit("connect_visitor", visitor);

      if (currentPage === "/") {
        history.push("/dashboard/videos");
      } else {
        history.push(currentPage);
      }
    }

    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateUserData = () => {
    axios
      .get("http://geoplugin.net/json.gp")
      .then((res) => {
        const { geoplugin_countryCode, geoplugin_countryName } = res.data;

        const visitor = {
          name: uniqueNamesGenerator(generateNameConfig),
          countryCode: geoplugin_countryCode,
          country: geoplugin_countryName
        };
        setVisitorData(visitor);
      })
      .catch((err) => {
        if (err.message) {
          const visitor = {
            name: uniqueNamesGenerator(generateNameConfig),
            countryCode: "SE",
            country: "Sweden"
          };
          setVisitorData(visitor);
        }
      });
  };

  return (
    <>
      <Switch>
        {isLoading ? (
          <>
            <h1>The application is firing up!</h1>
            <p>This shouldn't take more than 5 seconds.</p>
          </>
        ) : (
          <>
            {!showSidebar ? (
              <Route
                path="/"
                exact
                render={(props) => (
                  <Homepage
                    {...props}
                    socket={socket}
                    visitorData={visitorData}
                    setVisitorData={setVisitorData}
                    formError={formError}
                    setFormError={setFormError}
                    triedLocation={triedLocation}
                  />
                )}
              />
            ) : (
              <main>
                <Sidebar socket={socket} />
                <Layout>
                  <Route
                    path="/dashboard/videos/"
                    exact
                    render={(props) => <Videos {...props} socket={socket} />}
                  />
                  <Route
                    path="/dashboard/videos/:roomName/"
                    render={(props) => (
                      <VideoSingle {...props} socket={socket} />
                    )}
                  />
                  <Route
                    path="/dashboard/chats/"
                    exact
                    render={(props) => <Chats {...props} socket={socket} />}
                  />
                  <Route
                    path="/dashboard/chats/:roomName/"
                    render={(props) => (
                      <ChatSingle {...props} socket={socket} />
                    )}
                  />
                </Layout>
              </main>
            )}
          </>
        )}
      </Switch>
    </>
  );
};

export default withRouter(App);
