require("dotenv").config();
const {
    STSClient,
    GetCallerIdentityCommand
} = require("@aws-sdk/client-sts");


const client = new STSClient({
    region: process.env.AWS_REGION
});


const testAwsConnection = async () => {

    try {

        const command =
            new GetCallerIdentityCommand({});

        const response =
            await client.send(command);

        console.log(
            "AWS connection successful!"
        );

        console.log(
            "Account:",
            response.Account
        );

        console.log(
            "User/Role:",
            response.Arn
        );

    } catch (error) {

        console.error(
            "AWS connection failed:"
        );

        console.error(
            error.message
        );
    }
};


testAwsConnection();