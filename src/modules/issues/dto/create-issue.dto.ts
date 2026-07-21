export class CreateIssueDto {
  title: string;
  description?: string;
  causes?: string;
  solutions?: string;
  device_id: string; 
}