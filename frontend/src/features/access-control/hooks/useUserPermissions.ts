import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  accessControlService,
} from '../services/accessControl.service';

import type {
  PermissionChange,
  UserListItem,
  UserPermissionAction,
  UserPermissionMatrix,
  PermissionOperation,
} from '../types/accessControl.type';

function flattenActions(
  matrix: UserPermissionMatrix | null
): UserPermissionAction[] {
  if (!matrix) return [];

  return matrix.modules.flatMap((moduleItem) =>
    moduleItem.screens.flatMap((screen) => screen.actions)
  );
}

export function useUserPermissions() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [matrix, setMatrix] = useState<UserPermissionMatrix | null>(null);
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const actions = useMemo(
    () => flattenActions(matrix),
    [matrix]
  );

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError('');

    try {
      const data = await accessControlService.getUsers();

      setUsers(data);

      if (data.length > 0) {
        setSelectedUserId((current) => current ?? data[0].id);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Không tải được danh sách tài khoản.'
      );
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const loadMatrix = useCallback(async (userId: number) => {
    setLoadingMatrix(true);
    setError('');

    try {
      const data =
        await accessControlService.getUserPermissionMatrix(userId);

      const nextCheckedMap: Record<number, boolean> = {};

      data.modules.forEach((moduleItem) => {
        moduleItem.screens.forEach((screen) => {
          screen.actions.forEach((action) => {
            nextCheckedMap[action.permissionId] =
              action.effectiveAllowed;
          });
        });
      });

      setMatrix(data);
      setCheckedMap(nextCheckedMap);
    } catch (loadError) {
      setMatrix(null);

      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Không tải được phân quyền tài khoản.'
      );
    } finally {
      setLoadingMatrix(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (selectedUserId) {
      void loadMatrix(selectedUserId);
    }
  }, [selectedUserId, loadMatrix]);

  const togglePermission = (
    permissionId: number,
    checked: boolean
  ) => {
    setCheckedMap((previous) => ({
      ...previous,
      [permissionId]: checked,
    }));
  };

const changes = useMemo<PermissionChange[]>(() => {
  return actions.flatMap((action): PermissionChange[] => {
    const checked = checkedMap[action.permissionId] ?? action.effectiveAllowed;

    if (checked === action.effectiveAllowed) {
      return [];
    }

    let operation: PermissionOperation;

    if (checked) {
      operation = action.inheritedFromRole ? 'REMOVE_OVERRIDE' : 'ALLOW';
    } else {
      operation = action.inheritedFromRole ? 'DENY' : 'REMOVE_OVERRIDE';
    }

    return [
      {
        permissionId: action.permissionId,
        operation,
        ...(operation !== 'REMOVE_OVERRIDE' && {
          scopeCode: action.overrideScopeCode || 'ALL',
        }),
      },
    ];
  });
}, [actions, checkedMap]);

  const save = async () => {
    if (!selectedUserId || changes.length === 0) return;

    setSaving(true);
    setError('');

    try {
      await accessControlService.saveUserPermissionOverrides(
        selectedUserId,
        {
          changes,
        }
      );

      await loadMatrix(selectedUserId);

      alert('Cập nhật phân quyền thành công.');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Cập nhật phân quyền thất bại.'
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    users,
    selectedUserId,
    matrix,
    checkedMap,
    changes,

    loadingUsers,
    loadingMatrix,
    saving,
    error,

    setSelectedUserId,
    togglePermission,
    save,
    reload: loadUsers,
  };
}