export interface IRoles{
    idRole:number,
    roleName:string;
    active: boolean;
    roleDescription: string;
    createdByIdUser: number;
    creationDate: Date;
    modifiedByIdUser: number;
    modificationDate: Date;
}