import { useEffect, useState } from 'react';
import {
    DepartmentNode_test,
    DepartmentType_test,
    DepartmentPayload_test,
    EmployeeLite_test,
} from '../types';

import { organizationService_test } from '../services/organization_test.service'

export function useOrganizationChart_test() {
    const [departmentTypes, setDepartmentTypes] = useState<DepartmentType_test[]>([]);
    const [tree, setTree] = useState<DepartmentNode_test[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<DepartmentNode_test | null>(null);
    const [includeInactive, setIncludeInactive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<EmployeeLite_test[]>([]);

    const loadEmployees = async () => {
        const data = await organizationService_test.getEmployees();
        setEmployees(data);
    };

    const loadDepartmentTypes = async () => {
        const data = await organizationService_test.getDepartmentTypes();
        setDepartmentTypes(data);
    };

    const loadTree = async (showInactive = includeInactive) => {
        setLoading(true);

        try {
            const data = await organizationService_test.getDepartmentTree(showInactive);
            setTree(data);
        } finally {
            setLoading(false);
        }
    };

    const createDepartment = async (payload: DepartmentPayload_test) => {
        await organizationService_test.createDepartment(payload);
        await loadTree();
    };

    const updateDepartment = async (id: string, payload: DepartmentPayload_test) => {
        const updated = await organizationService_test.updateDepartment(id, payload);
        setSelectedDepartment(updated);
        await loadTree();
    };

    const dissolveDepartment = async (id: string) => {
        await organizationService_test.dissolveDepartment(id);
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