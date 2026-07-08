import { DepartmentType_test, DepartmentNode_test, DepartmentPayload_test, EmployeeLite_test } from "../types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || 'Có lỗi xảy ra');
    }

    return res.json();
}

export const organizationService_test = {
    getDepartmentTypes() {
        return request<DepartmentType_test[]>('/api/organization-test/department-types-test1');
    },

    getDepartmentTree(includeInactive = false) {
        return request<DepartmentNode_test[]>(
            `/api/organization-test/departments-test/tree?includeInactive=${includeInactive}`
        );
    },

    getDepartmentById(code: string) {
        return request<DepartmentNode_test>(`/api/organization-test/departments-test/${code}`);
    },

    createDepartment(payload: DepartmentPayload_test) {
        return request<DepartmentNode_test>('/api/organization-test/departments-test', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    updateDepartment(code: string, payload: DepartmentPayload_test) {
        return request<DepartmentNode_test>(`/api/organization-test/departments-test/${code}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    },

    dissolveDepartment(code: string) {
        return request<DepartmentNode_test>(`/api/organization-test/departments-test/${code}/dissolve`, {
            method: 'PATCH',
        });
    },

    getEmployees() {
        return request<EmployeeLite_test[]>('/api/organization-test/employees-test');
    },
};