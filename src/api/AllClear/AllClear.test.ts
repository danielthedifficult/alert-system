import { GET_MEMBERS } from "../lib";
const { AllClear } = require("./AllClear");

test("Tests messaging all members", async () => {
   const MEMBERS = GET_MEMBERS("TEST")
   console.log(MEMBERS, process.env.TWILIO_FROM_NUMBER, process.env.DM_TWILIO_ACCOUNT_SID)
   let THE_CHOSEN_ONE = Math.round(Math.random() * (MEMBERS.length - 1));

   console.log("CHOSEN ONE CHECK", THE_CHOSEN_ONE, MEMBERS.length)
   expect(await AllClear({ queryStringParameters: { mid: THE_CHOSEN_ONE } })).toEqual({
      statusCode: 200,
      body: `${MEMBERS.length - 1} MEMBERS_MESSAGED` // subtract one because we don't message the responsible party
   })

   // let MAX_MEMBERS = MEMBERS.length
   // for (let i = 0; i < MEMBERS.length * 2; i++) {
   //    console.log("index:",i,"","member:", GET_MEMBER_INDEX(i))
   //    expect(GET_MEMBER_INDEX(i)).toBeLessThan(MEMBERS.length)
   // }
})
