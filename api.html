<script>
// ============================================================
// api.html — All backend calls in one place.
// Change API_URL here and nowhere else.
// All protected calls require explicit name+code params.
// Session stores { role, userId, name } — code is NEVER persisted.
// ============================================================

var API_URL = 'https://script.google.com/macros/s/AKfycbzREK-f4OAp7El-Y31ReM5w8yoFMsPFTra3kL5ooHf_UYC6CQWvIZ351Clr0UuF9hVdkg/exec';

var api = {

  // ── INTERNAL: Auth helper (session only contains name, NOT code)
  _auth: function() {
    var s = auth.getSession();
    return s ? { name: s.name, role: s.role, userId: s.userId } : {};
  },

  // ── INTERNAL: GET request with cache-busting
  _get: function(params, cb) {
    params.t = Date.now(); // cache-bust
    var qs = Object.keys(params).map(function(k){ return k+'='+encodeURIComponent(params[k]); }).join('&');
    fetch(API_URL + '?' + qs)
      .then(function(r){ return r.json(); })
      .then(cb)
      .catch(function(e){ 
        console.error('API GET error', e); 
        if (cb) cb({ success:false, error:e.message }); 
      });
  },

  // ── INTERNAL: POST request with automatic auth injection (name only)
  _post: function(payload, cb) {
    var authData = this._auth();
    // Only inject name from session — code must be passed explicitly for protected actions
    if (authData.name) payload.name = authData.name;
    if (authData.userId) payload.userId = authData.userId;
    
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function(r){ return r.json(); })
      .then(cb)
      .catch(function(e){ 
        console.error('API POST error', e); 
        if (cb) cb({ success:false, error:e.message }); 
      });
  },

  // ── PUBLIC ENDPOINTS (no auth required) ──

  health: function(cb) {
    this._get({ action:'health' }, cb);
  },

  getUsers: function(cb) {
    this._get({ action:'getUsers' }, cb);
  },

  login: function(name, code, cb) {
    this._get({ action:'login', name:name, code:code }, cb);
  },

  // ── PROTECTED GET ENDPOINTS (explicit name+code required) ──
  // Code is NOT in session — caller must pass it from login form or stored credential

  getData: function(name, code, cb) {
    this._get({ action:'getData', name:name, code:code }, cb);
  },

  getSettings: function(name, code, cb) {
    this._get({ action:'getSettings', name:name, code:code }, cb);
  },

  // ── PROTECTED POST ENDPOINTS (role-gated + explicit code) ──

  sync: function(entity, payload, name, code, cb) {
    // Allow optional cb-only signature for backward compatibility
    if (typeof name === 'function') { cb = name; name = null; code = null; }
    if (!name || !code) {
      var a = this._auth();
      console.warn('sync called without explicit credentials — ensure backend validates');
      name = a.name;
      // code cannot be retrieved — backend must handle gracefully or reject
    }
    payload.action = 'sync';
    payload.entity = entity;
    payload.code = code; // explicit code required for auth
    this._post(payload, cb);
  },

  delete: function(entity, id, name, code, cb) {
    if (!auth.isRole('masterAdmin')) {
      console.warn('Delete requires masterAdmin role');
      if (cb) cb({ success:false, error:'Permission denied' });
      return;
    }
    payload = { action:'delete', entity:entity, id:id, code:code };
    if (name) payload.name = name;
    this._post(payload, cb);
  },

  override: function(entity, payload, name, code, cb) {
    if (!auth.isRole('masterAdmin')) {
      console.warn('Override requires masterAdmin role');
      if (cb) cb({ success:false, error:'Permission denied' });
      return;
    }
    payload.action = 'override';
    payload.entity = entity;
    payload.code = code;
    if (name) payload.name = name;
    this._post(payload, cb);
  },

  // ── ACTIVITY LOGGING (fire-and-forget, no cb required) ──

  logActivity: function(logAction, type, itemId, client, summary, name, code) {
    // Allow minimal signature for internal use
    if (typeof name !== 'string') {
      var a = this._auth();
      name = a.name;
      code = null; // logActivity may not require code — backend decides
    }
    this._post({ 
      action:'logActivity', 
      logAction:logAction, 
      type:type, 
      itemId:itemId, 
      client:client, 
      summary:summary,
      name:name,
      code:code
    }, function(resp) {
      if (resp && !resp.success) {
        console.warn('Activity log failed:', resp.error);
      }
    });
  },

  // ── SETTINGS & USER MANAGEMENT (Master Admin only) ──

  updateSettings: function(key, value, name, code, cb) {
    if (!auth.isRole('masterAdmin')) {
      console.warn('updateSettings requires masterAdmin role');
      if (cb) cb({ success:false, error:'Permission denied' });
      return;
    }
    this._post({ 
      action:'updateSettings', 
      key:key, 
      value:value, 
      name:name, 
      code:code 
    }, cb);
  },

  updateUser: function(userAction, payload, name, code, cb) {
    if (!auth.isRole('masterAdmin')) {
      console.warn('updateUser requires masterAdmin role');
      if (cb) cb({ success:false, error:'Permission denied' });
      return;
    }
    payload.action = 'updateUser';
    payload.userAction = userAction;
    payload.name = name;
    payload.code = code;
    this._post(payload, cb);
  },

  // ── CONVENIENCE: Session-aware wrappers for common flows ──
  // Use these when code is already validated and stored securely (e.g., post-login)

  getDataWithSession: function(cb) {
    var s = auth.getSession();
    if (!s || !s.name) {
      if (cb) cb({ success:false, error:'Not authenticated' });
      return;
    }
    // Caller must have stored code securely elsewhere if needed
    // For initial load post-login, code is available in memory
    console.warn('getDataWithSession requires code — prefer explicit getData(name, code, cb)');
    this._get({ action:'getData', name:s.name }, cb);
  },

  // ── UTILITY: Refresh all data via state module ──
  refreshAll: function(cb) {
    var s = auth.getSession();
    if (!s || !s.name) {
      if (cb) cb({ success:false, error:'Not authenticated' });
      return;
    }
    // Delegate to state module if available
    if (typeof state !== 'undefined' && typeof state.refresh === 'function') {
      state.refresh(cb);
    } else {
      this.getData(s.name, null, cb); // code must be supplied by caller if backend requires
    }
  }
};
</script>
