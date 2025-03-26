import { GET_MEMBER_INDEX, GET_MEMBERS } from "../lib";
// const validate = require('w3c-xml-validator')
const { GenerateAlertCallInstructions } = require("./GenerateAlertCallInstructions");

describe("Tests Generating Twiml instructions", () => {

   test("Get victim's message", async () => {
      let CALL_INDEX = 0
      let TWIML_INSTRUCTIONS = await GenerateAlertCallInstructions({ queryStringParameters: { Command: "ALERT_TRIGGERED", CALL_INDEX } })
      expect(TWIML_INSTRUCTIONS.statusCode).toEqual(200)
      expect(TWIML_INSTRUCTIONS.headers).toEqual({ 'content-type': 'text/xml' })
      expect(TWIML_INSTRUCTIONS.body).toContain(MEMBERS[0].fname)

   })

   test("Get first user's message", async () => {
      let MEMBERS = GET_MEMBERS("TEST")
      let CALL_INDEX = "1"
      let TWIML_INSTRUCTIONS = await GenerateAlertCallInstructions({ queryStringParameters: { Command: "ALERT_TRIGGERED", CALL_INDEX } })
      expect(TWIML_INSTRUCTIONS.statusCode).toEqual(200)
      expect(TWIML_INSTRUCTIONS.headers).toEqual({ 'content-type': 'text/xml' })
      expect(TWIML_INSTRUCTIONS.body).toContain(MEMBERS[GET_MEMBER_INDEX(CALL_INDEX, MEMBERS)].fname)
   })

})