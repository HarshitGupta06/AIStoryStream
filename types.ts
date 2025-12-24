export interface Story {
  id: string;
  title: string;
  summary: string;
  originalSource: string;
  selected: boolean;
}

export interface Script {
  title: string;
  content: string;
  tone: 'humorous' | 'dramatic' | 'suspenseful';
}

export interface GeneratedAsset {
  type: 'audio' | 'video' | 'image';
  url: string;
  blob?: Blob;
}

export enum PipelineStep {
  SEARCH = 0,
  SCRIPT = 1,
  ASSETS = 2,
  UPLOAD = 3
}
