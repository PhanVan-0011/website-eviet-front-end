import { useSelector } from 'react-redux';
import { hasPermission } from '../../helpers/permission';


const Permission = ({ permission, children, fallback = null }) => {
  const permissions = useSelector(state =>
    state.auth?.permissions && state.auth.permissions.length > 0
      ? state.auth.permissions
      : []
  );
  if (hasPermission(permissions, permission)) {
    return children;
  }
  return fallback;
};

export default Permission;