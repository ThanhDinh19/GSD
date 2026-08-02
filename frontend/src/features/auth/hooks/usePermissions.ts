import {
  useAuth,
} from './useAuth';

import {
  ACTION,
} from '../constants/permission.constants';

export function usePermissions(screenCode: string) {
  const {
    hasPermission,
  } = useAuth();

  const has = (actionCode: string) => {
    return hasPermission(`${screenCode}.${actionCode}`);
  };

  return {
    has,

    canView: has(ACTION.VIEW),
    canCreate: has(ACTION.CREATE),
    canUpdate: has(ACTION.UPDATE),
    canDelete: has(ACTION.DELETE),
    canExport: has(ACTION.EXPORT),
    canApprove: has(ACTION.APPROVE),
    canReview: has(ACTION.REVIEW),
    canSubmit: has(ACTION.SUBMIT),
    canReject: has(ACTION.REJECT),
    canReturn: has(ACTION.RETURN),
    canMonitor: has(ACTION.MONITOR),
    canManage: has(ACTION.MANAGE),
    canCalculate: has(ACTION.CALCULATE),
    canUploadImage: has(ACTION.UPLOAD_IMAGE),
    canLock: has(ACTION.LOCK),
    canResetPassword: has(ACTION.RESET_PASSWORD),
  };
}