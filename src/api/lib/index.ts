
import { Imember } from "./member"
import { HandlerEvent } from "@netlify/functions";


export const MEMBERS = JSON.parse(process.env.MEMBERS || "{}");

export const VOICE_PARAMS = {
	voice: process.env.TWILIO_VOICE_GENDER,
	language: process.env.TWILIO_VOICE_LANGUAGE,
}
export const GET_INITIALS = (NAME: string) => NAME.split("-").map(n => `${n.slice(0, 1)}.`).join(" ")

export const GENERATE_CALL_LIST = (members: Array<Imember>, member: Imember) => members
	.filter((t) => joiner(t) !== joiner(member)) // remove the member him/herself
	.map((m) => `${GET_INITIALS(m.fname)} ${m.lname} : ${m.phone_number}`)
	.join(`\n\n`); // add newlines for formatting


// if input < total member length return the member
// if input >= total member length, return the member, starting with 1 (skip the 'alerting' person themselves when repeating)
export const GET_MEMBER_INDEX = (input: (string)) => {
	let index = parseInt(input);
	if (isNaN(index)) throw new Error("Input is NaN");
	else return (index % MEMBERS.length)
}

const { parse } = require('querystring');
export const EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT = ({ queryStringParameters = {}, body }: HandlerEvent) => {
	let POST = {};
	try {
		POST = JSON.parse(body || "{}")
	} catch (e) {
		POST = parse(body)
	}
	let PARAMS: any = { ...POST, ...queryStringParameters }
	console.log("Extracted params:", PARAMS)
	return PARAMS;
}

/**
 * 
 * @param obj 
 * @returns string of all properties strung together for an easy comparison. Won't work if props are not in same order, which is unpredicatble in JS, right?
 */
export function joiner(obj: Object) {
	return Object.values(obj).join("")
}

export const generateAllClearLink = (id: number) => `alerte.foucauld.org/ToutVaBien?mid=${id}`