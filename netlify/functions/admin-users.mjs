import { FieldValue } from 'firebase-admin/firestore';
import { getAdminServices, verifyRequest } from './_firebaseAdmin.mjs';

const SUPER_ADMIN = 'super_admin';
const ADMIN = 'admin';
const STAFF_ROLES = ['order_fulfillment', 'shipping', 'customer_care', 'promotions'];

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const canAssignRole = (actorRole, targetRole) => {
  if (actorRole === SUPER_ADMIN) {
    return targetRole === ADMIN || STAFF_ROLES.includes(targetRole);
  }

  if (actorRole === ADMIN) {
    return STAFF_ROLES.includes(targetRole);
  }

  return false;
};

const canManageTarget = (actorRole, targetRole) => {
  if (actorRole === SUPER_ADMIN) {
    return targetRole !== SUPER_ADMIN;
  }

  if (actorRole === ADMIN) {
    return STAFF_ROLES.includes(targetRole);
  }

  return false;
};

const parseBody = (event) => {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch {
    return {};
  }
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true });
  }

  try {
    const { auth, db, decoded, profile } = await verifyRequest(event);
    const actorRole = profile?.role;

    if (![SUPER_ADMIN, ADMIN].includes(actorRole)) {
      return json(403, { error: 'This account does not have staff management privileges.' });
    }

    if (event.httpMethod === 'GET') {
      const [docsSnap, listUsersResult] = await Promise.all([
        db.collection('users').get(),
        auth.listUsers(1000),
      ]);

      const docs = new Map(docsSnap.docs.map((doc) => [doc.id, { uid: doc.id, ...doc.data() }]));
      const users = listUsersResult.users
        .map((authUser) => {
          const profileData = docs.get(authUser.uid);
          if (!profileData || profileData.role === 'customer') {
            return null;
          }

          return {
            uid: authUser.uid,
            email: authUser.email || profileData.email,
            role: profileData.role,
            favorites: profileData.favorites || [],
            createdAt: profileData.createdAt || null,
            disabled: authUser.disabled,
            lastSignInTime: authUser.metadata.lastSignInTime || null,
            creationTime: authUser.metadata.creationTime || null,
          };
        })
        .filter(Boolean)
        .sort((a, b) => String(a.email).localeCompare(String(b.email)));

      return json(200, { users, requesterRole: actorRole });
    }

    const body = parseBody(event);

    if (event.httpMethod === 'POST') {
      const { email, password, role } = body;
      if (!email || !password || !role) {
        return json(400, { error: 'Email, password, and role are required.' });
      }

      if (!canAssignRole(actorRole, role)) {
        return json(403, { error: 'This role cannot be assigned from your current access level.' });
      }

      const created = await auth.createUser({
        email,
        password,
        emailVerified: true,
      });

      await db.collection('users').doc(created.uid).set({
        uid: created.uid,
        email,
        role,
        favorites: [],
        createdAt: FieldValue.serverTimestamp(),
      });

      return json(200, {
        user: {
          uid: created.uid,
          email,
          role,
          favorites: [],
          disabled: false,
          lastSignInTime: null,
          creationTime: created.metadata.creationTime || null,
        },
        credentials: { email, password },
      });
    }

    if (event.httpMethod === 'PATCH') {
      const { uid, action, role, newPassword } = body;
      if (!uid || !action) {
        return json(400, { error: 'A target user and action are required.' });
      }

      if (uid === decoded.uid) {
        return json(400, { error: 'Use your own account settings for self-service changes.' });
      }

      const targetProfileSnap = await db.collection('users').doc(uid).get();
      if (!targetProfileSnap.exists) {
        return json(404, { error: 'The target user profile could not be found.' });
      }

      const targetProfile = targetProfileSnap.data();
      const targetRole = targetProfile.role;

      if (!canManageTarget(actorRole, targetRole)) {
        return json(403, { error: 'This account cannot be managed from your current access level.' });
      }

      if (action === 'role') {
        if (!role || !canAssignRole(actorRole, role)) {
          return json(403, { error: 'This role change is not allowed.' });
        }
        await db.collection('users').doc(uid).update({ role });
        return json(200, { message: `Role updated to ${role.replace('_', ' ')}.` });
      }

      if (action === 'disable' || action === 'enable') {
        await auth.updateUser(uid, { disabled: action === 'disable' });
        return json(200, { message: action === 'disable' ? 'Account disabled.' : 'Account re-enabled.' });
      }

      if (action === 'reset_password') {
        if (!newPassword || String(newPassword).length < 8) {
          return json(400, { error: 'Use a temporary password with at least 8 characters.' });
        }
        await auth.updateUser(uid, { password: newPassword });
        await auth.revokeRefreshTokens(uid);
        return json(200, { message: 'Temporary password rotated successfully.', resetPassword: { newPassword } });
      }

      return json(400, { error: 'Unknown action requested.' });
    }

    return json(405, { error: 'Method not allowed.' });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : 'Unexpected admin function failure.',
    });
  }
};
