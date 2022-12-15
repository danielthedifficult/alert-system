// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
import { HandlerEvent } from "@netlify/functions";
import { MEMBERS, EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT } from "../lib";
import { Imember } from "../lib/member";
import { sendSMS } from "../lib/sendSMS";

const { parse } = require('querystring');

module.exports.MessageAllMembers = async (MEMBERS : Array<Imember>, BUILD_MESSAGE:Function) => {
  try {
    
    let messages = MEMBERS
      .map(async member => {
        const { fname, phone_number } = member;        
        let to = member.phone_number;
        return await sendSMS(phone_number, BUILD_MESSAGE(fname, ))
    });
    
    return await Promise.all(messages)
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

module.exports.AllClear = async (event:HandlerEvent) => {
  console.log("AllClear starting...")
  const PARAMS = EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT(event);
  console.log("PARAMS:",PARAMS)
  let RESPONSIBLE_PARTY:Imember = MEMBERS[PARAMS.MEMBER_ID];

  // trigger success condition
  console.log(RESPONSIBLE_PARTY.fname,"has said they are handling it! Hurrah! Message everyone...")
  
  let BUILD_MESSAGE = (fname:string) => `${fname}, nous vous avons appellé car une alarme a été déclenché chez Marie Francoise de Pitray. Entretemps, ${RESPONSIBLE_PARTY.fname} ${RESPONSIBLE_PARTY.lname} a accepté de s'en occuper.`;
  let MEMBERS_TO_MESSAGE = MEMBERS.filter((m:Imember) => m.phone_number !== RESPONSIBLE_PARTY.phone_number)

  return await module.exports.MessageAllMembers(MEMBERS_TO_MESSAGE, BUILD_MESSAGE)
}

module.exports.handler = module.exports.AllClear