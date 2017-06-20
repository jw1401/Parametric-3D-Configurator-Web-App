import { File } from './File.model'

export class User
{
  public $key?: string;
  public name: string
  public country: string
  public bio?:string
  public photo?: File
  public likedModels?:Array <string>

  constructor()
  {
    //this.$key=""
    this.name = "";
    this.country = "";
    this.bio = "";
    //this.photo = new Upload();
    //this.photo.URL = "";
  }
}

export class Upload
{
  file: File;

  name: string;
  type: string;
  URL?: string;

  constructor()
  {
    //this.file = new File()
    this.name="";
    this.type="";
    this.URL="";
  }
}
