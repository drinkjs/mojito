import { DatasourceInfo, LayerInfo, ScreenLayout } from './data';

export interface ProjectDto {
  id: string;
  name: string;
  createTime?: string;
  createUser?: string;
  cdn?: string[];
}

export interface ScreenDto {
  id: string;
  name: string;
  projectId: string;
  createTime: string;
  updateTime: string;
  createUser?: string;
  layout?: string;
  coverImg?: string;
}

export interface ScreenDetailDto {
  id: string;
  name: string;
  style: ScreenLayout;
  layers?: LayerInfo[];
  project: ProjectDto;
  dataSources?: DatasourceInfo[]
}

export interface ComponentTypeTree {
  id: string;
  name: string;
  icon: string;
  children?: ComponentTypeTree[];
  pid?: string;
}
