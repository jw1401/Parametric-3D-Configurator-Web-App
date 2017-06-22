import { licenses, powers } from './listables';
import { FileItem } from './FileItem.model'


export class ModelItem
{
    public $key? : string

    public userId: string

    public name: string
    public description?: string
    public power?: string
    public like?: number

    public image?: FileItem
    public model?: FileItem

    public isCustomizable?: boolean
    public license?: any

    constructor()
    {
      this.userId=""

      this.name = ""
      this.description = ""
      this.power = powers[0];
      this.like = 0;

      this.image = new FileItem();
      this.model = new FileItem();

      this.isCustomizable = false;
      this.license =  licenses[0].license;

      //console.log(this);
    }
}
