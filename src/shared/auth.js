/**
 * WEDDING PLATFORM — AUTHENTICATION MODULE
 * Role-based auth simulation for all portals
 * Roles: couple | vendor | super_admin
 */

const Auth = (() => {

  const SESSION_KEY = 'wp_session';

  function getCurrentUser() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  }

  function isLoggedIn() { return !!getCurrentUser(); }

  function login(email, password) {
    const user = Store.Users.authenticate(email, password);
    if (!user) return { success: false, error: 'Invalid email or password.' };
    const session = { id: user.id, email: user.email, role: user.role, name: user.name, weddingId: user.weddingId, vendorId: user.vendorId, plan: user.plan, trialEnds: user.trialEnds };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = '/';
  }

  function requireRole(role, redirectTo = '/') {
    const user = getCurrentUser();
    if (!user) { window.location.href = redirectTo; return false; }
    if (Array.isArray(role)) {
      if (!role.includes(user.role)) { window.location.href = redirectTo; return false; }
    } else {
      if (user.role !== role) { window.location.href = redirectTo; return false; }
    }
    return true;
  }

  function hasRole(role) {
    const user = getCurrentUser();
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  }

  function isTrialExpired() {
    const user = getCurrentUser();
    if (!user || user.role !== 'couple') return false;
    if (user.plan !== 'trial') return false;
    return new Date(user.trialEnds) < new Date();
  }

  function getTrialDaysLeft() {
    const user = getCurrentUser();
    if (!user || !user.trialEnds) return 0;
    const diff = new Date(user.trialEnds) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return { getCurrentUser, isLoggedIn, login, logout, requireRole, hasRole, isTrialExpired, getTrialDaysLeft };

})();

window.Auth = Auth;
