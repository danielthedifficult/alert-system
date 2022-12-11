const { GET_MEMBER_INDEX } = require(".");
const { MEMBERS } = require("./members");

test("Tests member cycling function", () => {
   let MAX_MEMBERS = MEMBERS.length
   for (let i = 0; i < MEMBERS.length * 2; i++) {
      console.log("index:",i,"","member:", GET_MEMBER_INDEX(i))
      expect(GET_MEMBER_INDEX(i)).toBeLessThan(MEMBERS.length)
   }
})
