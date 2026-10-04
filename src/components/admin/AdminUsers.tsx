import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Crown,
  Mail,
  User as UserIcon,
  X,
  Lock,
} from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { UserProfile, FirestoreOrder } from '../../types/auth';
import { getAllUsers, updateUserRole, updateUserOwnerStatus } from '../../lib/usersApi';
import { Button } from '../ui/Button';

interface AdminUsersProps {
  orders: FirestoreOrder[];
  currentUserId?: string;
  isCurrentUserOwner?: boolean;
  onShowMessage?: (msg: { text: string; type: 'success' | 'error' }) => void;
  users?: UserProfile[];
  setUsers?: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  loading?: boolean;
  onRefreshUsers?: (isManualRefresh?: boolean) => Promise<void>;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  orders,
  currentUserId,
  isCurrentUserOwner = false,
  onShowMessage,
  users: propUsers,
  setUsers: propSetUsers,
  loading: propLoading,
  onRefreshUsers,
}) => {
  const { lang, t, formatNumber } = useI18n();

  const [internalUsers, setInternalUsers] = useState<UserProfile[]>([]);
  const users = propUsers ?? internalUsers;
  const setUsers = propSetUsers ?? setInternalUsers;

  const [internalLoading, setInternalLoading] = useState<boolean>(true);
  const loading = propLoading !== undefined ? propLoading : internalLoading;
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Confirmation modal state for role change
  const [confirmRoleTarget, setConfirmRoleTarget] = useState<{
    user: UserProfile;
    newRole: 'customer' | 'admin';
  } | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState<boolean>(false);

  // Confirmation modal state for Owner grant/revoke
  const [confirmOwnerTarget, setConfirmOwnerTarget] = useState<{
    user: UserProfile;
    newIsOwner: boolean;
  } | null>(null);
  const [ownerConfirmInput, setOwnerConfirmInput] = useState<string>('');
  const [isUpdatingOwner, setIsUpdatingOwner] = useState<boolean>(false);

  // Single getDocs load
  const loadUsers = useCallback(
    async (isManualRefresh = false) => {
      if (onRefreshUsers) {
        if (isManualRefresh) setRefreshing(true);
        try {
          await onRefreshUsers(isManualRefresh);
        } finally {
          setRefreshing(false);
        }
        return;
      }

      if (isManualRefresh) setRefreshing(true);
      else setInternalLoading(true);

      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err: any) {
        console.error('Failed to load users:', err);
        if (onShowMessage) {
          onShowMessage({
            text: t('admin.users.errorLoad'),
            type: 'error',
          });
        }
      } finally {
        setInternalLoading(false);
        setRefreshing(false);
      }
    },
    [t, onShowMessage, onRefreshUsers, setUsers]
  );

  useEffect(() => {
    // Only fetch internally if parent did not provide pre-loaded users
    if (propUsers === undefined) {
      loadUsers();
    }
  }, [loadUsers, propUsers]);

  // Order count per user
  const orderCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const order of orders) {
      if (order.userId) {
        map[order.userId] = (map[order.userId] || 0) + 1;
      }
    }
    return map;
  }, [orders]);

  // Client-side search filtering by name or email
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q))
    );
  }, [users, searchQuery]);

  // Role change request handler
  const handleRequestRoleChange = (targetUser: UserProfile) => {
    // 1. Self-demotion check
    if (targetUser.uid === currentUserId) return;

    // 2. Regular admin check: cannot change role of an existing admin
    if (!isCurrentUserOwner && targetUser.role === 'admin') {
      if (onShowMessage) {
        onShowMessage({
          text: t('admin.users.onlyOwnerError'),
          type: 'error',
        });
      }
      return;
    }

    const nextRole: 'customer' | 'admin' = targetUser.role === 'admin' ? 'customer' : 'admin';
    setConfirmRoleTarget({ user: targetUser, newRole: nextRole });
  };

  // Perform role update with optimistic UI update and revert on error
  const handleConfirmRoleChange = async () => {
    if (!confirmRoleTarget) return;

    const { user: targetUser, newRole } = confirmRoleTarget;
    const prevRole = targetUser.role;

    // Optimistic local update
    setUsers((prev) =>
      prev.map((u) => (u.uid === targetUser.uid ? { ...u, role: newRole } : u))
    );
    setIsUpdatingRole(true);

    try {
      await updateUserRole(targetUser.uid, newRole);

      if (onShowMessage) {
        onShowMessage({
          text:
            newRole === 'admin'
              ? t('admin.users.promotedSuccess', { user: targetUser.name || targetUser.email || '' })
              : t('admin.users.demotedSuccess', { user: targetUser.name || targetUser.email || '' }),
          type: 'success',
        });
      }
      setConfirmRoleTarget(null);
    } catch (err: any) {
      console.error('Failed to update user role:', err);
      // Revert optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, role: prevRole } : u))
      );
      if (onShowMessage) {
        onShowMessage({
          text: t('admin.users.errorUpdateRole'),
          type: 'error',
        });
      }
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Owner status grant/revoke request handler
  const handleRequestOwnerChange = (targetUser: UserProfile) => {
    if (!isCurrentUserOwner) return;
    if (targetUser.uid === currentUserId) return; // Cannot revoke own owner status

    const nextIsOwner = !targetUser.isOwner;
    setConfirmOwnerTarget({ user: targetUser, newIsOwner: nextIsOwner });
    setOwnerConfirmInput('');
  };

  // Confirm Owner status update (requires typing "CONFIRM")
  const handleConfirmOwnerChange = async () => {
    if (!confirmOwnerTarget) return;
    if (ownerConfirmInput.trim().toUpperCase() !== 'CONFIRM') return;

    const { user: targetUser, newIsOwner } = confirmOwnerTarget;
    const prevIsOwner = targetUser.isOwner;

    // Optimistic local update
    setUsers((prev) =>
      prev.map((u) => (u.uid === targetUser.uid ? { ...u, isOwner: newIsOwner } : u))
    );
    setIsUpdatingOwner(true);

    try {
      await updateUserOwnerStatus(targetUser.uid, newIsOwner);

      if (onShowMessage) {
        onShowMessage({
          text:
            newIsOwner
              ? t('admin.users.ownerGrantedSuccess', { user: targetUser.name || targetUser.email || '' })
              : t('admin.users.ownerRevokedSuccess', { user: targetUser.name || targetUser.email || '' }),
          type: 'success',
        });
      }
      setConfirmOwnerTarget(null);
      setOwnerConfirmInput('');
    } catch (err: any) {
      console.error('Failed to update owner status:', err);
      // Revert optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, isOwner: prevIsOwner } : u))
      );
      if (onShowMessage) {
        onShowMessage({
          text: t('admin.users.errorUpdateOwner'),
          type: 'error',
        });
      }
    } finally {
      setIsUpdatingOwner(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return lang === 'fa' ? d.toLocaleDateString('fa-IR') : d.toLocaleDateString('en-US');
    } catch {
      return '-';
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-md shadow-xs">
      {/* Toolbar */}
      <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gold-dark stroke-[1.5]" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900">
                {t('admin.users.title')}
              </h2>
              {isCurrentUserOwner && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gold/15 text-gold-dark border border-gold/40 px-2 py-0.5 rounded-full">
                  <Crown className="w-3 h-3 text-gold-dark fill-gold/30" />
                  <span>{t('admin.users.ownerMode')}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              {t('admin.users.totalUsers', { count: formatNumber(users.length) })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:max-w-md justify-end">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t('admin.users.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded px-3 py-1.5 ps-8 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-800"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsers(true)}
            disabled={refreshing || loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 stroke-[1.5] ${refreshing ? 'animate-spin' : ''}`} />}
          >
            {t('admin.users.refresh')}
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-500">
              {t('admin.users.loading')}
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs">
            <Users className="w-10 h-10 stroke-[1] text-zinc-300 mx-auto mb-2" />
            <p className="font-medium text-zinc-700 mb-1">
              {t('admin.users.emptyTitle')}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gold-dark hover:underline mt-2 inline-block cursor-pointer"
              >
                {t('admin.users.clearSearch')}
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-xs text-start">
            <thead className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-600 font-medium">
              <tr>
                <th className="py-3 px-4 text-start">{t('admin.users.thUser')}</th>
                <th className="py-3 px-4 text-start">{t('admin.users.thEmail')}</th>
                <th className="py-3 px-4 text-center">{t('admin.users.thRoleLevel')}</th>
                <th className="py-3 px-4 text-start">{t('admin.users.thRegistered')}</th>
                <th className="py-3 px-4 text-center">{t('admin.users.thOrdersPlaced')}</th>
                <th className="py-3 px-4 text-end">{t('admin.users.thRoleManagement')}</th>
                {isCurrentUserOwner && (
                  <th className="py-3 px-4 text-center">{t('admin.users.thOwnerFlag')}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredUsers.map((u) => {
                const isSelf = u.uid === currentUserId;
                const orderCount = orderCountMap[u.uid] || 0;
                const isAdminRole = u.role === 'admin';
                const isUserOwner = Boolean(u.isOwner);

                // Permission check for regular admins:
                // If current user is NOT an owner, they CANNOT touch any existing admin.
                const isActionBlockedForRegularAdmin = !isCurrentUserOwner && isAdminRole;

                return (
                  <tr key={u.uid} className="hover:bg-zinc-50/80 transition-colors">
                    {/* Name / Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-semibold text-xs shrink-0 relative">
                          {u.name ? u.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                          {isUserOwner && (
                            <span
                              className="absolute -top-1 -end-1 w-3.5 h-3.5 bg-gold text-white rounded-full flex items-center justify-center ring-1 ring-white"
                              title={t('admin.users.roleOwner')}
                            >
                              <Crown className="w-2.5 h-2.5 fill-white" />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-zinc-900">
                              {u.name || t('admin.users.guestUser')}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] bg-gold/15 text-gold-dark font-medium px-1.5 py-0.5 rounded">
                                {t('admin.users.you')}
                              </span>
                            )}
                          </div>
                          {u.phone && (
                            <span className="text-[11px] text-zinc-400 font-mono block" dir="ltr">
                              {u.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 font-mono text-zinc-700">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span dir="ltr">{u.email || '-'}</span>
                      </div>
                    </td>

                    {/* Distinct Role Badges */}
                    <td className="py-3 px-4 text-center">
                      {isUserOwner ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gold/15 text-gold-dark border border-gold/40 shadow-2xs">
                          <Crown className="w-3.5 h-3.5 text-gold-dark fill-gold/30" />
                          <span>{t('admin.users.roleOwner')}</span>
                        </span>
                      ) : isAdminRole ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
                          <span>{t('admin.users.roleAdmin')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-50 text-zinc-500 border border-zinc-200">
                          <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{t('admin.users.roleCustomer')}</span>
                        </span>
                      )}
                    </td>

                    {/* Registration Date */}
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-600">
                      {formatDate(u.createdAt)}
                    </td>

                    {/* Orders Placed */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                          orderCount > 0
                            ? 'bg-gold/15 text-gold-dark font-bold'
                            : 'bg-zinc-100 text-zinc-400'
                        }`}
                      >
                        {formatNumber(orderCount)}
                      </span>
                    </td>

                    {/* Role Action Button */}
                    <td className="py-3 px-4 text-end">
                      {isSelf ? (
                        <span
                          className="text-[11px] text-zinc-400 italic px-2 py-1 select-none"
                          title={t('admin.users.cannotDemoteSelf')}
                        >
                          {t('admin.users.currentAccount')}
                        </span>
                      ) : isActionBlockedForRegularAdmin ? (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-100 border border-zinc-200 px-2 py-1 rounded select-none cursor-not-allowed"
                          title={t('admin.users.ownerOnlyTooltip')}
                        >
                          <Lock className="w-3 h-3 text-zinc-400" />
                          <span>{t('admin.users.ownerOnlyNotice')}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRequestRoleChange(u)}
                          className={`text-xs px-3 py-1.5 rounded transition-colors cursor-pointer border font-medium ${
                            isAdminRole
                              ? 'bg-zinc-100 hover:bg-red-50 text-zinc-700 hover:text-red-700 border-zinc-300 hover:border-red-300'
                              : 'bg-zinc-900 hover:bg-gold-dark text-white border-zinc-900 hover:border-gold-dark'
                          }`}
                        >
                          {isAdminRole
                            ? t('admin.users.demoteToCustomer')
                            : t('admin.users.promoteToAdmin')}
                        </button>
                      )}
                    </td>

                    {/* Owner Flag Management Column (Owner-only control) */}
                    {isCurrentUserOwner && (
                      <td className="py-3 px-4 text-center">
                        {isSelf ? (
                          <span
                            className="text-[11px] text-zinc-400 italic select-none"
                            title={t('admin.users.cannotRevokeSelfOwner')}
                          >
                            -
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRequestOwnerChange(u)}
                            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors cursor-pointer ${
                              isUserOwner
                                ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                                : 'bg-gold/10 text-gold-dark border-gold/40 hover:bg-gold/20'
                            }`}
                            title={
                              isUserOwner
                                ? t('admin.users.revokeOwnerTooltip')
                                : t('admin.users.grantOwnerTooltip')
                            }
                          >
                            <Crown className="w-3 h-3 text-gold-dark" />
                            <span>
                              {isUserOwner
                                ? t('admin.users.revokeOwnerBtn')
                                : t('admin.users.grantOwnerBtn')}
                            </span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal for Role Change */}
      {confirmRoleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-start text-xs border border-zinc-200">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  confirmRoleTarget.newRole === 'admin'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {confirmRoleTarget.newRole === 'admin' ? (
                  <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
                ) : (
                  <AlertCircle className="w-5 h-5 stroke-[1.5]" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900">
                  {confirmRoleTarget.newRole === 'admin'
                    ? t('admin.users.modalPromoteTitle')
                    : t('admin.users.modalDemoteTitle')}
                </h4>
                <p className="text-zinc-500 text-xs">
                  {t('admin.users.modalUserPrefix', { user: confirmRoleTarget.user.name || confirmRoleTarget.user.email || '' })}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-600 mb-4 bg-zinc-50 p-2.5 rounded border border-zinc-200 leading-relaxed">
              {confirmRoleTarget.newRole === 'admin'
                ? t('admin.users.confirmPromoteMsg', { user: confirmRoleTarget.user.name || confirmRoleTarget.user.email || '' })
                : t('admin.users.confirmDemoteMsg', { user: confirmRoleTarget.user.name || confirmRoleTarget.user.email || '' })}
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmRoleTarget(null)}
                disabled={isUpdatingRole}
              >
                {t('admin.users.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmRoleChange}
                disabled={isUpdatingRole}
                isLoading={isUpdatingRole}
                className={
                  confirmRoleTarget.newRole === 'admin'
                    ? 'bg-zinc-900 hover:bg-gold-dark text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }
              >
                {confirmRoleTarget.newRole === 'admin'
                  ? t('admin.users.yesMakeAdmin')
                  : t('admin.users.yesDemote')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Owner Grant/Revoke with CONFIRM typing */}
      {confirmOwnerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-start text-xs border border-zinc-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 text-gold-dark flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 fill-gold/40 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900">
                  {confirmOwnerTarget.newIsOwner
                    ? t('admin.users.modalGrantOwnerTitle')
                    : t('admin.users.modalRevokeOwnerTitle')}
                </h4>
                <p className="text-zinc-500 text-xs">
                  {t('admin.users.targetUserPrefix', { user: confirmOwnerTarget.user.name || confirmOwnerTarget.user.email || '' })}
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] leading-relaxed mb-4">
              <strong>{t('admin.users.criticalWarning')}</strong>{' '}
              {confirmOwnerTarget.newIsOwner
                ? t('admin.users.warningGrantMsg')
                : t('admin.users.warningRevokeMsg')}
            </div>

            <div className="mb-4">
              <label className="block font-medium text-zinc-800 mb-1">
                {t('admin.users.typeConfirmPrompt')}
              </label>
              <input
                type="text"
                dir="ltr"
                placeholder="CONFIRM"
                value={ownerConfirmInput}
                onChange={(e) => setOwnerConfirmInput(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded p-2 font-mono uppercase text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfirmOwnerTarget(null);
                  setOwnerConfirmInput('');
                }}
                disabled={isUpdatingOwner}
              >
                {t('admin.users.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmOwnerChange}
                disabled={isUpdatingOwner || ownerConfirmInput.trim().toUpperCase() !== 'CONFIRM'}
                isLoading={isUpdatingOwner}
                className={
                  confirmOwnerTarget.newIsOwner
                    ? 'bg-gold-dark hover:bg-gold text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }
              >
                {confirmOwnerTarget.newIsOwner
                  ? t('admin.users.confirmGrantOwner')
                  : t('admin.users.confirmRevokeOwner')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
