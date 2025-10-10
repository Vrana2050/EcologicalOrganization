
import { IDocumentBase } from "../interface/document.model";
import { INotification } from "../interface/notification.model";
import { DocumentBase } from "./document-impl.model";

export class Notification implements INotification {
  id: number;
  message: string;
  read: boolean;
  document: {
    id: number;
  };
  userId: number;

  constructor(data: any) {
    if (!data) {
      throw new Error("No data provided to construct Notification");
    }
    if(!data.poruka)
    {
      throw new Error("Invalid data format for Notification");
    }
    if(!data.dokument)
    {
      throw new Error("Invalid data format for Notification");
    }
    if(!data.korisnikId)
    {
      throw new Error("Invalid data format for Notification");
    }
    if(data.procitana===undefined)
    {
      throw new Error("Invalid data format for Notification");
    }
    this.id = data.id;
    this.message = data.poruka;
    this.userId = data.korisnikId;
    this.read = data.procitana;
    this.document = {
      id: data.dokument.id
    };
  }
}