import * as cdk from "aws-cdk-lib";
import { CorsHttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path = require("path");

import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import * as dotenv from "dotenv";

dotenv.config();

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const commonLambdaOptions = {
      handler: "handler",
      environment: {
        authorizationToken: process.env.authorization ?? "",
      },
      timeout: cdk.Duration.seconds(90),
    };

    const resolveDisputeLambda = new NodejsFunction(
      this,
      "ResolveDisputeLambda",
      {
        runtime: Runtime.NODEJS_LATEST,
        entry: path.join(__dirname, `/../lambdas/dispute-resolver.ts`),
        ...commonLambdaOptions,
      }
    );

    const clarifyDisputeLambda = new NodejsFunction(
      this,
      "ClarifyDisputeLambda",
      {
        runtime: Runtime.NODEJS_LATEST,
        entry: path.join(__dirname, `/../lambdas/clarify-dispute.ts`),
        ...commonLambdaOptions,
      }
    );

    const validateComlianceLambda = new NodejsFunction(
      this,
      "ValidateComlianceLambda",
      {
        runtime: Runtime.NODEJS_LATEST,
        entry: path.join(__dirname, `/../lambdas/compliance-validator.ts`),
        ...commonLambdaOptions,
      }
    );

    const getMessagesLambda = new NodejsFunction(this, "GetMessagesLambda", {
      runtime: Runtime.NODEJS_LATEST,
      entry: path.join(__dirname, `/../lambdas/getMessages.ts`),
      ...commonLambdaOptions,
    });

    const httpApi = new RestApi(this, "NescrowAgentsApi", {
      restApiName: "Nescrow Agents Api",
    });

    httpApi.root.addCorsPreflight({
      allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
      allowOrigins: ["*"],
    });

    const resolveDisputeLambdaIntegration = new LambdaIntegration(
      resolveDisputeLambda
    );

    const resolveDisputeResource = httpApi.root.addResource("resolve-dispute");
    resolveDisputeResource.addMethod("POST", resolveDisputeLambdaIntegration);

    const clarifyDisputeLambdaIntegration = new LambdaIntegration(
      clarifyDisputeLambda
    );

    const clarifyDisputeResource = httpApi.root.addResource("clarify-dispute");
    clarifyDisputeResource.addMethod("POST", clarifyDisputeLambdaIntegration);

    const complianceIntegration = new LambdaIntegration(
      validateComlianceLambda
    );

    const validateComplianceResource = httpApi.root.addResource(
      "validate-compliance"
    );
    validateComplianceResource.addMethod("POST", complianceIntegration);

    const getMessagesIntegration = new LambdaIntegration(getMessagesLambda);

    const listMessagesResource = httpApi.root.addResource("messages");
    const threadIdResource = listMessagesResource.addResource("{threadId}");

    threadIdResource.addMethod("GET", getMessagesIntegration);
  }
}
