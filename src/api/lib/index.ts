import { MEMBERS } from "./members";
import { Imember } from "./iface"
export { MEMBERS } from "./members";

export const VOICE_PARAMS =  {
	voice: process.env.TWILIO_VOICE_GENDER,
	language: process.env.TWILIO_VOICE_LANGUAGE,
 }
export const GET_INITIALS = (NAME : string) => NAME.split("-").map(n => `${n.slice(0,1)}.`).join(" ")

export const GENERATE_CALL_LIST = (members:Array<Imember>, member : Imember) =>  members
			.filter((t) => t.phone_number !== member.phone_number) // remove the member him/herself
			.map((m) => `${GET_INITIALS(m.fname)} ${m.lname} : ${m.phone_number}`)
			.join(`\n\n`); // add newlines for formatting


// if input < total member length return the member
// if input >= total member length, return the member, starting with 1 (skip the 'alerting' person themselves when repeating)
export const GET_MEMBER_INDEX = (input) => {
	input = parseInt(input);
	if (isNaN(input)) throw new Error("Input is NaN");
	else return (input % MEMBERS.length)
	// if (input < MEMBERS.length) return input;
	// else if (input >= MEMBERS.length) return input % MEMBERS.length + 1;
}
