import { IUser } from "../user/userTypes";

export interface IBook {
    _id: string;
    title: string;
    author: IUser;
    genre: string;
    coverImage: string; // cloudinay url
    file: string; // cloudinay url
    createdAt: Date;
    updatedAt: Date;
}
