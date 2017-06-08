import {Observable} from "rxjs/Rx";

export class CadModel
{
  constructor
  (
    //public $key : string,
    public userId: string,
    public name: string,
    public description?: string,
    public power?:string,
    public like?: number,
    public imageURL?: string,
    public modelURL?: string,
    public isCustomizable?: boolean,
    public license?: any,
  ){}

  static fromJson ({$key, userId, name, description, power,like,imageURL,modelURL,isCustomizable})
  {
    return new CadModel(userId, name, description, power,like,imageURL,modelURL,isCustomizable);
  }

  static fromJsonArray(json : any[]) : CadModel[]
  {
    return json.map(CadModel.fromJson);
  }
}
