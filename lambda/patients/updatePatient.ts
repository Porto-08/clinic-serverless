import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse } from "../../utils/buildResponse";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const tableName = process.env.PATIENTS_TABLE!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { name, email, phone, birthDate, status } = JSON.parse(event.body!);
  const { id } = event.pathParameters!;

  const params = {
    TableName: tableName,
    Key: {
      patients_id: id,
    },
    UpdateExpression:
      "set #name = :name, #email = :email, #phone = :phone, #birthDate = :birthDate, #status = :status",
    ExpressionAttributeNames: {
      "#name": "name",
      "#email": "email",
      "#phone": "phone",
      "#birthDate": "birthDate",
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":name": name,
      ":email": email,
      ":phone": phone,
      ":birthDate": birthDate,
      ":status": status,
    },
    ConditionExpression: "attribute_exists(patients_id)",
    ReturnValues: "ALL_NEW",
  };

  try {
    const patient = await dynamoDb.update(params).promise();

    return buildResponse(201, {
      patient,
    });
  } catch (error) {
    console.log(error);

    if (error.code === "ConditionalCheckFailedException") {
      return buildResponse(404, { error: "Patient not found" });
    }

    return buildResponse(500, { error: error.message });
  }
};
