export class User
{
  public $key?: string;
  public name: string
  public country: string
  public bio?:string
  public photo?: Upload
  public likedModels?:Array <string>

  constructor()
  {
    this.name = "";
    this.country = "";
    this.bio = "";
    this.photo = new Upload();
    this.photo.URL = "";
  }
}

export class Upload
{
  name: string;
  file: File;
  type: string;
  URL?: string;
}
