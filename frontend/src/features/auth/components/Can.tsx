import type {
  ReactNode,
} from 'react';

import {
  useAuth,
} from '../hooks/useAuth';

type CanProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({
  permission,
  children,
  fallback = null,
}: CanProps) {
  const {
    hasPermission,
  } = useAuth();

  return (
    <>
      {hasPermission(permission) ? children : fallback}
    </>
  );
}