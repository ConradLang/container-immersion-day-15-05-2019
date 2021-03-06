'use strict';

const aws = require('aws-sdk');
const axios = require('axios');
const codedeploy = new aws.CodeDeploy();

const TARGET_URL = process.env.TargetUrl;

exports.handler = async function (event, context, callback) {

    console.log("Entering PreTraffic Hook!");
    console.log(JSON.stringify(event));

    // Read the DeploymentId from the event payload.
    var deploymentId = event.DeploymentId;
    console.log("Deployment: " + deploymentId);

    // Read the LifecycleEventHookExecutionId from the event payload
    var lifecycleEventHookExecutionId = event.LifecycleEventHookExecutionId;
    console.log("LifecycleEventHookExecutionId: " + lifecycleEventHookExecutionId);

    // Prepare the validation test results with the deploymentId and
    // the lifecycleEventHookExecutionId for AWS CodeDeploy.
    var params = {
        deploymentId: deploymentId,
        lifecycleEventHookExecutionId: lifecycleEventHookExecutionId,
        status: 'Succeeded'
    };

    // Perform validation or pre-warming steps.
    // Make a request to the target URL and check the response
    try {
        const response = await axios(TARGET_URL);
        if (response.status != 200) {
            console.error("Failure status");
            params.status = 'Failed';
        } 
    } catch (err) {
        console.error(err);
        params.status = 'Failed';
    }

    // Pass AWS CodeDeploy the prepared validation test results.
    try {
        console.log(params);
        await codedeploy.putLifecycleEventHookExecutionStatus(params).promise();
        console.log('Successfully reported hook results');
        callback(null, 'Successfully reported hook results');
    } catch (err) {
        console.error('Failed to report hook results');
        console.error(err);
        callback('Failed to report hook results');
    }
}