import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  roleManagementService,
} from '../services/roleManagement.service';

import type {
  CreateRolePayload,
  RoleDetail,
  RoleListItem,
  RolePermissionInput,
  RolePermissionMatrix,
  UpdateRolePayload,
} from '../types/roleManagement.type';

type PermissionStateItem = {
  assigned: boolean;
  scopeCode: string;
};

type PermissionState = Record<
  number,
  PermissionStateItem
>;

function createPermissionState(
  matrix: RolePermissionMatrix
): PermissionState {
  const state: PermissionState = {};

  for (const moduleItem of matrix.modules) {
    for (const screen of moduleItem.screens) {
      for (const action of screen.actions) {
        state[action.permissionId] = {
          assigned: action.assigned,
          scopeCode:
            action.scopeCode || 'ALL',
        };
      }
    }
  }

  return state;
}

function permissionStatesEqual(
  first: PermissionState,
  second: PermissionState
) {
  const permissionIds = new Set([
    ...Object.keys(first),
    ...Object.keys(second),
  ]);

  for (const idText of permissionIds) {
    const permissionId = Number(idText);

    const firstItem = first[permissionId];
    const secondItem = second[permissionId];

    if (
      Boolean(firstItem?.assigned) !==
      Boolean(secondItem?.assigned)
    ) {
      return false;
    }

    if (
      firstItem?.assigned &&
      secondItem?.assigned &&
      (firstItem.scopeCode || 'ALL') !==
        (secondItem.scopeCode || 'ALL')
    ) {
      return false;
    }
  }

  return true;
}

export function useRoleManagement() {
  const [roles, setRoles] =
    useState<RoleListItem[]>([]);

  const [
    selectedRoleId,
    setSelectedRoleId,
  ] = useState<number | null>(null);

  const [
    selectedRole,
    setSelectedRole,
  ] = useState<RoleDetail | null>(null);

  const [
    permissionMatrix,
    setPermissionMatrix,
  ] = useState<RolePermissionMatrix | null>(
    null
  );

  const [
    permissionState,
    setPermissionState,
  ] = useState<PermissionState>({});

  const [
    originalPermissionState,
    setOriginalPermissionState,
  ] = useState<PermissionState>({});

  const [loading, setLoading] =
    useState(false);

  const [
    loadingDetail,
    setLoadingDetail,
  ] = useState(false);

  const [savingRole, setSavingRole] =
    useState(false);

  const [
    savingPermissions,
    setSavingPermissions,
  ] = useState(false);

  const [
    deactivatingRole,
    setDeactivatingRole,
  ] = useState(false);

  const [error, setError] =
    useState('');

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data =
        await roleManagementService.getRoles();

      setRoles(data);

      return data;
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Không tải được danh sách vai trò.';

      setError(message);
      throw loadError;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRole = useCallback(
    async (roleId: number) => {
      setSelectedRoleId(roleId);
      setLoadingDetail(true);
      setError('');

      try {
        const [
          roleDetail,
          matrix,
        ] = await Promise.all([
          roleManagementService
            .getRoleById(roleId),

          roleManagementService
            .getRolePermissions(roleId),
        ]);

        const nextPermissionState =
          createPermissionState(matrix);

        setSelectedRole(roleDetail);
        setPermissionMatrix(matrix);

        setPermissionState(
          nextPermissionState
        );

        setOriginalPermissionState(
          nextPermissionState
        );

        return {
          roleDetail,
          matrix,
        };
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Không tải được chi tiết vai trò.';

        setSelectedRole(null);
        setPermissionMatrix(null);
        setPermissionState({});
        setOriginalPermissionState({});
        setError(message);

        throw loadError;
      } finally {
        setLoadingDetail(false);
      }
    },
    []
  );

  const clearSelectedRole =
    useCallback(() => {
      setSelectedRoleId(null);
      setSelectedRole(null);
      setPermissionMatrix(null);
      setPermissionState({});
      setOriginalPermissionState({});
      setError('');
    }, []);

  const createRole = useCallback(
    async (
      payload: CreateRolePayload
    ) => {
      setSavingRole(true);
      setError('');

      try {
        const createdRole =
          await roleManagementService
            .createRole(payload);

        await loadRoles();
        await loadRole(createdRole.id);

        return createdRole;
      } catch (saveError) {
        const message =
          saveError instanceof Error
            ? saveError.message
            : 'Tạo vai trò thất bại.';

        setError(message);
        throw saveError;
      } finally {
        setSavingRole(false);
      }
    },
    [
      loadRole,
      loadRoles,
    ]
  );

  const updateRole = useCallback(
    async (
      roleId: number,
      payload: UpdateRolePayload
    ) => {
      setSavingRole(true);
      setError('');

      try {
        const updatedRole =
          await roleManagementService
            .updateRole(
              roleId,
              payload
            );

        await loadRoles();
        await loadRole(roleId);

        return updatedRole;
      } catch (saveError) {
        const message =
          saveError instanceof Error
            ? saveError.message
            : 'Cập nhật vai trò thất bại.';

        setError(message);
        throw saveError;
      } finally {
        setSavingRole(false);
      }
    },
    [
      loadRole,
      loadRoles,
    ]
  );

  const deactivateRole = useCallback(
    async (roleId: number) => {
      setDeactivatingRole(true);
      setError('');

      try {
        const result =
          await roleManagementService
            .deactivateRole(roleId);

        await loadRoles();

        if (selectedRoleId === roleId) {
          clearSelectedRole();
        }

        return result;
      } catch (deleteError) {
        const message =
          deleteError instanceof Error
            ? deleteError.message
            : 'Ngừng sử dụng vai trò thất bại.';

        setError(message);
        throw deleteError;
      } finally {
        setDeactivatingRole(false);
      }
    },
    [
      clearSelectedRole,
      loadRoles,
      selectedRoleId,
    ]
  );

  const togglePermission =
    useCallback(
      (
        permissionId: number,
        assigned: boolean
      ) => {
        setPermissionState(
          (previous) => ({
            ...previous,
            [permissionId]: {
              assigned,
              scopeCode:
                previous[permissionId]
                  ?.scopeCode || 'ALL',
            },
          })
        );
      },
      []
    );

  const setPermissionScope =
    useCallback(
      (
        permissionId: number,
        scopeCode: string
      ) => {
        setPermissionState(
          (previous) => ({
            ...previous,
            [permissionId]: {
              assigned:
                previous[permissionId]
                  ?.assigned || false,

              scopeCode:
                scopeCode
                  .trim()
                  .toUpperCase() || 'ALL',
            },
          })
        );
      },
      []
    );

  const setScreenPermissions =
    useCallback(
      (
        permissionIds: number[],
        assigned: boolean
      ) => {
        setPermissionState(
          (previous) => {
            const next = {
              ...previous,
            };

            for (
              const permissionId
              of permissionIds
            ) {
              next[permissionId] = {
                assigned,
                scopeCode:
                  previous[permissionId]
                    ?.scopeCode || 'ALL',
              };
            }

            return next;
          }
        );
      },
      []
    );

  const setAllPermissions =
    useCallback(
      (assigned: boolean) => {
        if (!permissionMatrix) return;

        const permissionIds =
          permissionMatrix.modules.flatMap(
            (moduleItem) =>
              moduleItem.screens.flatMap(
                (screen) =>
                  screen.actions.map(
                    (action) =>
                      action.permissionId
                  )
              )
          );

        setScreenPermissions(
          permissionIds,
          assigned
        );
      },
      [
        permissionMatrix,
        setScreenPermissions,
      ]
    );

  const selectedPermissions =
    useMemo<RolePermissionInput[]>(
      () => {
        return Object.entries(
          permissionState
        )
          .filter(
            ([, item]) => item.assigned
          )
          .map(
            ([
              permissionId,
              item,
            ]) => ({
              permissionId:
                Number(permissionId),

              scopeCode:
                item.scopeCode || 'ALL',
            })
          );
      },
      [permissionState]
    );

  const hasPermissionChanges =
    useMemo(() => {
      return !permissionStatesEqual(
        permissionState,
        originalPermissionState
      );
    }, [
      permissionState,
      originalPermissionState,
    ]);

  const resetPermissionChanges =
    useCallback(() => {
      setPermissionState({
        ...originalPermissionState,
      });
    }, [originalPermissionState]);

  const saveRolePermissions =
    useCallback(
      async (reason?: string) => {
        if (!selectedRoleId) {
          throw new Error(
            'Vui lòng chọn vai trò.'
          );
        }

        setSavingPermissions(true);
        setError('');

        try {
          const data =
            await roleManagementService
              .updateRolePermissions(
                selectedRoleId,
                {
                  permissions:
                    selectedPermissions,
                  reason,
                }
              );

          const nextPermissionState =
            createPermissionState(data);

          setPermissionMatrix(data);

          setPermissionState(
            nextPermissionState
          );

          setOriginalPermissionState(
            nextPermissionState
          );

          await loadRoles();

          return data;
        } catch (saveError) {
          const message =
            saveError instanceof Error
              ? saveError.message
              : 'Cập nhật quyền vai trò thất bại.';

          setError(message);
          throw saveError;
        } finally {
          setSavingPermissions(false);
        }
      },
      [
        loadRoles,
        selectedPermissions,
        selectedRoleId,
      ]
    );

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  return {
    roles,
    selectedRoleId,
    selectedRole,
    permissionMatrix,
    permissionState,

    loading,
    loadingDetail,
    savingRole,
    savingPermissions,
    deactivatingRole,
    error,

    selectedPermissions,
    hasPermissionChanges,

    loadRoles,
    loadRole,
    clearSelectedRole,

    createRole,
    updateRole,
    deactivateRole,

    togglePermission,
    setPermissionScope,
    setScreenPermissions,
    setAllPermissions,
    resetPermissionChanges,
    saveRolePermissions,
  };
}