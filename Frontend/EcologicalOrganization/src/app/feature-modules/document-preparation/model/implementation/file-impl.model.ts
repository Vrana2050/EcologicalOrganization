import { Extension, IFile } from '../interface/file.model';
export class File implements IFile{
  id: number;
  name: string;
  content: string;
  version: number;
  dateUploaded: Date;
  extension: Extension;

  constructor(data: any) {
    if (data == null) {
      throw new Error('File: No data provided.');
    }
    if (data.id == null) {
      throw new Error('File: "id" is required.');
    }
    if (!data.naziv) {
      throw new Error('File: "name" is required.');
    }
    if (data.podatak == null) {
      throw new Error('File: "content" is required.');
    }
    if (data.verzija == null) {
      throw new Error('File: "version" is required.');
    }
    if (!data.datumKreiranja) {
      throw new Error('File: "dateUploaded" is required.');
    }
    if (!data.ekstenzija) {
      throw new Error('File: "extension" is required.');
    }
    this.content = data.podatak;
    this.version = data.verzija;
    this.dateUploaded = new Date(data.datumKreiranja);
    this.extension = data.ekstenzija;
    this.id = data.id;
    this.name = data.naziv;
  }
  isFirstVersion(): boolean {
    return this.version === 1;
  }
  isNewVersionOf(other: IFile): boolean {
    return this.name === other.name && this.extension === other.extension;
  }

}