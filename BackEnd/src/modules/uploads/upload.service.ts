export interface UploadStorage {
  buildPublicUrl(filename: string): string;
}

class LocalUploadStorage implements UploadStorage {
  buildPublicUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}

export const uploadStorage: UploadStorage = new LocalUploadStorage();
