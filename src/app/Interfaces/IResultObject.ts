import { IUser } from "./IUser";


export interface IResultObject{
    code: Number;
    data: IUser [];
    message: string;
}