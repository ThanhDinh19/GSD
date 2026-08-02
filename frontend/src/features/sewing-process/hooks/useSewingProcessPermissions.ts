import { useMemo } from 'react';

import { Permissions } from '../../../config/permissions';

export type PermissionChecker = (
  permissionCode: string
) => boolean;

export function useSewingProcessPermissions(
  can: PermissionChecker
) {
  return useMemo(
    () => ({
      canView:
        can(Permissions.SewingProcess.View),

      canCreate:
        can(Permissions.SewingProcess.Create),

      canUpdate:
        can(Permissions.SewingProcess.Update),

      canCalculate:
        can(Permissions.SewingProcess.Calculate),

      canUploadImage:
        can(Permissions.SewingProcess.UploadImage),
    }),
    [can]
  );
}

