import { EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT } from "../lib";
import { makeCall } from "../lib/makeCall";
import { MessageAllMembers } from "../AllClear/AllClear"
import { Imember } from "../lib/member";
import { CLICK_BELOW_IF_ALL_OK } from "../lib/messageTemplates";

// SET PROC VARS HERE TO AVOID RESTARTING SERVER
process.env.NODE_ENV = "test"


const { MEMBERS, GET_MEMBER_INDEX } = require("../lib/");

let Command; // Defined outside handler so it can persist

module.exports.ReceiveAlert = async (event) => {
	console.log("Starting ReceiveAlert")
	let { CALL_INDEX = 0, Command, Body } = EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT(event);

	Command = Command || Body || "ALERT_TRIGGERED";

	let MEMBER_INDEX = GET_MEMBER_INDEX(CALL_INDEX || "0")

	console.log("ReceiveAlert CALLED, COMMAND is ", Command, "for MEMBER_INDEX", MEMBER_INDEX)

		process.env.DEPLOY_URL = "https://alert-system-744d13.netlify.live"; // update this in dev when relaunching the server
		try {
			let callInstructionsUrl = `${process.env.DEPLOY_URL}/api/GenerateAlertCallInstructions?Command=${Command}&CALL_INDEX=${CALL_INDEX}`;
			let to = MEMBERS[MEMBER_INDEX].phone_number;
			// to = "+33761852939" // override for testing

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

module.exports.handler = module.exports.ReceiveAlert;