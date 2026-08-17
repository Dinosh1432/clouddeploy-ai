const {
    SSMClient,
    SendCommandCommand,
    GetCommandInvocationCommand
} = require("@aws-sdk/client-ssm");


const ssmClient = new SSMClient({
    region: process.env.AWS_REGION
});


const INSTANCE_ID =
    process.env.EC2_INSTANCE_ID;


/*
    Execute shell commands on EC2
*/
const executeCommand = async (commands) => {

    console.log(
        "Executing commands on EC2:",
        commands
    );

    const command =
        new SendCommandCommand({

            InstanceIds: [
                INSTANCE_ID
            ],

            DocumentName:
                "AWS-RunShellScript",

            Parameters: {
                commands
            }
        });


    const response =
        await ssmClient.send(command);


    const commandId =
        response.Command.CommandId;


    console.log(
        "SSM Command ID:",
        commandId
    );


    let status = "Pending";
    let result;


    for (let i = 0; i < 30; i++) {

        await new Promise(
            resolve =>
                setTimeout(resolve, 2000)
        );


        result =
            await ssmClient.send(
                new GetCommandInvocationCommand({

                    CommandId: commandId,

                    InstanceId: INSTANCE_ID

                })
            );


        status =
            result.Status;


        console.log(
            "Command status:",
            status
        );


        if (
            status === "Success" ||
            status === "Failed" ||
            status === "Cancelled" ||
            status === "TimedOut"
        ) {
            break;
        }
    }


    if (status !== "Success") {

        throw new Error(
            `EC2 command failed: ${status}\n` +
            result?.StandardErrorContent
        );
    }


    return {

        commandId,

        status,

        output:
            result.StandardOutputContent,

        error:
            result.StandardErrorContent

    };
};
const verifyBackend = async () => {

    console.log("Verifying backend on EC2...");

    const result = await executeCommand([
        "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000"
    ]);

    const statusCode = result.output.trim();

    console.log(
        "Backend HTTP status:",
        statusCode
    );

    if (
        statusCode !== "200" &&
        statusCode !== "404"
    ) {
        throw new Error(
            `Backend verification failed. HTTP status: ${statusCode}`
        );
    }

    return {
        verified: true,
        statusCode
    };
};

/*
    Deploy backend application to EC2
*/
const deployBackend = async () => {

    console.log(
        "Starting backend deployment..."
    );


    const commands = [

        "cd /home/ubuntu/clouddeploy-ai",

        "git pull",

        "cd server",

        "npm install",

        "pm2 restart clouddeploy-backend || pm2 start server.js --name clouddeploy-backend",

        "pm2 save",

        "pm2 pid clouddeploy-backend"

    ];


    const result =
        await executeCommand(commands);


    console.log(
        "Backend deployment completed!"
    );


    return result;
};


module.exports = {

    executeCommand,
    verifyBackend,

    deployBackend

};