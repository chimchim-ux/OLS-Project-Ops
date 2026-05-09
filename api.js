// ============================================================
// js/api.js — All backend calls in one place.
// Change API_URL here and nowhere else.
// CRITICAL: Access code is NEVER stored in session.
// Protected calls require explicit name + code params.
// Backend returns UPPERCASE field names (ID, Client, Status, etc.)
// ============================================================

var API_URL = 'https://script.google.com/macros/s/AKfycbzREK-f4OAp7El-Y31ReM5w8yoFMsPFTra3kL5ooHf_UYC6CQWvIZ351Clr0UuF9hVdkg/exec';

var api = {

  // ── INTERNAL: Auth helper (session contains name/role/userId ONLY)
  _auth: function() {
    var s = auth.getSession();
    return s ? { name: s.name, role: s.role, userId: s.userId } : {};
  },

  // ── INTERNAL: GET request with cache-busting
  _get: function(params, cb) {
    params.t = Date.now(); // cache-bust
    var qs = Object.keys(params).map(function(k){ 
      return k + '=' + encodeURIComponent(params[k]); 
    }).join('&');
    
    fetch(API_URL + '?' + qs)
      .then(function(r){ return r.json(); })
      .then(cb)
      .catch(function(e){ 
        console.error('API GET error', e); 
        if (cb) cb({ success:false, error:e.message }); 
      });
  },

  // ── INTERNAL: POST request (NO auto code injection)
  _post: function(payload, cb) {
    var authData = this._auth();
    // Inject name/userId from session if available (code must be passed explicitly)
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
  // Code is NOT in session — caller must pass it from login flow

  getData: function(name, code, cb) {
    this._get({ action:'getData', name:name, code:code }, cb);
  },

  getSettings: function(name, code, cb) {
    this._get({ action:'getSettings', name:name, code:code }, cb);
  },

  // ── PROTECTED POST ENDPOINTS (role-gated + explicit code) ──

  sync: function(entity, payload, name, code, cb) {
    // Allow backward-compatible signature: sync(entity, payload, cb)
    if (typeof name === 'function') { cb = name; name = null; code = null; }
    else if (typeof code === 'function') { cb = code; code = null; }
    
    payload.action = 'sync';
    payload.entity = entity;
    if (name) payload.name = name;
    if (code) payload.code = code; // explicit code required for auth
    
    this._post(payload, cb);
  },

  delete: function(entity, id, name, code, cb) {
    // Role guard per Main Blueprint §2
    if (!auth.isRole('masterAdmin')) {
      console.warn('Delete requires masterAdmin role');
      if (cb) cb({ success:false, error:'Permission denied' });
      return;
    }
    // Allow backward-compatible signature
    if (typeof name === 'function') { cb = name; name = null; code = null; }
    else if (typeof code === 'function') { cb = code; code = null; }
    
    var payload = { action:'delete', entity:entity, id:id };
    if (name) payload.name = name;
    if (code) payload.code = code;
    
    this._post(payload, cb);
  },

  override: function(entity, payload, name, code, cb) {
    // Role guard per Main Blueprint §2
    if (!auth.isRole('masterAdmin')) {
      console.warn('Override requires masterAdmin role');
      if (cb) cb({ success:false, error:'Permission denied' });
      return;
    }
    // Allow backward-compatible signature
    if (typeof name === 'function') { cb = name; name = null; code = null; }
    else if (typeof code === 'function') { cb = code; code = null; }
    
    payload.action = 'override';
    payload.entity = entity;
    if (name) payload.name = name;
    if (code) payload.code = code;
    
    this._post(payload, cb);
  },

  // ── ACTIVITY LOGGING (fire-and-forget) ──

  logActivity: function(logAction, type, itemId, client, summary, name, code) {
    // Allow minimal signature for internal use
    if (typeof name !== 'string') {
      var a = this._auth();
      name = a.name;
      // code not required for logging — backend decides
    }
    
    this._post({ 
      action: 'logActivity', 
      logAction: logAction,   // ✅ distinct key to avoid shadowing
      type: type, 
      itemId: itemId, 
      client: client, 
      summary: summary,
      name: name,
      code: code
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
    if (typeof name === 'function') { cb = name; name = null; code = null; }
    else if (typeof code === 'function') { cb = code; code = null; }
    
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
    if (typeof name === 'function') { cb = name; name = null; code = null; }
    else if (typeof code === 'function') { cb = code; code = null; }
    
    payload.action = 'updateUser';
    payload.userAction = userAction;
    if (name) payload.name = name;
    if (code) payload.code = code;
    
    this._post(payload, cb);
  },

  // ── CONVENIENCE: Session-aware wrappers (use with caution) ──
  // These assume caller manages code in memory (NOT session)

  getDataWithSession: function(code, cb) {
    var s = auth.getSession();
    if (!s || !s.name) {
      if (cb) cb({ success:false, error:'Not authenticated' });
      return;
    }
    // Caller must supply code explicitly — it is NOT in session
    this.getData(s.name, code, cb);
  },

  // ── UTILITY: Refresh all data via state module ──
  refreshAll: function(code, cb) {
    var s = auth.getSession();
    if (!s || !s.name) {
      if (cb) cb({ success:false, error:'Not authenticated' });
      return;
    }
    if (typeof state !== 'undefined' && typeof state.refresh === 'function') {
      state.refresh(s.name, code, cb);
    } else {
      this.getData(s.name, code, cb);
    }
  }
};
