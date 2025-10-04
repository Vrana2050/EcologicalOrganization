export interface IFile{
  isFirstVersion(): boolean;
  id: number;
  name: string;
  content: string;
  version: number;
  dateUploaded: Date;
  extension: Extension;
}
export enum Extension{
  TXT = "txt",
  DOC = "doc",
  DOCX = "docx",
  PDF = "pdf",
  JPG = "jpg",
  JPEG = "jpeg",
  PNG = "png",
  BMP = "bmp"
}