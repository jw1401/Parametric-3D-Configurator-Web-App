import { Upload } from './user.model';
import { licenses } from './license';

export class CadModel
{
    public $key? : string
    public userId: string
    public name: string
    public description?: string
    public power?: string
    public like?: number
    public image?: Upload
    public model?: Upload
    public isCustomizable?: boolean
    public license?: any

    constructor()
    {
      this.name = ""
      this.description = ""

      this.image = new Upload();
      this.image.name = "";
      this.image.type = "";

      this.model = new Upload();
      this.model.name = "";

      this.like = 0;
      this.license =  licenses[0].license;
      this.power = powers[0];
      this.isCustomizable = false;
    }
}

export const powers = [ 'Printable', 'Hi Tec Gadget','Art', 'Engineering','Not special','Universal'];
