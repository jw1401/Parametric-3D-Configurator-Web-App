export class User
{
  constructor
  (
    public name: string,
    public country: string,
    public bio?:string,
    public photo?: Upload,
    public likedModels?:Array <string>,
  ){}
}

export class Upload
{
  name: string;
  file: File;
  type: string;
  photoURL?: string;
}
