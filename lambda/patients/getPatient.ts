import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse } from "../../utils/buildResponse";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const tableName = process.env.PATIENTS_TABLE!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters!;

  try {
    const patient = await dynamoDb
      .get({
        TableName: tableName,
        Key: {
          patients_id: id,
        },
      })
      .promise();

    if (!patient.Item) {
      return buildResponse(404, { error: "Patient not found" });
    }

    return buildResponse(200, { patient: patient.Item });
  } catch (error) {
    console.log(error);
    return buildResponse(500, { error: error.message });
  }
};
