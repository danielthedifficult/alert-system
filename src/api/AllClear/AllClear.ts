// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
import { HandlerEvent } from "@netlify/functions";
import {
	GET_MEMBERS,
	EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT,
	joiner,
} from "../lib";
import { Imember } from "../lib/member";
import { sendSMS } from "../lib/sendSMS";

const { parse } = require("querystring");

export const MessageAllMembers = async (
	MEMBERS_TO_MESSAGE: Array<Imember>,
	BUILD_MESSAGE: Function
) => {
	try {
		let messages = MEMBERS_TO_MESSAGE.map(async (member) => {
			const { phone_number } = member;
			let to = member.phone_number;
			return await sendSMS(phone_number, BUILD_MESSAGE(member));
		});

		return await Promise.all(messages)
			.then((results) => {
				console.log(results);
				return {
					statusCode: 200,
					//  headers: { "content-type": "text/xml" },
					body: `${results.length} Membres prévenu.`,
				};
			})
			.catch((e) => {
				console.error(e);
				return {
					statusCode: 500,
					//  headers: { "content-type": "text/xml" },
					body: e.message,
				};
			});
	} catch (error: any) {
		console.error(error);
		return { statusCode: 500, body: error.toString() };
	}
};

export const AllClear = async (event: HandlerEvent) => {
	console.log("AllClear starting...");
	const { MEMBERS, Command, Client, mid } = EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT(event);
	console.log("MEMBERS", MEMBERS);
	let RESPONSIBLE_PARTY: Imember = MEMBERS[mid];
	console.log(RESPONSIBLE_PARTY, MEMBERS);
	// trigger success condition
	console.log(
		RESPONSIBLE_PARTY.fname,
		"has said they are handling it! Hurrah! Messaging",
		MEMBERS.length,
		"people..."
	);

	let BUILD_MESSAGE = ({ fname = "Cher ami" }) =>
		`${fname}, une alarme a été déclenché chez Marie Francoise de Pitray, mais heureusement ${RESPONSIBLE_PARTY.fname} ${RESPONSIBLE_PARTY.lname} déclare que tout va bien.`;
	let MEMBERS_TO_MESSAGE = MEMBERS.filter(
		(m: Imember) => joiner(m) !== joiner(MEMBERS[mid])
	); // filtering on phone number didn't work if  I wanted to use my own on multiple members for testing

	console.log(BUILD_MESSAGE(RESPONSIBLE_PARTY), MEMBERS_TO_MESSAGE);
	return await MessageAllMembers(MEMBERS_TO_MESSAGE, BUILD_MESSAGE);
};

export const handler = module.exports.AllClear;
