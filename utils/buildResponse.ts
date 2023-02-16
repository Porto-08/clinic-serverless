import { APIGatewayProxyResult } from "aws-lambda";

export const buildResponse = (
  statusCode: number,
  body: any
): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify(body, null, 2),
  };
};
