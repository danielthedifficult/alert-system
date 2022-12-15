import { HandlerEvent } from "@netlify/functions";
import { EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT, generateAllClearLink, GENERATE_CALL_LIST } from "../lib";
import { makeCall } from "../lib/makeCall";
import { MessageAllMembers } from "../AllClear/AllClear"
import { Imember } from "../lib/member";
import { CLICK_BELOW_IF_ALL_OK } from "../lib/messageTemplates";


const { MEMBERS, GET_MEMBER_INDEX } = require("../lib/");

let Command; // Defined outside handler so it can persist

export const ReceiveAlert = async ({CALL_INDEX = 0, Command = "", Body = ""}) => {
	console.log("Starting ReceiveAlert")
	// process.env.DEPLOY_URL = "https://alert-system-f7e8fc.netlify.live"; // update this in dev when relaunching the server

	Command = Command || Body || "ALERT_TRIGGERED";

	let MEMBER_INDEX = GET_MEMBER_INDEX(CALL_INDEX || "0");

	const MAX_RETRIES = parseInt(process.env.HOW_MANY_TIMES_TO_CALL_MEMBERS || "1");
	console.log("ReceiveAlert CALLED, COMMAND is ", CALL_INDEX, Command, "for MEMBER_INDEX", MEMBER_INDEX)
	
	if (CALL_INDEX > MEMBERS.length * MAX_RETRIES) {
		console.log("Max retries attained, giving up!")
		return await MessageAllMembers(MEMBERS, (	
				(m:Imember) => `${m.fname}, Marie Françoise a déclenché une alerte, mais nous n'avons pas pu joindre l'un d'entre vous. Débrouillez-vous :\n` 
				+ GENERATE_CALL_LIST(MEMBERS, m)
				+ "\n" + CLICK_BELOW_IF_ALL_OK + "\n"
				+ generateAllClearLink(MEMBERS.indexOf(m))
			) 
		)
	}
	try {
			let callInstructionsUrl = `${process.env.DEPLOY_URL}/api/GenerateAlertCallInstructions?Command=${Command}&CALL_INDEX=${CALL_INDEX}`;
			let to = MEMBERS[MEMBER_INDEX].phone_number;


			return makeCall({to, callInstructionsUrl})
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

export const handler = async (event:HandlerEvent) => {
	return await ReceiveAlert(EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT(event))
}