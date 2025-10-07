import { Injectable } from '@angular/core';
import { IFile } from '../../model/interface/file.model';


@Injectable({
  providedIn: 'root'
})
export class FileViewerService {

  private getMimeType(extension: string): string {
    switch (extension.toLowerCase()) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
        return 'image/jpeg';
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/octet-stream';
    }
  }

  openFile(file: IFile): void {
  const mimeType = this.getMimeType(file.extension);

  // 1️⃣ Konverzija base64 → bajtovi
  const byteCharacters = atob(file.content);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // 2️⃣ Napravi Blob
  const blob = new Blob([byteArray], { type: mimeType });
  const fileURL = URL.createObjectURL(blob);

  // 3️⃣ Proveri da li je PDF
  if (file.extension.toLowerCase() !== 'doc' && file.extension.toLowerCase() !== 'docx' && file.extension.toLowerCase() !== 'txt') {
    // 🟢 Otvori PDF u novom tabu
    window.open(fileURL, '_blank');
  } else {
    // 🔵 Ostale fajlove preuzmi
    const a = document.createElement('a');
    a.href = fileURL;
    a.download = `${file.name}`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // 4️⃣ Očisti memoriju
  URL.revokeObjectURL(fileURL);
}

}
