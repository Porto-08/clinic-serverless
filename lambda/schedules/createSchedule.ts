import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { buildResponse } from "../../utils/buildResponse";
import { Schedule, Status } from "../../domain/schedules/entities/Schedule";
import { v4 as uuidv4 } from "uuid";

const dynamoDb = new DynamoDB.DocumentClient();
const tableName = process.env.SCHEDULES_TABLE!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { date_start, date_end, patient_id } = JSON.parse(event.body!);

  if (!date_start || !date_end || !patient_id) {
    return buildResponse(400, {
      error: "Missing required fields: date_start, date_end, patient_id",
    });
  }

  try {
    if (await hasDateScheduled(date_start, date_end)) {
      return buildResponse(400, {
        error: "Date already scheduled",
      });
    }

    if (!(await checkPatientStatus(patient_id))) {
      return buildResponse(400, {
        error: "Patient is not active",
      });
    }

    const scheduleToSave = buildSchedule({
      date_start,
      date_end,
      patient_id,
    });

    const params = {
      TableName: tableName,
      Item: scheduleToSave,
    };

    await dynamoDb.put(params).promise();
    return buildResponse(201, scheduleToSave);
  } catch (error) {
    console.log(error);
    return buildResponse(500, { error: "Error saving schedule" });
  }
};

function buildSchedule(schedule: Schedule): Required<Schedule> {
  return {
    schedules_id: uuidv4(),
    date_start: schedule.date_start,
    date_end: schedule.date_end,
    patient_id: schedule.patient_id,
    status: Status.PENDING,
  };
}

async function hasDateScheduled(date_start: string, date_end: string) {
  const checkDateStart = dynamoDb
    .scan({
      TableName: tableName,
      FilterExpression: "date_start BETWEEN :date_start and :date_end",
      ExpressionAttributeValues: {
        ":date_start": date_start,
        ":date_end": date_end,
      },
    })
    .promise();

  const checkDateEnd = dynamoDb
    .scan({
      TableName: tableName,
      FilterExpression: "date_end BETWEEN :date_start and :date_end",
      ExpressionAttributeValues: {
        ":date_start": date_start,
        ":date_end": date_end,
      },
    })
    .promise();

  const [checkDateStartResult, checkDateEndResult] = await Promise.all([
    checkDateStart,
    checkDateEnd,
  ]);

  if (checkDateStartResult.Count! > 0 || checkDateEndResult.Count! > 0) {
    return true;
  }

  return false;
}

async function checkPatientStatus(patient_id: string) {
  const params = {
    TableName: process.env.PATIENTS_TABLE!,
    Key: {
      patients_id: patient_id,
    },
  };

  const { Item } = await dynamoDb.get(params).promise();

  if (!Item || Item.status !== true) {
    return false;
  }

  return true;
}
