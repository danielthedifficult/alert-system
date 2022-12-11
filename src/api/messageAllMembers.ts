// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
var accountSid = process.env.DM_TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.DM_TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const client  = require('twilio')(accountSid, authToken)

const { parse } = require('querystring');

export const messageAllMembers = async (MEMBERS, RESPONSIBLE_PARTY, MESSAGE) => {
  try {
    // trigger success condition
    console.log(RESPONSIBLE_PARTY.fname,"'s has said they are handling it! Hurrah! Message everyone...")
    
    let messages = MEMBERS.map(async member => {
      const { fname, phone_number } = member;
      const SMS_TEXT = [
         `${fname}, nous vous avons appellé car une alarme a été déclenché chez Marie Francoise de Pitray. Entretemps, ${RESPONSIBLE_PARTY.fname} ${RESPONSIBLE_PARTY.lname} a accepté de s'en occuper.`,
       ].join("\n");
       
       console.log("SMS: Would have sent:", SMS_TEXT)
       let to = member.phone_number;
       to = "+33761852939" // override for testing;
       // Send contact SMS
       client.messages
         .create({
           body: 
           SMS_TEXT,
           from: process.env.TWILIO_FROM_NUMBER, 
           to
         })
         .then(message => console.log(`Sent SMS to ${fname}:`, message.sid))
         .catch(console.error)
         
    });
    return await Promise.allSettled(messages)
    .then(() => {
       return {
         statusCode: 200,
        //  headers: { "content-type": "text/xml" },
         body: "MEMBERS_MESSAGED"
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

  } catch (error) {
    console.error(error)
    return { statusCode: 500, body: error.toString() }
  }
}