import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  systemEmployeeService,
} from '../services/systemEmployee.service';

import type {
  CreateEmployeePayload,
  EmployeeFilters,
  EmployeeManagerOption,
  SystemEmployee,
  SystemEmployeeDetail,
  UpdateEmployeePayload,
} from '../types/systemEmployee.type';

const initialFilters: EmployeeFilters = {
  search: '',
  statusId: '',
  departmentCode: '',
};

export function useSystemEmployees() {
  const [employees, setEmployees] =
    useState<SystemEmployee[]>([]);

  const [
    selectedEmployee,
    setSelectedEmployee,
  ] = useState<SystemEmployeeDetail | null>(
    null
  );

  const [filters, setFilters] =
    useState<EmployeeFilters>(
      initialFilters
    );

  const [loading, setLoading] =
    useState(false);

  const [
    loadingDetail,
    setLoadingDetail,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    deactivating,
    setDeactivating,
  ] = useState(false);

  const [error, setError] =
    useState('');

  const loadEmployees =
    useCallback(
      async (
        overrideFilters?: EmployeeFilters
      ) => {
        setLoading(true);
        setError('');

        try {
          const data =
            await systemEmployeeService
              .getEmployees(
                overrideFilters || filters
              );

          setEmployees(data);

          return data;
        } catch (loadError) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : 'Không tải được danh sách nhân viên.';

          setError(message);

          throw loadError;
        } finally {
          setLoading(false);
        }
      },
      [filters]
    );

  const loadEmployeeDetail =
    useCallback(
      async (employeeId: number) => {
        setLoadingDetail(true);
        setError('');

        try {
          const data =
            await systemEmployeeService
              .getEmployeeById(
                employeeId
              );

          setSelectedEmployee(data);

          return data;
        } catch (loadError) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : 'Không tải được chi tiết nhân viên.';

          setSelectedEmployee(null);
          setError(message);

          throw loadError;
        } finally {
          setLoadingDetail(false);
        }
      },
      []
    );

  const clearSelectedEmployee =
    useCallback(() => {
      setSelectedEmployee(null);
    }, []);

  const updateFilter = useCallback(
    <K extends keyof EmployeeFilters>(
      field: K,
      value: EmployeeFilters[K]
    ) => {
      setFilters((previous) => ({
        ...previous,
        [field]: value,
      }));
    },
    []
  );

  const resetFilters =
    useCallback(() => {
      setFilters(initialFilters);
    }, []);

  const createEmployee =
    useCallback(
      async (
        payload: CreateEmployeePayload
      ) => {
        setSaving(true);
        setError('');

        try {
          const createdEmployee =
            await systemEmployeeService
              .createEmployee(payload);

          await loadEmployees();

          alert(
            'Thêm nhân viên thành công.'
          );

          return createdEmployee;
        } catch (saveError) {
          const message =
            saveError instanceof Error
              ? saveError.message
              : 'Thêm nhân viên thất bại.';

          setError(message);

          throw saveError;
        } finally {
          setSaving(false);
        }
      },
      [loadEmployees]
    );

  const updateEmployee =
    useCallback(
      async (
        employeeId: number,
        payload: UpdateEmployeePayload
      ) => {
        setSaving(true);
        setError('');

        try {
          const updatedEmployee =
            await systemEmployeeService
              .updateEmployee(
                employeeId,
                payload
              );

          setSelectedEmployee(
            updatedEmployee
          );

          await loadEmployees();

          alert(
            'Cập nhật nhân viên thành công.'
          );

          return updatedEmployee;
        } catch (saveError) {
          const message =
            saveError instanceof Error
              ? saveError.message
              : 'Cập nhật nhân viên thất bại.';

          setError(message);

          throw saveError;
        } finally {
          setSaving(false);
        }
      },
      [loadEmployees]
    );

  const deactivateEmployee =
    useCallback(
      async (employeeId: number) => {
        setDeactivating(true);
        setError('');

        try {
          const deactivatedEmployee =
            await systemEmployeeService
              .deactivateEmployee(
                employeeId
              );

          if (
            selectedEmployee?.id ===
            employeeId
          ) {
            setSelectedEmployee(
              deactivatedEmployee
            );
          }

          await loadEmployees();

          alert(
            'Ngừng sử dụng nhân viên thành công.'
          );

          return deactivatedEmployee;
        } catch (deleteError) {
          const message =
            deleteError instanceof Error
              ? deleteError.message
              : 'Ngừng sử dụng nhân viên thất bại.';

          setError(message);

          throw deleteError;
        } finally {
          setDeactivating(false);
        }
      },
      [
        loadEmployees,
        selectedEmployee?.id,
      ]
    );

  const managerOptions =
    useMemo<EmployeeManagerOption[]>(
      () => {
        return employees
          .filter(
            (employee) =>
              employee.statusId === 0
          )
          .map((employee) => ({
            id: employee.id,
            employeeCode:
              employee.employeeCode,
            fullName:
              employee.fullName,
            departmentCode:
              employee.departmentCode,
            jobTitle:
              employee.jobTitle,
          }));
      },
      [employees]
    );

  const departmentOptions =
    useMemo(() => {
      return Array.from(
        new Set(
          employees
            .map(
              (employee) =>
                employee.departmentCode
            )
            .filter(
              (
                departmentCode
              ): departmentCode is string =>
                Boolean(
                  departmentCode
                )
            )
        )
      ).sort((first, second) =>
        first.localeCompare(second)
      );
    }, [employees]);

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void loadEmployees();
      }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadEmployees]);

  return {
    employees,
    selectedEmployee,
    managerOptions,
    departmentOptions,
    filters,

    loading,
    loadingDetail,
    saving,
    deactivating,
    error,

    loadEmployees,
    loadEmployeeDetail,
    clearSelectedEmployee,

    updateFilter,
    resetFilters,

    createEmployee,
    updateEmployee,
    deactivateEmployee,
  };
}