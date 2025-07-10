import { IAccesses } from "./IAccesses";

export interface IMenu{

    idMenu:number,
    iconMenu: string,
    nameMenu:string,
    active: boolean;
    hasAccess: boolean;
    Items?: IAccesses[];
}