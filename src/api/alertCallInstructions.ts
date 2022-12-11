const VoiceResponse = require('twilio').twiml.VoiceResponse;
const { MEMBERS, VOICE_PARAMS } = require("./lib/");

export const handler = async (event) => {
  console.log("ALERT CALL INSTRUCTIONS CALLED WITH:", event.queryStringParameters)
  const { Command, CALL_INDEX } = event.queryStringParameters;
  const MEMBER_INDEX = GET_MEMBER_INDEX(CALL_INDEX)
  const MEMBER = MEMBERS[MEMBER_INDEX];

  let incidentType : string;

  switch (Command) {
    case "FALL_TRIGGERED":
      incidentType = `Le bracelet de ${MEMBERS[0].fname} a constaté une chute a`;
      break;
    case "ALERT_TRIGGERED":
    default:
      incidentType = `${MEMBERS[0].fname} a déclenché une alerte depuis`;
      break;
  }

  // Use the Twilio Node.js SDK to build an XML response
  const response = new VoiceResponse();

  // Use the <Gather> verb to collect user input
  const gather = response.gather({ numDigits: 1, action: `/api/handleCallResponse?Command=${Command}&CALL_INDEX=${MEMBER_INDEX}` });
  const prompt = parseInt(MEMBER_INDEX) === 0
    ? `Bonjour ${MEMBERS[0].fname}, le systeme d'alerte a été déclenché. Appuyez sur 1 pour désactiver, ou 2 pour continuer.`
    : `Attention ${MEMBER.fname}, ${incidentType} la ferme de Rennetour. 
      Si vous pouvez vous en occuper, appuyez sur "1". 
      Si vous ne pouvez pas intervenir, appuyer sur "2" pour que nous contactions la personne suivante.
      Je le répète, ${MEMBER.fname}, ${incidentType} la ferme de Rennetour.
      Si vous pouvez vous en occuper, appuyez sur "1". 
      Si vous ne pouvez pas intervenir, appuyer sur "2" pour que nous contactions la personne suivante.`;
      // console.log(prompt)
  gather.say(prompt, VOICE_PARAMS)

  response.redirect({method: "GET"}, `/api/triggerAlert?MEMBER_INDEX=${CALL_INDEX+1}&Command=${Command}`);
  // Render the response as XML in reply to the webhook request
  return {
    statusCode: 200,
    headers: { "content-type": "text/xml" },
    body: response.toString()
  };

};