class UserSessionManager {
  static _token = null;
  static _payload = null;

  static eventTarget = new EventTarget();


  static setToken(token) {
    this._token = token;
    localStorage.setItem("auth_token", token);

    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    this._payload = decodedPayload;
    this.eventTarget.dispatchEvent(new Event('sessionChanged'));

  }

  static getToken() {
    if (!this._token) {
      this._token = localStorage.getItem("auth_token");
      if (this._token) {
        const payloadBase64 = this._token.split('.')[1];
        this._payload = JSON.parse(atob(payloadBase64));
      }
    }
    return this._token;
  }

  static getPayload() {
    if (!this._payload) {
      this.getToken(); // Esto ya lo carga y lo decodifica
    }
    return this._payload;
  }

  static clearToken() {
    this._token = null;
    this._payload = null;
    localStorage.removeItem("auth_token");
    this.eventTarget.dispatchEvent(new Event('sessionChanged')); // Emitir evento

  }

  static isLoggedIn() {
    const payload = this.getPayload();
    if (!payload || !payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return now < payload.exp;
  }
}

export default UserSessionManager;
