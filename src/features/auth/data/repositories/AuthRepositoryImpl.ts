import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { AuthRemoteDataSource } from "../datasources/AuthRemoteDataSource";

export class AuthRepositoryImpl implements AuthRepository {
  private dataSource: AuthRemoteDataSource;
  private prefs: ILocalPreferences;

  constructor(dataSource: AuthRemoteDataSource) {
    this.dataSource = dataSource;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async login(email: string, password: string): Promise<AuthUser> {
    console.log("═══════════════════════════════════════════");
    console.log("🔐 DEBUG - Starting login for:", email);
    console.log("═══════════════════════════════════════════");
    
    await this.dataSource.login(email, password);
    
    // Retrieve the user data that was saved during login
    const userData = await this.prefs.retrieveData<string>("userData");
    const token = await this.prefs.retrieveData<string>("token");
    
    console.log("═══════════════════════════════════════════");
    console.log("🔍 DEBUG - After login:");
    console.log("📱 User data retrieved:", userData);
    console.log("🔑 Token retrieved:", !!token);
    console.log("═══════════════════════════════════════════");
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log("✅ Login successful, returning user:", parsedUser);
      return parsedUser;
    }
    
    // Fallback if no user data was saved
    console.log("⚠️ No user data found, returning basic user with email");
    return { email };
  }

  async signup(email: string, password: string): Promise<AuthUser> {
    console.log("═══════════════════════════════════════════");
    console.log("📝 DEBUG - Starting signup for:", email);
    console.log("═══════════════════════════════════════════");
    
    try {
      await this.dataSource.signUp(email, password);
      console.log("✅ Signup successful, attempting auto-login...");
      
      // Después del signup exitoso, intentar hacer login automáticamente
      // para obtener los tokens y datos del usuario
      try {
        await this.dataSource.login(email, password);
        const userData = await this.prefs.retrieveData<string>("userData");
        const token = await this.prefs.retrieveData<string>("token");
        
        console.log("═══════════════════════════════════════════");
        console.log("🔍 DEBUG - After auto-login:");
        console.log("📱 User data retrieved:", userData);
        console.log("🔑 Token retrieved:", !!token);
        console.log("═══════════════════════════════════════════");
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log("✅ Auto-login successful, returning user:", parsedUser);
          return parsedUser;
        }
      } catch (loginError) {
        console.warn("❌ Auto-login after signup failed:", loginError);
        // Si el auto-login falla, retornar usuario básico
      }
      
      // Fallback: retornar usuario básico con email
      console.log("⚠️ Auto-login failed, returning basic user with email");
      return { email };
    } catch (error) {
      console.error("❌ Signup failed:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    return this.dataSource.logOut();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    // Retrieve user data from storage
    const userData = await this.prefs.retrieveData<string>("userData");
    const token = await this.prefs.retrieveData<string>("token");
    const refreshToken = await this.prefs.retrieveData<string>("refreshToken");
    
    console.log("═══════════════════════════════════════════");
    console.log("🔍 DEBUG - getCurrentUser:");
    console.log("📱 User data:", userData);
    console.log("🔑 Token exists:", !!token);
    console.log("🔄 Refresh token exists:", !!refreshToken);
    console.log("═══════════════════════════════════════════");
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log("✅ Returning user:", parsedUser);
      return parsedUser;
    }
    
    console.log("❌ No user data found, returning null");
    return null;
  }
}
