export type ResponseStatus = 'completed' | 'partial' | 'started';

export type ResponseValue = string | number | boolean | null | Array<string | number>;
export type RespondentValue = string | number | boolean | null | undefined;

export interface FormResponse {
  id: string;
  form_id: string;
  submitted_at: string;
  completed_at?: string;
  status: ResponseStatus;
  respondent_info: {
    email?: string;
    name?: string;
    [key: string]: RespondentValue;
  };
  response_data: {
    [questionId: string]: ResponseValue;
  };
  updated_at: string;
  created_at: string;
}

export interface ResponseListItem extends Pick<FormResponse, 'id' | 'status' | 'submitted_at' | 'respondent_info'> {
  form_title: string;
}

export interface ResponseFilters {
  startDate?: Date;
  endDate?: Date;
  status?: ResponseStatus;
  search?: string;
}
