export class UserModel
{
  constructor
  (
    public name: string,
    public country: string,
    public bio?:string,
    public image?: string,
  ){}
}
