import { IDocumentBase } from "./document.model";
export interface INotification {
  id: number;
  message: string;
  read: boolean;
  document:{id:number};
  userId:number;
}