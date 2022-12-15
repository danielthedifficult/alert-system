// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
var accountSid = process.env.DM_TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.DM_TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const client  = require('twilio')(accountSid, authToken)
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const { MEMBERS, VOICE_PARAMS, GET_MEMBER_INDEX } = require("../lib/");

import { EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT, GENERATE_CALL_LIST } from "../lib";
import { ALERT_CANCELLED, YOURE_OUR_ONLY_HOPE, WE_WILL_KEEP_LOOKING } from "../lib/messageTemplates";
import { sendSMS } from "../lib/sendSMS";
import { ReceiveAlert } from "../ReceiveAlert/ReceiveAlert";
import { handler } from "./OLD_CallInstructions";

module.exports.ProcessCallResponse = async (event, context) => {
  const PARAMS = EXTRACT_GET_AND_POST_PARAMS_FROM_EVENT(event)
  try {
    // trigger success condition
    console.log("PROCESS CALL RESPONSE CALLED:", PARAMS)
    const { Called, Digits, Command, CALL_INDEX } = PARAMS;
    console.log({Command, Called, Digits})
    
    if (!Command || !CALL_INDEX) {
      console.log("Received Twilio Status:", PARAMS)
      return { statusCode: 200 }
    }

    const MEMBER_INDEX = GET_MEMBER_INDEX(CALL_INDEX);
    const { fname, ...MEMBER } = MEMBERS[MEMBER_INDEX];
    
    const response = new VoiceResponse();
    // Pressing 1 = Someone says they can handle it
    if (parseInt(Digits) === 1) {

      console.log(fname,"'s handling it! Hurrah!")
      const CONTACT_LIST = GENERATE_CALL_LIST(MEMBERS, MEMBER);
      const CONFIRMATION_SMS = MEMBER_INDEX === 0 // If the 'victim' presses 1 to cancel, then send an acknowledgement SMS
      ? ALERT_CANCELLED
      : [ // Otherwise send a thank you + instructions SMS to the rest of the people on the list.
        `${fname}, nous vous remercions d'avoir accepté d'aider ${MEMBERS[0].fname} a la ferme de Rennetour, Saint-Viatre.`,
        `Cette alerte vous est parvenue car ${ Command === "FALL_TRIGGERED" ? `le bracelet de ${MEMBERS[0].fname} a détecté une chute` : `${MEMBERS[0].fname} l'a déclenchée` }`,
        "",
        `D'autres numèros qui pourraient vous etre utile :`,
        `${CONTACT_LIST}`,
        `CLIQUEZ LE LIEN CI DESSOUS SI VOUS AVEZ CONFIRMÉ QUE LA SITUATION EST OK :`,
        "[lien eventuel]",

        //,
      ].join("\n");
      
      console.log("Sending SMS:", CONFIRMATION_SMS)
      let to = MEMBER.phone_number;
      // to = "+33761852939" // override for testing;

      sendSMS(to, CONFIRMATION_SMS)

      response.say(
        MEMBER_INDEX === 0
        ? "L'alerte a été annullé"
        : YOURE_OUR_ONLY_HOPE(fname)
        , VOICE_PARAMS)
    }
    else {
      // Pressing 2, hanging up, etc.
      console.log(fname, "can't handle it, let's keep trying...")
      response.say(WE_WILL_KEEP_LOOKING, VOICE_PARAMS)
      
      // Call next member
      await ReceiveAlert({
        queryStringParameters: {
          Command,
          CALL_INDEX: parseInt(CALL_INDEX) + 1 // TODO wrap around / handle end of list behavior
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

module.exports.handler = module.exports.ProcessCallResponse;

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