export enum Status {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
}

export interface Schedule {
  schedules_id?: string;
  patient_id: string;
  date_start: string;
  date_end: string;
  status?: Status;
}