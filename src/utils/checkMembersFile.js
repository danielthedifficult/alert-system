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
try {
	JSON.parse(process.env.MEMBERS);
} catch (e) {
	console.error("🚨 STOPPING BUILD - MEMBERS env var is not valid JSON");
	throw new Error("INVALID_MEMBERS");
}
