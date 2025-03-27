const schema = {
	type: "object",
	properties: {
		fname: { type: "string" },
		lname: { type: "string" },
		phone_number: { type: "string", regexp: /\+33[7|6]\d{8}/.toString() },
	},
	required: ["fname, lname", "phone_number"],
	additionalProperties: false,
};
for (MEMBERS of ["TMF_MEMBERS", "GPJ_MEMBERS"]) {
	try {
		JSON.parse(process.env.MEMBERS);
	} catch (e) {
		console.error(`🚨 STOPPING BUILD - env var '${MEMBERS}' is not valid JSON`);
		throw new Error("INVALID_MEMBERS");
	}
}
