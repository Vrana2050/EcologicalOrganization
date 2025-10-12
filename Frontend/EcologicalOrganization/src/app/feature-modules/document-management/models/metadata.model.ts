export class MetadataDTO {
  id: number;
  name: string;
  metadata_type: string;
  description?: string;

  constructor(
    id: number,
    name: string,
    metadata_type: string,
    description?: string
  ) {
    this.id = id;
    this.name = name;
    this.metadata_type = metadata_type;
    this.description = description;
  }
}

export interface CreateMetadataDTO {
  name: string;
  metadata_type: string;
  description?: string;
}

export interface MetadataValueCreateDTO {
  metadata_id: number;
  value: string;
}
