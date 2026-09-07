const {
    SSMClient,
    SendCommandCommand,
    GetCommandInvocationCommand
} = require("@aws-sdk/client-ssm");

const ssmClient = new SSMClient({
    region: process.env.AWS_REGION
});

const INSTANCE_ID = process.env.EC2_INSTANCE_ID;
const EC2_PUBLIC_IP = process.env.EC2_PUBLIC_IP || "3.111.169.23";

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

    if (
        status === "Pending" ||
        status === "InProgress"
    ) {
        throw new Error(
            `EC2 command timed out while waiting for completion. Status: ${status}`
        );
    }

    if (status !== "Success") {
        throw new Error(
            `EC2 command failed: ${status}\n` +
            (result?.StandardErrorContent || "")
        );
    }

    return {
        commandId,
        status,
        output: result.StandardOutputContent || "",
        error: result.StandardErrorContent || ""
    };
};


// ==========================================
// NGINX CONFIGURATION
// ==========================================

const configureNginx = async (projectName, port) => {

    const projectSlug = createProjectSlug(projectName);

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

    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization" always;

    if ($request_method = OPTIONS) {
        return 204;
    }
}
`;

    const escapedConfig = nginxConfig
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\$/g, "\\$");

    const commands = [

        "sudo mkdir -p /etc/nginx/clouddeploy-projects",

        `echo "${escapedConfig}" | sudo tee /etc/nginx/clouddeploy-projects/${projectSlug}.conf > /dev/null`,

        "sudo grep -q 'clouddeploy-projects' /etc/nginx/sites-enabled/default || sudo sed -i '/server_name _;/a\\    include /etc/nginx/clouddeploy-projects/*.conf;' /etc/nginx/sites-enabled/default",

        "sudo nginx -t",

        "sudo systemctl reload nginx"
    ];

    const result = await executeCommand(commands);

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

const verifyBackend = async (port) => {

    console.log(
        `Verifying backend on EC2 port: ${port}`
    );

    const result = await executeCommand([
        `curl -s -o /dev/null -w '%{http_code}' http://localhost:${port}`
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
    console.log("Starting backend deployment...");

    const appDirectory =
        `/home/ubuntu/deployments/${projectName}`;

    const processName =
        `clouddeploy-${projectName}`;

    const commands = [
    // Create deployment directory
    "mkdir -p /home/ubuntu/deployments",

    // Remove previous PM2 process
    `pm2 delete ${processName} || true`,

    // Remove old project
    `rm -rf ${appDirectory}`,

    // Clone fresh repository
    `git clone ${repositoryUrl} ${appDirectory}`,

    // Restore persistent environment file
    `cp /home/ubuntu/deployments/env/clouddeploy-ai.env ${appDirectory}/server/.env`,

    // Secure environment file
    `chmod 600 ${appDirectory}/server/.env`,

    // Install backend dependencies
    `cd ${appDirectory}/server`,
    "npm install",

    // Find available port
    `PORT=5001; while ss -ltn | awk '{print $4}' | grep -q ":$PORT$"; do PORT=$((PORT+1)); done; echo $PORT > ${appDirectory}/port.txt`,

    // Start PM2
    `PORT=$(cat ${appDirectory}/port.txt) && export PORT && pm2 start server.js --name ${processName} --cwd ${appDirectory}/server --update-env`,

    // Save PM2 configuration
    "pm2 save",

    // Get process PID
    `pm2 pid ${processName}`,

    // Output deployed port
    `echo DEPLOYED_PORT=$(cat ${appDirectory}/port.txt)`
];

    const result =
        await executeCommand(commands);

    console.log("Backend deployment completed!");

    const portMatch =
        result.output.match(
            /DEPLOYED_PORT=(\d+)/
        );

    if (!portMatch) {
        throw new Error(
            "Could not determine deployed backend port"
        );
    }

    const port =
        Number(portMatch[1]);

    console.log(
        "Backend deployed on port:",
        port
    );

    // Configure Nginx
    const nginxResult =
        await configureNginx(
            projectName,
            port
        );

    // Verify backend
    const verification =
        await verifyBackend(port);

    return {
        ...result,
        port,
        nginx: nginxResult,
        verification
    };
};


module.exports = {
    executeCommand,
    verifyBackend,
    deployBackend,
    configureNginx
};