import { useEffect, useState } from 'react';
import {
    DepartmentNode,
    DepartmentType,
    DepartmentPayload,
    EmployeeLite,
} from '../types';

import { organizationService } from '../services/organization.service'

export function useOrganizationChart() {
    const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);
    const [tree, setTree] = useState<DepartmentNode[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<DepartmentNode | null>(null);
    const [includeInactive, setIncludeInactive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<EmployeeLite[]>([]);

    const loadEmployees = async () => {
        const data = await organizationService.getEmployees();
        setEmployees(data);
    };

    const loadDepartmentTypes = async () => {
        const data = await organizationService.getDepartmentTypes();
        setDepartmentTypes(data);
    };

    const loadTree = async (showInactive = includeInactive) => {
        setLoading(true);

        try {
            const data = await organizationService.getDepartmentTree(showInactive);
            setTree(data);
        } finally {
            setLoading(false);
        }
    };

    const createDepartment = async (payload: DepartmentPayload) => {
        await organizationService.createDepartment(payload);
        await loadTree();
    };

    const updateDepartment = async (id: string, payload: DepartmentPayload) => {
        const updated = await organizationService.updateDepartment(id, payload);
        setSelectedDepartment(updated);
        await loadTree();
    };

    const dissolveDepartment = async (id: string) => {
        await organizationService.dissolveDepartment(id);
        setSelectedDepartment(null);
        await loadTree();
    };

    const toggleIncludeInactive = async (checked: boolean) => {
        setIncludeInactive(checked);
        await loadTree(checked);
    };

    useEffect(() => {
        loadDepartmentTypes();
        loadEmployees();
        loadTree(false);
    }, []);

    return {
        departmentTypes,
        tree,
        selectedDepartment,
        setSelectedDepartment,
        includeInactive,
        toggleIncludeInactive,
        loading,
        loadTree,
        createDepartment,
        updateDepartment,
        dissolveDepartment,
        employees,
    };
}