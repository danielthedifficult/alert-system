interface Imember { fname: string, lname: string, phone_number: string };
export { MEMBERS } from "./members";

export const VOICE_PARAMS =  {
	voice: process.env.TWILIO_VOICE_GENDER,
	language: process.env.TWILIO_VOICE_LANGUAGE,
 }
 export const GET_INITIALS = (NAME : string) => NAME.split("-").map(n => `${n.slice(0,1)}.`).join(" ")

 export const GENERATE_CALL_LIST = (members : Array<Imember>, member : Imember) =>  members
				.filter((t) => t.phone_number !== member.phone_number) // remove the member him/herself
				.map((m) => `${GET_INITIALS(m.fname)} ${m.lname} : ${m.phone_number}`)
				.join(`\n\n`); // add newlines for formatting
