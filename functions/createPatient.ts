import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const createPatients = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { name, birthDate } = JSON.parse(event.body!);

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        event,
      },
      null,
      2
    ),
  };
};
