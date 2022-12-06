const VoiceResponse = require('twilio').twiml.VoiceResponse;
const { MEMBERS, VOICE_PARAMS } = require("./lib/");

export const handler = async (event) => {
  console.log("ALERT CALL INSTRUCTIONS CALLED WITH:", event.queryStringParameters)
  const { Command, MEMBER_INDEX } = event.queryStringParameters;
  const { fname } = MEMBERS[MEMBER_INDEX];
  let incidentType : string;

  switch (Command) {
    case "FALL_TRIGGERED":
      incidentType = "Le bracelet de Marie-Françoise a constaté une chute a";
      break;
    case "ALERT_TRIGGERED":
    default:
      incidentType = "Marie-Françoise a déclenché une alerte depuis";
      break;
  }

  // Use the Twilio Node.js SDK to build an XML response
  const response = new VoiceResponse();

  // Use the <Gather> verb to collect user input
  const gather = response.gather({ numDigits: 1, action: `/api/handleCallResponse?Command=${Command}&MEMBER_INDEX=${MEMBER_INDEX}` });
  const prompt = `Attention ${fname}, ${incidentType} la ferme de Rennetour. 
  Si vous pouvez vous en occuper, appuyez sur "1". 
  Si vous ne pouvez pas intervenir, appuyer sur "2" pour que nous contactons la personne suivante.
  Je le répète, ${fname}, ${incidentType} la ferme de Rennetour.
  Si vous pouvez vous en occuper, appuyez sur "1". 
  Si vous ne pouvez pas intervenir, appuyer sur "2" pour que nous contactons la personne suivante.`;
  // console.log(prompt)
  gather.say(prompt, VOICE_PARAMS)

  response.redirect({method: "GET"}, `/api/triggerAlert?MEMBER_INDEX=${MEMBER_INDEX+1}&Command=${Command}`);
  // Render the response as XML in reply to the webhook request
  return {
    statusCode: 200,
    headers: { "content-type": "text/xml" },
    body: response.toString()
  };

};