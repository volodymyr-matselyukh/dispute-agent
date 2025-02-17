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

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const helloWorldLambda = new NodejsFunction(this, "GetHelloLambda", {
      runtime: Runtime.NODEJS_LATEST,
      entry: path.join(__dirname, `/../lambdas/dispute-resolver.ts`),
      handler: "handler",
    });

    const httpApi = new HttpApi(this, "MyApi", {
      apiName: "My API",
      corsPreflight: {
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
        allowOrigins: ["*"],
      },
    });

    const templateLambdaIntegration = new HttpLambdaIntegration(
      "TemplateIntegration",
      helloWorldLambda
    );

    // Create a resource and method for the API
    httpApi.addRoutes({
      path: "/hello",
      methods: [HttpMethod.GET],
      integration: templateLambdaIntegration,
    });
  }
}
