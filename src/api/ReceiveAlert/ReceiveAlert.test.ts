import { should_alert } from "./ReceiveAlert";


jest.mock("../lib/makeCall");
jest.mock("../AllClear/AllClear");
jest.mock("../lib", () => ({
    GET_MEMBERS: jest.fn(),
    GET_MEMBER_INDEX: jest.fn(),
}));


describe.only("should_alert", () => {
    const originalEnv = process.env;
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules()
        process.env = { ...originalEnv }
    });

    test("should return 500 if Alert_Type is not defined", async () => {

        const result = should_alert({ Command: "testClient", Alert_Type: undefined, Client: "testClient" });

        expect(result).toEqual({ statusCode: 500, body: "Alert_Type is not defined" });
    });

    test("should return 500 if Client is not defined", async () => {
        const result = should_alert({ Command: "TMF", Alert_Type: "testClient", Client: undefined });
        expect(result).toEqual({ statusCode: 500, body: "Client not defined" });
    });

    test("should return false if Client matches IGNORE_CLIENTS_REGEX", () => {
        process.env.IGNORE_CLIENTS_REGEX = "^ABC";
        const Client = "ABC";
        const Alert_Type = "testAlert";
        const Command = `${Client} ${Alert_Type}`;
        const result = should_alert({ Command, Client, Alert_Type });
        expect(result).toBe(false);
    });

    test("should return false if Alert_Type matches IGNORE_ALERT_TYPES_REGEX", () => {
        process.env.IGNORE_ALERT_TYPES_REGEX = "testAlert$";
        const Client = "ABC";
        const Alert_Type = "testAlert";
        const Command = `${Client} ${Alert_Type}`;
        const result = should_alert({ Command, Client, Alert_Type });
        expect(result).toBe(false);
    });

    test("should return false if Command matches IGNORE_COMMANDS_REGEX", () => {
        const Client = "ABC";
        const Alert_Type = "testAlert";
        const Command = `${Client} ${Alert_Type}`;
        process.env.IGNORE_COMMANDS_REGEX = "^" + Command + "$";
        const result = should_alert({ Command, Client, Alert_Type });
        expect(result).toBe(false);
    });

    test("should return true if no ignore conditions are met", () => {
        process.env.IGNORE_CLIENTS_REGEX = "^XYZ";
        process.env.IGNORE_ALERT_TYPES_REGEX = "obscureAlert$";
        process.env.IGNORE_COMMANDS_REGEX = "^XYZ obscureAlert$";
        const Client = "ABC";
        const Alert_Type = "testAlert";
        const Command = `${Client} ${Alert_Type}`;
        const result = should_alert({ Command, Client, Alert_Type });
        expect(result).toBe(true);
    });
});