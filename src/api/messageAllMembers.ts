// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
import { Imember } from "./lib/iface";
import { sendSMS } from "./lib/sendSMS";

const { parse } = require('querystring');

export const messageAllMembers = async (MEMBERS : Array<Imember>, RESPONSIBLE_PARTY:Imember, MESSAGE:string) => {
  try {
    // trigger success condition
    console.log(RESPONSIBLE_PARTY.fname,"has said they are handling it! Hurrah! Message everyone...")
    
    let messages = MEMBERS
      .filter(m => m.phone_number !== RESPONSIBLE_PARTY.phone_number)
      .map(async member => {
        const { fname, phone_number } = member;
        const SMS_TEXT = [
          `${fname}, nous vous avons appellé car une alarme a été déclenché chez Marie Francoise de Pitray. Entretemps, ${RESPONSIBLE_PARTY.fname} ${RESPONSIBLE_PARTY.lname} a accepté de s'en occuper.`,
        ].join("\n");
        
        let to = member.phone_number;
        return await sendSMS(phone_number, SMS_TEXT)
    });
    
    return await Promise.allSettled(messages)
    .then((results) => {
      console.log(results)
       return {
         statusCode: 200,
        //  headers: { "content-type": "text/xml" },
         body: `${results.length} MEMBERS_MESSAGED`
       };
    })
    .catch((e) => {
      console.error(e)
      return {
        statusCode: 500,
        //  headers: { "content-type": "text/xml" },
         body: e.message
    }
   });

  } catch (error:any) {
    console.error(error)
    return { statusCode: 500, body: error.toString() }
  }
}