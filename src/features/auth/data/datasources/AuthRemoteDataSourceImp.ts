import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSource } from "./AuthRemoteDataSource";

export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;

  private prefs: ILocalPreferences;

  constructor(projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
    this.projectId = projectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/auth/${this.projectId}`;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 201) {
        const data = await response.json();
        const token = data["accessToken"];
        const refreshToken = data["refreshToken"];
        
        console.log("═══════════════════════════════════════════");
        console.log("🔐 Full login response from Roble:");
        console.log(JSON.stringify(data, null, 2));
        console.log("═══════════════════════════════════════════");
        
        // Guardar tokens
        await this.prefs.storeData("token", token);
        await this.prefs.storeData("refreshToken", refreshToken);
        console.log("✅ Tokens saved successfully");
        
        // Guardar información del usuario
        let userInfo: any = {};
        
        // Si viene un objeto "user"
        if (data["user"]) {
          userInfo = data["user"];
          console.log("✅ User data from 'user' field:", userInfo);
        } else {
          // Intentar extraer de campos directos
          if (data["email"]) userInfo.email = data["email"];
          if (data["_id"]) userInfo._id = data["_id"];
          if (data["id"]) userInfo._id = data["id"];
          if (data["name"]) userInfo.name = data["name"];
          if (data["userId"]) userInfo._id = data["userId"];
          
          console.log("📝 Extracted user info:", userInfo);
        }
        
        // Si después del login no tenemos user data, usar el email de login
        if (!userInfo.email) {
          // Extraer email del cuerpo de la request (pasado como parámetro)
          userInfo.email = email;
        }
        
        if (Object.keys(userInfo).length > 0) {
          await this.prefs.storeData("userData", JSON.stringify(userInfo));
          console.log("✅ User data saved:", userInfo);
        } else {
          console.warn("⚠️ Could not extract user data from response");
        }
        
        return Promise.resolve();
      } else {
        const body = await response.json();
        throw new Error(`Login error: ${body.message}`);
      }
    } catch (e: any) {
      console.error("Login failed", e);
      throw e;
    }
  }

  async signUp(email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          email: email,
          name: email.split("@")[0],
          password: password,
        }),
      });

      if (response.status === 201) {
        return Promise.resolve();
      } else {
        const body = await response.json();
        throw new Error(`Signup error: ${(body.message || []).join(" ")}`);
      }
    } catch (e: any) {
      console.error("Signup failed", e);
      throw e;
    }
  }

  async logOut(): Promise<void> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      
      if (token) {
        try {
          const response = await fetch(`${this.baseUrl}/logout`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 201) {
            console.log("✅ Logout successful from server");
          } else {
            console.warn("⚠️ Server logout failed, but clearing local data");
          }
        } catch (e) {
          console.warn("⚠️ Could not reach server for logout, but clearing local data");
        }
      }
      
      // Always clear local data regardless of server response
      await this.prefs.removeData("token");
      await this.prefs.removeData("refreshToken");
      await this.prefs.removeData("userData");
      console.log("✅ Local data cleared");
      return Promise.resolve();
    } catch (e: any) {
      console.error("Logout failed", e);
      // Even if there's an error, try to clear local data
      try {
        await this.prefs.removeData("token");
        await this.prefs.removeData("refreshToken");
        await this.prefs.removeData("userData");
      } catch (clearError) {
        console.error("Failed to clear data:", clearError);
      }
      throw e;
    }
  }
  async validate(email: string, validationCode: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email, code: validationCode }),
      });

      if (response.status === 201) {
        return true;
      } else {
        const body = await response.json();
        throw new Error(`Validation error: ${body.message}`);
      }
    } catch (e: any) {
      console.error("Validation failed", e);
      throw e;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await this.prefs.retrieveData<string>(
        "refreshToken"
      );
      if (!refreshToken) throw new Error("No refresh token found");

      const response = await fetch(`${this.baseUrl}/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.status === 201) {
        const data = await response.json();
        const newToken = data["accessToken"];
        await this.prefs.storeData("token", newToken);
        console.log("Token refreshed successfully");
        return true;
      } else {
        const body = await response.json();
        throw new Error(`Refresh token error: ${body.message}`);
      }
    } catch (e: any) {
      console.error("Refresh token failed", e);
      throw e;
    }
  }
  forgotPassword(email: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  resetPassword(
    email: string,
    newPassword: string,
    validationCode: string
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  async verifyToken(): Promise<boolean> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      if (!token) return false;

      const response = await fetch(`${this.baseUrl}/verify-token`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        console.log("Token is valid");
        return true;
      } else {
        const body = await response.json();
        console.error(`Token verification error: ${body.message}`);
        return false;
      }
    } catch (e: any) {
      console.error("Verify token failed", e);
      return false;
    }
  }
}
