import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse } from "../../utils/buildResponse";
import { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { Patient } from "../../domain/patients/entities/Patient";

const dynamoDb = new DynamoDB.DocumentClient();
const tableName = process.env.PATIENTS_TABLE!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { name, email, phone, birthDate } = JSON.parse(event.body!);

  if (!name || !email || !phone || !birthDate) {
    return buildResponse(400, {
      error: "Missing required fields: name, email, phone, birthDate",
    });
  }

  const patient = buildPatient({
    name,
    email,
    phone,
    birthDate,
  });

  try {
    await dynamoDb
      .put({
        TableName: tableName,
        Item: patient,
      })
      .promise();

    return buildResponse(201, {
      patient,
    });
  } catch (error) {
    console.log(error);
    return buildResponse(500, { error: error.message });
  }
};

function buildPatient(patient: Patient): Required<Patient> {
  return {
    patients_id: uuidv4(),
    name: patient.name,
    email: patient.email,
    phone: patient.phone,
    birthDate: patient.birthDate,
    status: true,
  };
}
