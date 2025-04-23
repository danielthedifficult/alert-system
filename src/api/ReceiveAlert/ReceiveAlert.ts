import { HandlerEvent } from "@netlify/functions";
import { EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT, generateAllClearLink, GENERATE_CALL_LIST } from "../lib";
import { makeCall } from "../lib/makeCall";
import { MessageAllMembers } from "../AllClear/AllClear"
import { Imember } from "../lib/member";
import { CLICK_BELOW_IF_ALL_OK } from "../lib/messageTemplates";


const { GET_MEMBERS, GET_MEMBER_INDEX } = require("../lib/");

export const ReceiveAlert = async ({ CALL_INDEX = 0, Command = "", Client, Alert_Type }: { CALL_INDEX?: number, Command: string, Client: string, Alert_Type: string }) => {
	console.log("Starting ReceiveAlert")
	// HACK - ideally, switch to using an env var that is correctly provided by Netlify in both local dev and production
	let DEPLOY_URL = process.env.BASE_URL || "https://alerte.foucauld.org"; // NOTE This is not tested, but it should work.. Might need to switch to DEPLOY_URL, but I think BASE_URL is better as it will point to the expected production URL
	console.log("Using DEPLOY_URL " + DEPLOY_URL)

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

export const should_alert = (
	{ Command, Client, Alert_Type }:
		{ Command: string, Client: string | undefined, Alert_Type: string | undefined }
) => {

	// Check for the presence of the required parameters
	if (!Alert_Type) {
		console.error("Alert_Type not defined")
		return { statusCode: 500, body: "Alert_Type is not defined" }
	} else console.log("Alert_Type is defined: " + Alert_Type)

	if (!Client) {
		console.error("Client not defined")
		console.error({ Client, Command })
		return { statusCode: 500, body: "Client not defined" }
	} else console.log("Client is defined:", { Client })

	// Is this a specific M2M SMS command that we should ignore?
	const IGNORE_COMMANDS_REGEX = process.env.IGNORE_COMMANDS_REGEX || false;
	if (IGNORE_COMMANDS_REGEX) {
		const regex = new RegExp(IGNORE_COMMANDS_REGEX);
		if (regex.test(Command)) {
			console.log("Ignoring alert for client", Client, "and alert type", Alert_Type, "because it matches", IGNORE_COMMANDS_REGEX);
			return false;
		}
	}

	// Is this an alert type that we should ignore?
	const IGNORE_ALERT_TYPES_REGEX = process.env.IGNORE_ALERT_TYPES_REGEX || false;
	if (IGNORE_ALERT_TYPES_REGEX) {
		const regex = new RegExp(IGNORE_ALERT_TYPES_REGEX);
		if (regex.test(Alert_Type)) {
			console.log("Ignoring alert ", Alert_Type, "because it matches", IGNORE_ALERT_TYPES_REGEX);
			return false;
		} else console.log("Alert type", Alert_Type, "does not match", IGNORE_ALERT_TYPES_REGEX)
	} else console.log("IGNORE_ALERT_TYPES_REGEX not defined, alerting for client", Client, "and alert type", Alert_Type)

	// Is this a client that we should ignore?
	const IGNORE_CLIENTS_REGEX = process.env.IGNORE_CLIENTS_REGEX || false;
	if (IGNORE_CLIENTS_REGEX) {
		const regex = new RegExp(IGNORE_CLIENTS_REGEX);
		if (regex.test(Client)) {
			console.log("Ignoring alert for client", Client, "because it matches", IGNORE_CLIENTS_REGEX);
			return false;

		}
	}

	// Otherwise, we should alert
	console.log("Alerting for client", Client, "and alert type", Alert_Type);
	return true;
}

export const handler = async (event: HandlerEvent) => {
	const PARAMS = EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT(event)
	const shouldAlert = should_alert(PARAMS)
	if (!shouldAlert) {
		console.log("Alert should not be sent, returning 200")
		return {
			statusCode: 200,
			body: "Alert ignored due to server-side config"
		}
	}
	return await ReceiveAlert(PARAMS)
}
