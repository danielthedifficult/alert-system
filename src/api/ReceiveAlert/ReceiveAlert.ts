import { HandlerEvent } from "@netlify/functions";
import { EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT, generateAllClearLink, GENERATE_CALL_LIST } from "../lib";
import { makeCall } from "../lib/makeCall";
import { MessageAllMembers } from "../AllClear/AllClear"
import { Imember } from "../lib/member";
import { CLICK_BELOW_IF_ALL_OK } from "../lib/messageTemplates";


const { GET_MEMBERS, GET_MEMBER_INDEX } = require("../lib/");

export const ReceiveAlert = async ({ CALL_INDEX = 0, Command = "", Client, Alert_Type }) => {
	console.log("Starting ReceiveAlert")
	// HACK - ideally, switch to using an env var that is correctly provided by Netlify in both local dev and production
	let DEPLOY_URL = process.env.BASE_URL || "https://alerte.foucauld.org"; // NOTE This is not tested, but it should work.. Might need to switch to DEPLOY_URL, but I think BASE_URL is better as it will point to the expected production URL
	console.log("Using DEPLOY_URL " + DEPLOY_URL)

	if (!Alert_Type) {
		console.error("Alert_Type not defined")
		return { statusCode: 500, body: "Alert_Type is not defined" }
	} else console.log("Alert_Type is defined: " + Alert_Type)

	if (!Client) {
		console.error("Client not defined")
		console.error({ Client, Command })
		return { statusCode: 500, body: "Client not defined" }
	} else console.log("Client is defined:", { Client })

	const MEMBERS = GET_MEMBERS(Client);

	let MEMBER_INDEX = GET_MEMBER_INDEX(CALL_INDEX || "0", MEMBERS);

	const MAX_RETRIES = parseInt(process.env.HOW_MANY_TIMES_TO_CALL_MEMBERS || "1");
	console.log("ReceiveAlert CALLED, MESSAGE is ", CALL_INDEX, Alert_Type, "for MEMBER_INDEX", MEMBER_INDEX)

	if (CALL_INDEX > MEMBERS.length * MAX_RETRIES) {
		console.log("Max retries attained, giving up!")
		return await MessageAllMembers(MEMBERS, (
			(m: Imember) => `${m.fname}, ${MEMBERS[0].fname} a déclenché une alerte, mais nous n'avons pas pu joindre l'un d'entre vous :\n`
				+ GENERATE_CALL_LIST(MEMBERS, m)
				+ "\n" + CLICK_BELOW_IF_ALL_OK + "\n"
				+ generateAllClearLink(MEMBERS.indexOf(m), Client)
		)
		)
	}
	try {
		let callInstructionsUrl = `${DEPLOY_URL}/api/GenerateAlertCallInstructions?Command=${encodeURI(Command)}&CALL_INDEX=${CALL_INDEX}`;
		const statusCallback = `${DEPLOY_URL}/api/ProcessCallResponse?Command=${encodeURI(Command)}&CALL_INDEX=${MEMBER_INDEX}`
		console.log({ MEMBERS })
		let to = MEMBERS[MEMBER_INDEX].phone_number;
		console.log("Calling", to, "for", Client, "because", Alert_Type)
		return await makeCall({ statusCallback, to, callInstructionsUrl })
			.then((call) => {
				console.log(call)
				console.log(
					`Call with SID ${call.sid} to ${to} was created successfully.`
				);
				return { statusCode: 200, body: "ALERT INITIATED" };
			})
			.catch((err) => {
				console.error(`Error creating call: ${err}`);
				return { statusCode: 500, body: "COULD NOT COMPLETE CALL" };
			});



	} catch (e) {
		console.error(e);
	}

};

export const handler = async (event: HandlerEvent) => {
	return await ReceiveAlert(EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT(event))
}