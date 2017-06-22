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
      this.progress = 0

      //get file extension
      let extension = this.name.split('.').pop().toLowerCase()

      //check the file extension and set model.type
      switch(extension)
      {
        case "stl":
          this.type = "stl";
          break;

          case "jscad":
          this.type = "jscad";
          break;
        }
    }
    else
    {
      this.file = null
      this.name = ""
      this.type = ""
      this.url = ""
      this.progress = 0
    }
    //console.log(this)
  }

}
