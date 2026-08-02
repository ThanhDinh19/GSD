import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import type {
  RoleListItem,
} from '../../role-management/types/roleManagement.type';

import {
  systemUserService,
} from '../services/systemUser.service';

import type {
  CreateUserWithRolesPayload,
  EmployeeOption,
  SystemUser,
  SystemUserDetail,
  UpdateUserPayload,
} from '../types/systemUser.type';

export function useSystemUsers() {
  const [users, setUsers] =
    useState<SystemUser[]>([]);

  const [employees, setEmployees] =
    useState<EmployeeOption[]>([]);

  const [roles, setRoles] =
    useState<RoleListItem[]>([]);

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<SystemUserDetail | null>(
    null
  );

  const [loading, setLoading] =
    useState(false);

  const [
    loadingEmployees,
    setLoadingEmployees,
  ] = useState(false);

  const [
    loadingRoles,
    setLoadingRoles,
  ] = useState(false);

  const [
    loadingUserDetail,
    setLoadingUserDetail,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState('');

  const loadUsers =
    useCallback(async () => {
      setLoading(true);
      setError('');

      try {
        const data =
          await systemUserService
            .getUsers();

        setUsers(data);

        return data;
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Không tải được danh sách tài khoản.';

        setError(message);
        throw loadError;
      } finally {
        setLoading(false);
      }
    }, []);

  const loadEmployeeOptions =
    useCallback(async () => {
      setLoadingEmployees(true);
      setError('');

      try {
        const data =
          await systemUserService
            .getEmployeeOptions();

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
        setLoadingEmployees(false);
      }
    }, []);

  const loadRoles =
    useCallback(async () => {
      setLoadingRoles(true);
      setError('');

      try {
        const data =
          await systemUserService
            .getRoles();

        const activeRoles =
          data.filter(
            (role) =>
              role.statusId === 0
          );

        setRoles(activeRoles);

        return activeRoles;
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Không tải được danh sách vai trò.';

        setError(message);
        throw loadError;
      } finally {
        setLoadingRoles(false);
      }
    }, []);

  const loadUserDetail =
    useCallback(
      async (userId: number) => {
        setLoadingUserDetail(true);
        setError('');

        try {
          const data =
            await systemUserService
              .getUserById(userId);

          setSelectedUser(data);

          return data;
        } catch (loadError) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : 'Không tải được chi tiết tài khoản.';

          setSelectedUser(null);
          setError(message);

          throw loadError;
        } finally {
          setLoadingUserDetail(false);
        }
      },
      []
    );

  const clearSelectedUser =
    useCallback(() => {
      setSelectedUser(null);
    }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const createUser = async (
    payload: CreateUserWithRolesPayload
  ) => {
    setSaving(true);
    setError('');

    const {
      roleIds,
      ...userPayload
    } = payload;

    try {
      const createdUser =
        await systemUserService
          .createUser(userPayload);

      try {
        await systemUserService
          .assignRoles(
            createdUser.id,
            roleIds
          );
      } catch (assignRoleError) {
        await loadUsers();

        const roleMessage =
          assignRoleError instanceof Error
            ? assignRoleError.message
            : 'Không gán được vai trò.';

        throw new Error(
          `Tài khoản đã được tạo nhưng gán vai trò thất bại: ${roleMessage}`
        );
      }

      await Promise.all([
        loadUsers(),
        loadEmployeeOptions(),
      ]);

      alert(
        'Tạo tài khoản và gán vai trò thành công.'
      );

      return createdUser;
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : 'Tạo tài khoản thất bại.';

      setError(message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (
    userId: number,
    payload: UpdateUserPayload
  ) => {
    setUpdating(true);
    setError('');

    try {
      const updatedUser =
        await systemUserService
          .updateUser(
            userId,
            payload
          );

      setSelectedUser(updatedUser);

      await loadUsers();

      alert(
        'Cập nhật tài khoản thành công.'
      );

      return updatedUser;
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : 'Cập nhật tài khoản thất bại.';

      setError(message);
      throw updateError;
    } finally {
      setUpdating(false);
    }
  };

  const updateUserWithRoles = async (
    userId: number,
    payload: UpdateUserPayload,
    roleIds: number[]
  ) => {
    setUpdating(true);
    setError('');

    try {
      await systemUserService.updateUser(
        userId,
        payload
      );

      try {
        await systemUserService.assignRoles(
          userId,
          roleIds
        );
      } catch (assignRoleError) {
        await loadUsers();

        const roleMessage =
          assignRoleError instanceof Error
            ? assignRoleError.message
            : 'Không cập nhật được vai trò.';

        throw new Error(
          `Thông tin tài khoản đã được cập nhật nhưng cập nhật vai trò thất bại: ${roleMessage}`
        );
      }

      const refreshedUser =
        await systemUserService.getUserById(
          userId
        );

      setSelectedUser(refreshedUser);

      await loadUsers();

      alert(
        'Cập nhật tài khoản và vai trò thành công.'
      );

      return refreshedUser;
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : 'Cập nhật tài khoản thất bại.';

      setError(message);
      throw updateError;
    } finally {
      setUpdating(false);
    }
  };

  return {
    users,
    employees,
    roles,
    selectedUser,

    loading,
    loadingEmployees,
    loadingRoles,
    loadingUserDetail,
    saving,
    updating,
    error,

    loadUsers,
    loadEmployeeOptions,
    loadRoles,
    loadUserDetail,
    clearSelectedUser,

    createUser,
    updateUser,
    updateUserWithRoles,
  };
}