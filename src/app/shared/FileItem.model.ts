export class FileItem
{
  file: File;

  name: string;
  type: string;
  url?: string;
  progress?: number;
  createdAt: Date = new Date();

  constructor(file?: File)
  {
    if (file != undefined)
    {
      this.file = file
      this.name = file.name
      this.type = file.type
      this.url = ""
      this.progress = 100
    }
    else
    {
      this.file = null
      this.name = ""
      this.type = ""
      this.url = ""
      this.progress = 100
    }
    console.log(this)
  }

}
