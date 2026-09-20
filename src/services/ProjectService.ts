// ==========================================
// Project Service - Save/Load/Export
// ==========================================

import { Project } from '../models/types';

export class ProjectService {
  static toJSON(project: Project): string {
    return JSON.stringify(project, null, 2);
  }

  static fromJSON(json: string): Project {
    return JSON.parse(json) as Project;
  }

  static downloadJSON(project: Project): void {
    const json = this.toJSON(project);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title || 'project'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async loadFromFile(file: File): Promise<Project> {
    const text = await file.text();
    return this.fromJSON(text);
  }

  static saveToLocalStorage(project: Project): void {
    const projects = this.getAllFromLocalStorage();
    const index = projects.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    localStorage.setItem('farqar_projects', JSON.stringify(projects));
  }

  static getAllFromLocalStorage(): Project[] {
    try {
      const data = localStorage.getItem('farqar_projects');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static deleteFromLocalStorage(projectId: string): void {
    const projects = this.getAllFromLocalStorage().filter((p) => p.id !== projectId);
    localStorage.setItem('farqar_projects', JSON.stringify(projects));
  }
}
