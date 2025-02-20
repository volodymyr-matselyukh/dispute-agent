import * as cdk from "aws-cdk-lib";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path = require("path");

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
        ...commonLambdaOptions
      },
    );

    const clarifyDisputeLambda = new NodejsFunction(
      this,
      "ClarifyDisputeLambda",
      {
        runtime: Runtime.NODEJS_LATEST,
        entry: path.join(__dirname, `/../lambdas/clarify-dispute.ts`),
        ...commonLambdaOptions
      }
    );

    const validateComlianceLambda = new NodejsFunction(
      this,
      "ValidateComlianceLambda",
      {
        runtime: Runtime.NODEJS_LATEST,
        entry: path.join(__dirname, `/../lambdas/compliance-validator.ts`),
        ...commonLambdaOptions
      }
    );

    const httpApi = new HttpApi(this, "NescrowAgentsApi", {
      apiName: "Nescrow Agents Api",
      corsPreflight: {
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
        allowOrigins: ["*"],
      },
    });

    const resolveDisputeLambdaIntegration = new HttpLambdaIntegration(
      "ResolveDisputeIntegration",
      resolveDisputeLambda
    );

    const clarifyDisputeLambdaIntegration = new HttpLambdaIntegration(
      "ClarifyDisputeIntegration",
      clarifyDisputeLambda
    );

    const complianceIntegration = new HttpLambdaIntegration(
      "ComplianceIntegration",
      validateComlianceLambda
    );

    httpApi.addRoutes({
      path: "/resolve-dispute",
      methods: [HttpMethod.POST],
      integration: resolveDisputeLambdaIntegration,
    });

    httpApi.addRoutes({
      path: "/clarify-dispute",
      methods: [HttpMethod.POST],
      integration: clarifyDisputeLambdaIntegration,
    });

    httpApi.addRoutes({
      path: "/validate-compliance",
      methods: [HttpMethod.POST],
      integration: complianceIntegration,
    });
  }
}
