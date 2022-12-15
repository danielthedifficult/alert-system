const accountSid = process.env.DM_TWILIO_ACCOUNT_SID;
const authToken = process.env.DM_TWILIO_AUTH_TOKEN;
const client  = require('twilio')(accountSid, authToken)

export const makeCall = async ({to = "", callInstructionsUrl = "", sid = process.env.DM_TWILIO_ACCOUNT_SID, token = process.env.DM_TWILIO_AUTH_TOKEN}) => {

   return client.calls
   .create({
      statusCallbackUrl: `${process.env.DEPLOY_URL}/api/ProcessCallResponse`,
      statusCallbackEvent: ["completed", "busy", "failed","no-answer"],
      statusCallbackMethod: 'POST',
      url: callInstructionsUrl,
      to,
      from: process.env.TWILIO_FROM_NUMBER,
   })
   .catch(console.error)
}  