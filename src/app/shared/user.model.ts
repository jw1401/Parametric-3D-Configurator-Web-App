import { FileItem } from './FileItem.model'

export class User
{
  public $key?: string;

  public name: string
  public country: string
  public bio?:string
  public photo?: FileItem

  constructor()
  {
    this.name = "";
    this.country = "";
    this.bio = "";
    this.photo = new FileItem();
  }
}
