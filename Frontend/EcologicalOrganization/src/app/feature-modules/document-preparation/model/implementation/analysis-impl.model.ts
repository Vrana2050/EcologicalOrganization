import { IAnalysis, IEntity as IEntity, IDocumentAnalysis as IDocumentAnalysis, IStatusDuration, ISlowestStatus, IMostProblematicDocument, ILargestDelay } from '../interface/analysis.model';

export class Entity implements IEntity {
  id: number;
  name: string;

  constructor(data: any) {
    if (data == null) {
      throw new Error('Entity: No data provided.');
    }
    if (data.dokumentId == null && data.id == null) {
      throw new Error('Entity: "id" is required.');
    }
    if (data.naziv == null && data.name == null) {
      throw new Error('Entity: "name" is required.');
    }

    this.id = data.dokumentId ?? data.id;
    this.name = data.naziv ?? data.name;
  }
}

export class DocumentAnalysis implements IDocumentAnalysis {
  document: Entity;
  deadlinePercentage: number;
  returnCount: number;
  dependentDocuments: IEntity[];
  durationByStatus: IStatusDuration[];

  constructor(data: any) {
    if (data == null) {
      throw new Error('DocumentAnalysis: No data provided.');
    }
    if (data.dokument == null) {
      throw new Error('DocumentAnalysis: "dokument" is required.');
    }
    if (data.procenatRoka == null) {
      throw new Error('DocumentAnalysis: "procenatRoka" is required.');
    }
    if (data.brojVracanja == null) {
      throw new Error('DocumentAnalysis: "brojVracanja" is required.');
    }
    if (data.zavisniDokumenti == null) {
      throw new Error('DocumentAnalysis: "zavisniDokumenti" is required.');
    }
    if (data.trajanjePoStanjima == null) {
      throw new Error('DocumentAnalysis: "trajanjePoStanjima" is required.');
    }

    this.document = new Entity(data.dokument);
    this.deadlinePercentage = data.procenatRoka;
    this.returnCount = data.brojVracanja;
    this.dependentDocuments = data.zavisniDokumenti.map((zd: any) => new Entity(zd));
    this.durationByStatus = data.trajanjePoStanjima.map((st: any) => new StatusDuration(st));
  }
}

export class StatusDuration implements IStatusDuration {
  status: number;
  name: string;
  durationDays: number;

  constructor(data: any) {
    if (data == null) {
      throw new Error('StatusDuration: No data provided.');
    }
    if (data.stanje == null) {
      throw new Error('StatusDuration: "stanje" is required.');
    }
    if (data.naziv == null) {
      throw new Error('StatusDuration: "naziv" is required.');
    }
    /*if (data.trajanjeDani == null) {
      throw new Error('StatusDuration: "trajanjeDani" is required.');
    }*/

    this.status = data.stanje;
    this.name = data.naziv;
    this.durationDays = data.trajanjeDani;
  }
}

export class SlowestStatus implements ISlowestStatus {
  statusId: number;
  name: string;
  duration: number;

  constructor(data: any) {
    if (data == null) {
      throw new Error('SlowestStatus: No data provided.');
    }
    if (data.statusId == null) {
      throw new Error('SlowestStatus: "statusId" is required.');
    }
    if (data.naziv == null) {
      throw new Error('SlowestStatus: "naziv" is required.');
    }
    if (data.prosecnoVremeZadrzavanja == null) {
      throw new Error('SlowestStatus: "prosecnoVremeZadrzavanja" is required.');
    }

    this.statusId = data.statusId;
    this.name = data.naziv;
    this.duration = data.prosecnoVremeZadrzavanja;
  }
}

export class MostProblematicDocument implements IMostProblematicDocument {
  document: IEntity;
  returnCount: number;

  constructor(data: any) {
    if (data == null) {
      throw new Error('MostProblematicDocument: No data provided.');
    }
    if (data.dokument == null) {
      throw new Error('MostProblematicDocument: "dokument" is required.');
    }
    if (data.brojVracanja == null) {
      throw new Error('MostProblematicDocument: "brojVracanja" is required.');
    }

    this.document = new Entity(data.dokument);
    this.returnCount = data.brojVracanja;
  }
}

export class LargestDelay implements ILargestDelay {
  document: IEntity;
  delayDays: number;

  constructor(data: any) {
    if (data == null) {
      throw new Error('LargestDelay: No data provided.');
    }
    if (data.dokument == null) {
      throw new Error('LargestDelay: "dokument" is required.');
    }
    if (data.danaZakasnjenja == null) {
      throw new Error('LargestDelay: "danaZakasnjenja" is required.');
    }

    this.document = new Entity(data.dokument);
    this.delayDays = data.danaZakasnjenja;
  }
}

export class Analysis implements IAnalysis {
  entityOfAnalysis: IEntity;
  documentAnalyses: IDocumentAnalysis[];
  slowestStatus: ISlowestStatus;
  mostProblematicDocument: IMostProblematicDocument;
  largestDelay: ILargestDelay;
  entityDurationByStatus: IStatusDuration[];
  entityDeadlinePercentage: number;

  constructor(data: any) {
    if (data == null) {
      throw new Error('Analysis: No data provided.');
    }
    if (data.entitet_Analize == null) {
      throw new Error('Analysis: "entitet_Analize" is required.');
    }
    if (data.najproblematicnijiDokument == null) {
      throw new Error('Analysis: "najproblematicnijiDokument" is required.');
    }
    if (data.najveceKasnjenje == null) {
      throw new Error('Analysis: "najveceKasnjenje" is required.');
    }
    if (data.trajanjeEntitetaPoStanjima == null) {
      throw new Error('Analysis: "trajanjeEntitetaPoStanjima" is required.');
    }
    if (data.procenatRokaEntiteta == null) {
      throw new Error('Analysis: "procenatRokaEntiteta" is required.');
    }

    this.entityDeadlinePercentage = data.procenatRokaEntiteta;
    this.entityOfAnalysis = new Entity(data.entitet_Analize);
    if (data.dokument_Analize != null && Array.isArray(data.dokument_Analize ) && data.dokument_Analize.length > 0) {
      this.documentAnalyses = data.dokument_Analize.map((doc: any) => new DocumentAnalysis(doc));
      this.slowestStatus = new SlowestStatus(data.najsporijiStatus);
      this.mostProblematicDocument = new MostProblematicDocument(data.najproblematicnijiDokument);
      this.largestDelay = new LargestDelay(data.najveceKasnjenje);
    }
    this.entityDurationByStatus = data.trajanjeEntitetaPoStanjima.map((st: any) => new StatusDuration(st));
  }
}
