
const {
    SSMClient,
    SendCommandCommand,
    GetCommandInvocationCommand
} = require("@aws-sdk/client-ssm");


// ==========================================
// AWS SSM CLIENT
// ==========================================

const ssmClient = new SSMClient({
    region: process.env.AWS_REGION
});

const INSTANCE_ID = process.env.EC2_INSTANCE_ID;

const EC2_PUBLIC_IP =
    process.env.EC2_PUBLIC_IP || "3.111.169.23";


// ==========================================
// CREATE PROJECT SLUG
// ==========================================

const createProjectSlug = (projectName) => {

    return projectName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

};


// ==========================================
// EXECUTE SSM COMMAND
// ==========================================

const executeCommand = async (commands) => {

    console.log("Executing commands on EC2:", commands);

    const command = new SendCommandCommand({
        InstanceIds: [INSTANCE_ID],
        DocumentName: "AWS-RunShellScript",
        Parameters: {
            commands
        }
    });

    const response = await ssmClient.send(command);

    const commandId = response.Command.CommandId;

    console.log("SSM Command ID:", commandId);

    let status = "Pending";
    let result;

    for (let i = 0; i < 150; i++) {

        await new Promise(resolve =>
            setTimeout(resolve, 2000)
        );

        result = await ssmClient.send(
            new GetCommandInvocationCommand({
                CommandId: commandId,
                InstanceId: INSTANCE_ID
            })
        );

        status = result.Status;

        console.log(
            `Command status: ${status} (${i + 1}/150)`
        );

        // ==========================================
        // IMPORTANT SSM DEBUG INFORMATION
        // ==========================================

        console.log(
            "StatusDetails:",
            result.StatusDetails
        );

        console.log(
            "ResponseCode:",
            result.ResponseCode
        );

        console.log(
            "ExecutionStartDateTime:",
            result.ExecutionStartDateTime
        );

        console.log(
            "ExecutionEndDateTime:",
            result.ExecutionEndDateTime
        );

        if (result.StandardOutputContent) {
            console.log(
                "EC2 OUTPUT:",
                result.StandardOutputContent
            );
        }

        if (result.StandardErrorContent) {
            console.log(
                "EC2 ERROR:",
                result.StandardErrorContent
            );
        }

        // ==========================================
        // COMMAND FINISHED
        // ==========================================

        if (
            status === "Success" ||
            status === "Failed" ||
            status === "Cancelled" ||
            status === "TimedOut" ||
            status === "Cancelling"
        ) {
            break;
        }
    }

    // ==========================================
    // TIMEOUT
    // ==========================================

    if (
        status === "Pending" ||
        status === "InProgress"
    ) {
        throw new Error(
            `EC2 command timed out. Status: ${status}`
        );
    }

    const output =
        result?.StandardOutputContent || "";

    const error =
        result?.StandardErrorContent || "";

    console.log(
        "========== FINAL SSM DEBUG =========="
    );

    console.log(
        "STATUS:",
        result?.Status
    );

    console.log(
        "STATUS DETAILS:",
        result?.StatusDetails
    );

    console.log(
        "RESPONSE CODE:",
        result?.ResponseCode
    );

    console.log(
        "STDOUT:",
        output
    );

    console.log(
        "STDERR:",
        error
    );

    console.log(
        "====================================="
    );

    // ==========================================
    // FAILURE
    // ==========================================

    if (status !== "Success") {

        throw new Error(

            `EC2 command failed: ${status}\n\n` +

            `StatusDetails: ${result?.StatusDetails}\n` +

            `ResponseCode: ${result?.ResponseCode}\n\n` +

            `STDOUT:\n${output}\n\n` +

            `STDERR:\n${error}`

        );
    }

    return {
        commandId,
        status,
        output,
        error,
        statusDetails: result?.StatusDetails,
        responseCode: result?.ResponseCode
    };
};


// ==========================================
// NGINX CONFIGURATION
// ==========================================

const configureNginx = async (
    projectName,
    port
) => {

    const projectSlug =
        createProjectSlug(
            projectName
        );


    console.log(
        `Configuring Nginx for ${projectSlug} -> port ${port}`
    );


    const nginxConfig = `

location /${projectSlug}/api/ {

    proxy_pass http://127.0.0.1:${port}/api/;

    proxy_http_version 1.1;

    proxy_set_header Upgrade $http_upgrade;

    proxy_set_header Connection "upgrade";

    proxy_set_header Host $host;

    proxy_cache_bypass $http_upgrade;

}

`;


    const escapedConfig =
        nginxConfig

            .replace(
                /\\/g,
                "\\\\"
            )

            .replace(
                /"/g,
                '\\"'
            )

            .replace(
                /\$/g,
                "\\$"
            );


    const commands = [

        // Create directory
        "sudo mkdir -p /etc/nginx/clouddeploy-projects",


        // Create project nginx config
        `echo "${escapedConfig}" | sudo tee /etc/nginx/clouddeploy-projects/${projectSlug}.conf > /dev/null`,


        // Add include if not already present
        "sudo grep -q 'clouddeploy-projects' /etc/nginx/sites-enabled/default || sudo sed -i '/server_name _;/a\\    include /etc/nginx/clouddeploy-projects/*.conf;' /etc/nginx/sites-enabled/default",


        // Validate nginx
        "sudo nginx -t",


        // Reload nginx
        "sudo systemctl reload nginx"

    ];


    const result =
        await executeCommand(
            commands
        );


    console.log(
        `Nginx configured successfully for ${projectSlug}`
    );


    return {

        projectSlug,

        port,

        apiUrl:
            `http://${EC2_PUBLIC_IP}/${projectSlug}/api`

    };

};


// ==========================================
// VERIFY BACKEND
// ==========================================

const verifyBackend = async (
    port
) => {

    console.log(
        `Verifying backend on EC2 port: ${port}`
    );


    const result =
        await executeCommand([

            `curl -s -o /dev/null -w '%{http_code}' http://localhost:${port}`

        ]);


    const statusCode =
        result.output.trim();


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


    console.log(
        "Backend verification successful"
    );


    return {

        verified: true,

        statusCode,

        port

    };

};


// ==========================================
// DEPLOY BACKEND
// ==========================================

const deployBackend = async (
    repositoryUrl,
    projectName
) => {

    console.log(
        "Starting backend deployment..."
    );


    const appDirectory =
        `/home/ubuntu/deployments/${projectName}`;


    const processName =
        `clouddeploy-${projectName}`;


    const portFile =
        `${appDirectory}/port.txt`;


    const commands = [

        // ==================================
        // CREATE DEPLOYMENT DIRECTORY
        // ==================================

        "mkdir -p /home/ubuntu/deployments",


        // ==================================
        // REMOVE OLD PM2 PROCESS
        // ==================================

        `pm2 delete ${processName} || true`,


        // ==================================
        // REMOVE OLD PROJECT
        // ==================================

        `rm -rf ${appDirectory}`,


        // ==================================
        // CLONE REPOSITORY
        // ==================================

        `git clone ${repositoryUrl} ${appDirectory}`,


        // ==================================
        // RESTORE ENVIRONMENT FILE
        // ==================================

        `cp /home/ubuntu/deployments/env/clouddeploy-ai.env ${appDirectory}/server/.env`,


        // ==================================
        // SECURE ENVIRONMENT FILE
        // ==================================

        `chmod 600 ${appDirectory}/server/.env`,


        // ==================================
        // INSTALL DEPENDENCIES
        // ==================================

        `cd ${appDirectory}/server`,

        "npm install",


        // ==================================
        // FIND AVAILABLE PORT
        // ==================================

        `port=5001; while ss -ltn | awk '{print $4}' | grep -q ":$port$"; do port=$((port+1)); done; echo "$port" > ${portFile}; echo "PORT_SELECTED=$port"`,


        // ==================================
        // VERIFY PORT FILE
        // ==================================

        `test -s ${portFile} && echo "SELECTED_PORT=$(cat ${portFile})" || { echo "ERROR: port.txt is empty"; exit 1; }`,


        // ==================================
        // START PM2
        // ==================================

        `PORT=$(cat ${portFile}) pm2 start server.js --name ${processName} --cwd ${appDirectory}/server --update-env`,


        // ==================================
        // SAVE PM2
        // ==================================

        "pm2 save",


        // ==================================
        // GET PM2 PID
        // ==================================

        `pm2 pid ${processName}`,


        // ==================================
        // SHOW LISTENING PORTS
        // ==================================

        `ss -ltnp | grep -E ':500[0-9]|:501[0-9]' || true`,


        // ==================================
        // OUTPUT DEPLOYED PORT
        // ==================================

        `echo "DEPLOYED_PORT=$(cat ${portFile})"`,


        // ==================================
        // STRONG PORT MARKER
        // ==================================

        `printf 'CLOUDDEPLOY_PORT=%s\\n' "$(cat ${portFile})"`

    ];


    // ==========================================
    // EXECUTE EC2 DEPLOYMENT
    // ==========================================

    const result =
        await executeCommand(
            commands
        );


    console.log(
        "Backend deployment completed!"
    );


    // ==========================================
    // DEBUG OUTPUT
    // ==========================================

    console.log(
        "========== EC2 DEPLOYMENT OUTPUT =========="
    );

    console.log(
        result.output
    );

    console.log(
        "==========================================="
    );


    // ==========================================
    // FIND PORT
    // ==========================================

    let portMatch =
        result.output.match(
            /DEPLOYED_PORT\s*=\s*(\d+)/
        );


    // ==========================================
    // FALLBACK
    // ==========================================

    if (!portMatch) {

        portMatch =
            result.output.match(
                /CLOUDDEPLOY_PORT\s*=\s*(\d+)/
            );

    }


    // ==========================================
    // SECOND FALLBACK
    // ==========================================

    if (!portMatch) {

        portMatch =
            result.output.match(
                /SELECTED_PORT\s*=\s*(\d+)/
            );

    }


    // ==========================================
    // THIRD FALLBACK
    // ==========================================

    if (!portMatch) {

        portMatch =
            result.output.match(
                /PORT_SELECTED\s*=\s*(\d+)/
            );

    }


    // ==========================================
    // PORT NOT FOUND
    // ==========================================

    if (!portMatch) {

        throw new Error(

            "Could not determine deployed backend port.\n\n" +

            "SSM Output:\n" +

            result.output

        );

    }


    // ==========================================
    // CONVERT PORT
    // ==========================================

    const port =
        Number(
            portMatch[1]
        );


    console.log(
        "Backend deployed on port:",
        port
    );


    // ==========================================
    // CONFIGURE NGINX
    // ==========================================

    const nginxResult =
        await configureNginx(
            projectName,
            port
        );


    // ==========================================
    // VERIFY BACKEND
    // ==========================================

    const verification =
        await verifyBackend(
            port
        );


    // ==========================================
    // RETURN RESULT
    // ==========================================

    return {

        ...result,

        port,

        nginx:
            nginxResult,

        verification

    };

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    executeCommand,

    verifyBackend,

    deployBackend,

    configureNginx

};

