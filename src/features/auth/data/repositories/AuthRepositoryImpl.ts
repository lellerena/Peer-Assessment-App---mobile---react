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
    await this.dataSource.login(email, password);
    // Retrieve the user data that was saved during login
    const userData = await this.prefs.retrieveData<string>("userData");
    if (userData) {
      return JSON.parse(userData);
    }
    // Fallback if no user data was saved
    return { email };
  }

  async signup(email: string, password: string): Promise<AuthUser> {
    await this.dataSource.signUp(email, password);
    // For signup, we might not have user data yet, so return email
    return { email };
  }

  async logout(): Promise<void> {
    return this.dataSource.logOut();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    // Retrieve user data from storage
    const userData = await this.prefs.retrieveData<string>("userData");
    const token = await this.prefs.retrieveData<string>("token");
    
    console.log("getCurrentUser - User data:", userData);
    console.log("getCurrentUser - Token exists:", !!token);
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log("getCurrentUser - Returning user:", parsedUser);
      return parsedUser;
    }
    
    console.log("getCurrentUser - No user data found, returning null");
    return null;
  }
}
