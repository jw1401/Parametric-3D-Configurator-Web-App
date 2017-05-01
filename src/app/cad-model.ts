export class CadModel
{
  constructor
  (
    public uid: string,
    public name: string,
    public description?: string,
    public power?:string,
    public like?: number,
    public imageURL?: string,
    public modelURL?: string,
  ){}
}
