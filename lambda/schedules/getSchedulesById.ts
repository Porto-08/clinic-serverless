import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse } from "../../utils/buildResponse";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const scheduleTableName = process.env.SCHEDULES_TABLE!;
const patientTableName = process.env.PATIENTS_TABLE!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters!;

  try {
    const schedulesPromise = dynamoDb.scan({
      TableName: scheduleTableName,
      FilterExpression: "patient_id = :id",
      ExpressionAttributeValues: {
        ":id": id
      }
    }).promise();

    const patientPromise = dynamoDb.get({
      TableName: patientTableName,
      Key: {
        patients_id: id
      }
    }).promise();
    
    const [schedules, patient] = await Promise.all([schedulesPromise, patientPromise]);

    const response = {
      ...patient.Item,
      schedules: schedules.Items
    }

    return buildResponse(200, response);
  } catch (error) {
    console.log(error);
    return buildResponse(500, { error: error.message });
  }
}