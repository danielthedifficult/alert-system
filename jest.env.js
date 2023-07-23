process.env.DM_TWILIO_ACCOUNT_SID = "AC31ae97c511555aa5f2227318f0d120eb"
process.env.DM_TWILIO_AUTH_TOKEN="0a41cae355617501db18e843f1b4f29a"
process.env.TWILIO_FROM_NUMBER="+15005550006"
process.env.TEST_MEMBERS = JSON.stringify([
	{ fname: "Marie-Françoise", lname: "Mulroy", phone_number: "+33761852939" },
	{ fname: "Daniel 1", lname: "Mulroy", phone_number: "+33761852939" },
	{ fname: "Genevieve", lname: "Mulroy", phone_number: "+33761852939" },
	{ fname: "Luc", lname: "Mulroy", phone_number: "+33761852939" },
	{ fname: "Odile", lname: "Mulroy", phone_number: "+33761852939" },
])

console.log("setting up vars", process.env.TEST_MEMBERS)