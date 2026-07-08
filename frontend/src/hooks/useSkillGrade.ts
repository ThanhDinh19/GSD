import { useEffect, useState } from 'react';
import { SkillGrade, SkillGradePayload, MasterStatus } from '../types';
import { skillGradeService } from '../services/skillGrade.service';
import { statusService } from '../services/status.service';

export function useSkillGrades() {
  const [skillGrades, setSkillGrades] = useState<SkillGrade[]>([]);
  const [statuses, setStatuses] = useState<MasterStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStatuses = async () => {
    const data = await statusService.getStatuses();
    setStatuses(data);
  };

  const loadSkillGrades = async () => {
    setLoading(true);

    try {
      const data = await skillGradeService.getSkillGrade();
      setSkillGrades(data);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await Promise.all([
      loadStatuses(),
      loadSkillGrades(),
    ]);
  };

  const createSkillGrade = async (payload: SkillGradePayload) => {
    await skillGradeService.createSkillGrade(payload);
    await loadSkillGrades();
  };

  const updateSkillGrade = async (id: number, payload: SkillGradePayload) => {
    await skillGradeService.updateSkillGrade(id, payload);
    await loadSkillGrades();
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    skillGrades,
    statuses,
    loading,
    refresh,
    createSkillGrade,
    updateSkillGrade,
  };
}