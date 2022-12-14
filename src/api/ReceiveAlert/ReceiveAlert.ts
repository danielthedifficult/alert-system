var accountSid = process.env.DM_TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.DM_TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console

const client = require("twilio")(accountSid, authToken, {
	// region: 'eu1',
	// edge: 'france',
});

const { MEMBERS, GET_MEMBER_INDEX } = require("../lib/");

let Command; // Defined outside handler so it can persist

export const handler = async (event) => {

	const GET = event.queryStringParameters || {};
	let MEMBER_INDEX = GET_MEMBER_INDEX(GET.CALL_INDEX || "0")

	if (GET.Command) Command = GET.Command;
	console.log("TRIGGER ALERT CALLED, COMMAND is ", Command, "for MEMBER_INDEX", MEMBER_INDEX)

		process.env.DEPLOY_URL = "https://alert-system-1b2f57.netlify.live"; // update this in dev when relaunching the server
		try {
			let url = `${process.env.DEPLOY_URL}/api/GenerateAlertCallInstructions?Command=${Command}&CALL_INDEX=${MEMBER_INDEX}`;
			let to = MEMBERS[MEMBER_INDEX].phone_number;
			to = "+33761852939" // override for testing

			await client.calls
				.create({
					statusCallback: `${process.env.DEPLOY_URL}/api/ProcessCallResponse`,
					statusCallbackEvent: ["completed", "busy", "failed","no-answer"],
					statusCallbackMethod: 'POST',
					url,
					to,
					from: process.env.TWILIO_FROM_NUMBER,
				})
				.then((call) => {
					console.log(
						`Call with SID ${call.sid} to ${to} was created successfully.`
					);
				})
				.catch((err) => {
					console.error(`Error creating call: ${err}`);
					return { statusCode: 500, body: "COULD NOT COMPLETE CALL" };
				});

		return { statusCode: 200, body: "ALERT INITIATED" };

	} catch (e) {
		console.error(e);
	}

};