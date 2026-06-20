export class CreateIssueDto {
  title: string;
  description?: string;
  causes?: string;
  solutions?: string;
  device_id: string; // Cột này để định danh lỗi thuộc thiết bị nào nè
}