import React from "react";
import * as _ from "lodash";
import Button from "../../components/button/Button";
import Paragraph from "../../components/paragraph/Paragraph";
import "./Homepage.view.scss";

const Homepage = ({
	socket,
	history,
	visitorData,
	setVisitorData,
	formError,
	setFormError,
	triedLocation,
}) => {
	const handleFormData = (event) => {
		setVisitorData({ ...visitorData, name: event.target.value });
	};

	const loginNewVisitor = (event) => {
		event.preventDefault();

		if (visitorData.name === "") {
			setFormError(true);
			return;
		}

		setFormError(false);

		socket.emit("connect_visitor", visitorData);

		socket.on("connect_visitor", () => {
			localStorage.setItem("userData", JSON.stringify(visitorData));
			if (triedLocation !== "/") {
				history.push(triedLocation);
			} else {
				history.push("/dashboard/videos");
			}
		});
	};

	const name = _.get(visitorData, "name", "");

	return (
		<section className="homepage">
			<section className="homepage__spacer">
				<section className="homepage__spacer__content">
					<h1>
						Hey there, <span>{name}</span>.
					</h1>
					<Paragraph>
						Welcome to Limbo Hangouts! That one place to hangout with friends
						and strangers and communicate over and on different kind of Media
						environments.
					</Paragraph>
					<section className="homepage__spacer__content__form">
						<form onSubmit={(e) => loginNewVisitor(e)}>
							<label>Username</label>
							<input
								type="text"
								value={name}
								onChange={(e) => handleFormData(e)}
								maxLength="25"
							/>
							{formError && (
								<p className="homepage__spacer__content__form__error">
									Please enter a valid username..
								</p>
							)}
							<Button type="primary">Enter hangouts</Button>
						</form>
					</section>
				</section>
			</section>
			<section className="homepage__spacer homepage__spacer--background" />
		</section>
	);
};

export default Homepage;
