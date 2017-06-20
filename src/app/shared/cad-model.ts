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
      this.userId=""
      this.name = ""
      this.description = ""
      this.power = powers[0];
      this.like = 0;
      this.image = new Upload();
      this.model = new Upload();
      this.isCustomizable = false;
      this.license =  licenses[0].license;
    }
}

export const powers = [ 'Printable', 'Hi Tec Gadget','Art', 'Engineering','Not special','Universal'];
