import { Upload } from './user.model';
import {licenses} from './license';

export class CadModel
{
    public $key : string
    public userId: string
    public name: string
    public description?: string
    public power?:string
    public like?: number
    public image?: Upload
    public model?: Upload
    public isCustomizable?: boolean
    public license?: any

    constructor()
    {
      this.name=""
      this.description=""
      this.image = new Upload();
      this.model = new Upload();
      this.like = 0;
      this.license =  licenses[0].license;
      this.power = "Printable";
      this.isCustomizable=false;
    }

  /*static fromJson ({$key, userId, name, description, power,like,imageURL,modelURL,isCustomizable})
  {
    //return new CadModel(userId, name, description, power,like,imageURL,modelURL,isCustomizable);
  }*/

  //static fromJsonArray(json : any[]) : CadModel[]
  //{
    //return json.map(CadModel.fromJson);
  //}
}
