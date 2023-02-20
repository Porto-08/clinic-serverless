import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse } from "../../utils/buildResponse";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const tableName = process.env.PATIENTS_TABLE!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const params = {
    TableName: tableName,
  };

  try {
    const { Items: patients } = await dynamoDb.scan(params).promise();

    return buildResponse(200, { patients });
  } catch (error) {
    console.log(error);
    return buildResponse(500, { error: error.message });
  }
};
