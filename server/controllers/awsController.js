const {
    EC2Client,
    DescribeInstancesCommand
} = require("@aws-sdk/client-ec2");

const {
    S3Client,
    ListBucketsCommand
} = require("@aws-sdk/client-s3");


const region =
    process.env.AWS_REGION;


const ec2Client = new EC2Client({
    region
});


const s3Client = new S3Client({
    region
});


const INSTANCE_ID =
    process.env.EC2_INSTANCE_ID;


// ==========================================
// GET AWS RESOURCES
// ==========================================

const getAWSResources = async (req, res) => {

    try {

        // --------------------------------------
        // Get S3 buckets
        // --------------------------------------

        const s3Response =
            await s3Client.send(
                new ListBucketsCommand({})
            );


        const buckets =
            (s3Response.Buckets || [])
                .filter((bucket) =>
                    bucket.Name?.startsWith(
                        "clouddeploy-"
                    )
                )
                .map((bucket) => ({

                    name: bucket.Name,

                    createdAt:
                        bucket.CreationDate

                }));


        // --------------------------------------
        // Get EC2 instance
        // --------------------------------------

        let ec2 = null;


        if (INSTANCE_ID) {

            const ec2Response =
                await ec2Client.send(
                    new DescribeInstancesCommand({
                        InstanceIds: [
                            INSTANCE_ID
                        ]
                    })
                );


            const reservation =
                ec2Response.Reservations?.[0];


            const instance =
                reservation?.Instances?.[0];


            if (instance) {

                ec2 = {

                    instanceId:
                        instance.InstanceId,

                    state:
                        instance.State?.Name,

                    instanceType:
                        instance.InstanceType,

                    publicIp:
                        instance.PublicIpAddress ||
                        null,

                    privateIp:
                        instance.PrivateIpAddress ||
                        null,

                    availabilityZone:
                        instance.Placement
                            ?.AvailabilityZone ||
                        null,

                    region,

                    launchTime:
                        instance.LaunchTime

                };

            }

        }


        // --------------------------------------
        // Response
        // --------------------------------------

        res.json({

            success: true,

            region,

            s3: {
                count: buckets.length,
                buckets
            },

            ec2

        });


    } catch (error) {

        console.error(
            "Get AWS resources error:",
            error.message
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch AWS resources",

            error:
                error.message

        });

    }
};


module.exports = {
    getAWSResources
};