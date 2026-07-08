import { request } from './httpClient';
import { SkillGrade, SkillGradePayload } from '../types';

export const skillGradeService = {
  getSkillGrade() {
    return request<SkillGrade[]>('/api/skill-grade');
  },

  createSkillGrade(payload: SkillGradePayload) {
    return request<{ message: string }>('/api/skill-grade', {
      method: 'POST',
      body: payload,
    });
  },

  updateSkillGrade(id: number, payload: SkillGradePayload) {
    return request<{ message: string }>(`/api/skill-grade/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
};