var accountSid = process.env.DM_TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.DM_TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const client  = require('twilio')(accountSid, authToken)


export const sendSMS = async (to : string, body : string, sid:string|undefined = process.env.DM_TWILIO_ACCOUNT_SID, token:string|undefined = process.env.DM_TWILIO_AUTH_TOKEN) => {
   
   
   let from = process.env.TWILIO_FROM_NUMBER;
   // Send contact SMS
   return client.messages
     .create({
       body,
       from, 
       to
     })
     .then((result: { sid: any; }) => process.env.NODE_ENV === "test" 
               ? console.log(`TEST SMS (${result.sid}) would have sent to ${to}:`, body) 
               : console.log(`Sent SMS (${result.sid}) to ${to}:\n`, body)
      )
     .catch(console.error)
}