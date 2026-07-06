import { DepartmentType, DepartmentNode, DepartmentPayload, EmployeeLite } from "../types";

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

export const organizationService = {
    getDepartmentTypes() {
        return request<DepartmentType[]>('/api/organization/department-types');
    },

    getDepartmentTree(includeInactive = false) {
        return request<DepartmentNode[]>(
            `/api/organization/departments/tree?includeInactive=${includeInactive}`
        );
    },

    getDepartmentById(id: string) {
        return request<DepartmentNode>(`/api/organization/departments/${id}`);
    },

    createDepartment(payload: DepartmentPayload) {
        return request<DepartmentNode>('/api/organization/departments', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    updateDepartment(id: string, payload: DepartmentPayload) {
        return request<DepartmentNode>(`/api/organization/departments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    },

    dissolveDepartment(id: string) {
        return request<DepartmentNode>(`/api/organization/departments/${id}/dissolve`, {
            method: 'PATCH',
        });
    },

    getEmployees() {
        return request<EmployeeLite[]>('/api/organization/employees');
    },
};