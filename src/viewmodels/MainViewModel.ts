import { User } from "../models";
import { Observable } from "../Observable";

export class MainViewModel {
  public user = new Observable<User | null>(null);
  public error = new Observable<string | null>(null);

  async init() {
    const authRes = await window.api.checkAuth();
    if (authRes.success && authRes.isAuthenticated && authRes.user) {
      this.user.value = authRes.user;
    }
  }

  async login() {
    const res = await window.api.loginToGoogle();
    if (res.success && res.user) {
      this.user.value = res.user;
    } else {
      this.error.value = res.error || "Login failed";
    }
  }
}
export const appViewModel = new MainViewModel();
