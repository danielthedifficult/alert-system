// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
var accountSid = process.env.DM_TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.DM_TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const client  = require('twilio')(accountSid, authToken)
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const { MEMBERS, VOICE_PARAMS } = require("./lib/");

const { parse } = require('querystring');

import { GENERATE_CALL_LIST } from "./lib";
import { handler as triggerAlert } from "./triggerAlert";

export const handler = async (event, context) => {
  try {
    // trigger success condition
    console.log("CALL RESPONSE CALLED:", event.queryStringParameters, parse(event.body))
    const { Command, MEMBER_INDEX } = event.queryStringParameters;
    const { Called, Digits } = parse(event.body);
    console.log({Command, Called, Digits})
    
    if (!Command || !MEMBER_INDEX) {
      console.log("Received Twilio Status:", parse(event.body))
      return { statusCode: 200 }
    }

    const MEMBER = MEMBERS[MEMBER_INDEX];
    const { fname } = MEMBER;
    
    const response = new VoiceResponse();
    // Pressing 1 = Someone says they can handle it
    if (parseInt(Digits) === 1) {

      console.log(fname,"'s handling it! Hurrah!")
      const CONTACT_LIST = GENERATE_CALL_LIST(MEMBERS, MEMBER);
      const CONFIRMATION_SMS = [
        `${fname}, nous vous remercions d'avoir accepté d'aider Tante Marie Francoise a la ferme de Rennetour, Saint-Viatre.`,
        `Cette alerte vous est parvenu car ${ Command === "FALL_TRIGGERED" ? "le bracelet a détecté une chute" : "Marie Fracoise l'a déclenché" }`,
        `Le téléphone de Marie-Francoise : 06 16 28 55 63`,
        "",
        `D'autres numèros qui vous pourrait etre utile :`,
        `${CONTACT_LIST}`,
        "",
        `CLIQUEZ LE LIEN CI DESSOUS SI VOUS AVEZ CONFIRMÉ QUE LA SITUATION EST OK :`,
        //,
      ].join("\n");
      
      console.log("SMS: Would have sent:", CONFIRMATION_SMS)
      let to = MEMBER.phone_number;
      to = "+33761852939" // override for testing;

      // Send contact SMS
      client.messages
        .create({
          body: 
          CONFIRMATION_SMS,
          from: process.env.TWILIO_FROM_NUMBER, 
          to
        })
        .then(message => console.log(`Sent SMS to ${fname}:`, message.sid))
        .catch(console.error)

      response.say(`Merci ${fname}, nous comptons sur vous en toute urgence.`, VOICE_PARAMS)
    }
    else {
      // Pressing 2, hanging up, etc.
      console.log(fname, "can't handle it, let's keep trying...")
      response.say("Nous allons continuer a appeller pour trouver un intervenant, et nous vous tiendrons a jour via SMS.", VOICE_PARAMS)
      
      // Call next member
      await triggerAlert({
        queryStringParameters: {
          Command,
          MEMBER_INDEX: parseInt(MEMBER_INDEX) + 1 // TODO wrap around / handle end of list behavior
        }
      })
    }
  // Render the response as XML in reply to the webhook request
  return {
    statusCode: 200,
    headers: { "content-type": "text/xml" },
    body: response.toString()
  };

  } catch (error) {
    console.error(error)
    return { statusCode: 500, body: error.toString() }
  }
}



// CALL DIGIT RESPONSE:
// {
//   'AccountSid' => 'AC75e56322da1c3d47afcab7c2d4cb9e01',
//   'ApiVersion' => '2010-04-01',
//   'CallSid' => 'CA0bbba62736371afa9564bc025c071a46',
//   'CallStatus' => 'in-progress',
//   'Called' => '+33761852939',
//   'CalledCity' => '',
//   'CalledCountry' => 'FR',
//   'CalledState' => '',
//   'CalledZip' => '',
//   'Caller' => '+33644645153',
//   'CallerCity' => '',
//   'CallerCountry' => 'FR',
//   'CallerState' => '',
//   'CallerZip' => '',
//   'Digits' => '1',
//   'Direction' => 'outbound-api',
//   'FinishedOnKey' => '',
//   'From' => '+33644645153',
//   'FromCity' => '',
//   'FromCountry' => 'FR',
//   'FromState' => '',
//   'FromZip' => '',
//   'To' => '+33761852939',
//   'ToCity' => '',
//   'ToCountry' => 'FR',
//   'ToState' => '',
//   'ToZip' => '',
//   'msg' => 'Gather End' }


  // CALL STATUS RESPONSE
  // {
  //   'Called' => '+33761852939',
  //   'ToState' => '',
  //   'CallerCountry' => 'FR',
  //   'Direction' => 'outbound-api',
  //   'Timestamp' => 'Sat, 10 Dec 2022 18:59:52 +0000',
  //   'CallbackSource' => 'call-progress-events',
  //   'SipResponseCode' => '200',
  //   'CallerState' => '',
  //   'ToZip' => '',
  //   'SequenceNumber' => '2',
  //   'CallSid' => 'CAf34f6b0356ecd1102dc411d7e7cf2cbb',
  //   'To' => '+33761852939',
  //   'CallerZip' => '',
  //   'ToCountry' => 'FR',
  //   'CalledZip' => '',
  //   'ApiVersion' => '2010-04-01',
  //   'CalledCity' => '',
  //   'CallStatus' => 'completed',
  //   'Duration' => '1',
  //   'From' => '+33644645153',
  //   'CallDuration' => '16',
  //   'AccountSid' => 'AC75e56322da1c3d47afcab7c2d4cb9e01',
  //   'CalledCountry' => 'FR',
  //   'CallerCity' => '',
  //   'ToCity' => '',
  //   'FromCountry' => 'FR',
  //   'Caller' => '+33644645153',
  //   'FromCity' => '',
  //   'CalledState' => '',
  //   'FromZip' => '',
  //   'FromState' => '' }