export class File
{
  file: File;

  name: string;
  type: string;
  url?: string;
  progress: number;
  createdAt: Date = new Date();

  constructor(file: File)
  {
    this.file = file;
  }
}
