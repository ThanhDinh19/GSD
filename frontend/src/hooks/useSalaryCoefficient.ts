import { useEffect, useState } from 'react';
import { SalaryCoefficient, SalaryCoefficientPayload, MasterStatus, SkillGrade } from '../types';
import { salaryCoefficientService } from '../services/salaryCoefficient.service';
import { statusService } from '../services/status.service';
import { skillGradeService } from '../services/skillGrade.service';

export function useSalaryCoefficients() {
    const [salaryCoefficients, setSalaryCoefficients] = useState<SalaryCoefficient[]>([]);
    const [statuses, setStatuses] = useState<MasterStatus[]>([]);
    const [skillGrades, setSkillGrades] = useState<SkillGrade[]>([]);
    const [loading, setLoading] = useState(false);

    const loadStatuses = async () => {
        const data = await statusService.getStatuses();
        setStatuses(data);
    };

    const loadSkillGrades = async () => {
        const data = await skillGradeService.getSkillGrade();
        setSkillGrades(data);
    };

    const loadSalaryCoefficients = async () => {
        setLoading(true);

        try {
            const data = await salaryCoefficientService.getSalaryCoefficients();
            setSalaryCoefficients(data);
        } finally {
            setLoading(false);
        }
    };

    const refresh = async () => {
        await Promise.all([
            loadStatuses(),
            loadSalaryCoefficients(),
            loadSkillGrades(),
        ]);
    };

    const createSalaryCoefficient = async (payload: SalaryCoefficientPayload) => {
        await salaryCoefficientService.createSalaryCoefficient(payload);
        await loadSalaryCoefficients();
    };

    const updateSalaryCoefficient = async (id: number, payload: SalaryCoefficientPayload) => {
        await salaryCoefficientService.updateSalaryCoefficient(id, payload);
        await loadSalaryCoefficients();
    };

    useEffect(() => {
        refresh();
    }, []);

    return {
        salaryCoefficients,
        skillGrades,
        statuses,
        loading,
        refresh,
        createSalaryCoefficient,
        updateSalaryCoefficient,
    };
}