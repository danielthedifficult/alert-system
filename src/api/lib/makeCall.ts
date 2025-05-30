const accountSid = process.env.DM_TWILIO_ACCOUNT_SID;
const authToken = process.env.DM_TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken)

export const makeCall = async (
   { statusCallback, to = "", callInstructionsUrl = "" }
      : { statusCallback: string, to: string, callInstructionsUrl: string }
) => {

   return client.calls
      .create({
         statusCallback,
         statusCallbackEvent: ["completed"],
         statusCallbackMethod: 'POST',
         url: callInstructionsUrl,
         timeout: 15,
         to,
         from: process.env.TWILIO_FROM_NUMBER,
      })
      .catch(console.error)
}  