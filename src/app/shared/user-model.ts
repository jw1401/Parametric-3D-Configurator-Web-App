export class UserModel
{
  constructor
  (
    public name: string,
    public country: string,
    public bio?:string,
    public photoURL?: string,
    public likedModels?:Array <string>
  ){}
}
