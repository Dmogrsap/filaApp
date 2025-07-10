export interface IUser{
    idUser: number;

    // numEmpleado: number;
    // firstName: string;
    // lastName: string;

    badgeNumber: string;
    active: boolean;
    idRole: number;
    createdByIdUser: number;
    creationDate: Date;
    modifiedByIdUser: number;
    modificationDate: Date;
}