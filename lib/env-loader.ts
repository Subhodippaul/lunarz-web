// Server-only environment variable loader for debugging
// This file should only be imported in server-side code (API routes, server components)
import { readFileSync } from 'fs';
import { join } from 'path';

export class EnvLoader {
  private static envVars: Record<string, string> = {};
  private static loaded = false;

  static loadEnvFile() {
    // Only run on server-side
    if (typeof window !== 'undefined') {
      console.warn('EnvLoader should not be used on client-side');
      return {};
    }

    if (this.loaded) return this.envVars;

    try {
      // Try to read .env.local manually
      const envPath = join(process.cwd(), '.env.local');
      const envContent = readFileSync(envPath, 'utf8');
      
      console.log('=== MANUAL ENV FILE CONTENT ===');
      console.log(envContent);
      console.log('===============================');

      // Parse the file
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            let value = valueParts.join('=');
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            this.envVars[key.trim()] = value;
          }
        }
      }

      this.loaded = true;
      console.log('=== PARSED ENV VARS ===');
      console.log(JSON.stringify(this.envVars, null, 2));
      console.log('=======================');

    } catch (error) {
      console.error('Failed to load .env.local manually:', error);
    }

    return this.envVars;
  }

  static getShiprocketConfig() {
    // Only run on server-side
    if (typeof window !== 'undefined') {
      console.warn('EnvLoader should not be used on client-side');
      return {
        token: '',
        email: '',
        password: '',
        fromProcessEnv: { token: '', email: '', password: '' },
        fromManualLoad: { token: '', email: '', password: '' }
      };
    }

    const envVars = this.loadEnvFile();
    
    return {
      token: envVars.SHIPROCKET_TOKEN || process.env.SHIPROCKET_TOKEN || '',
      email: envVars.SHIPROCKET_EMAIL || process.env.SHIPROCKET_EMAIL || '',
      password: envVars.SHIPROCKET_PASSWORD || process.env.SHIPROCKET_PASSWORD || '',
      fromProcessEnv: {
        token: process.env.SHIPROCKET_TOKEN,
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      },
      fromManualLoad: {
        token: envVars.SHIPROCKET_TOKEN,
        email: envVars.SHIPROCKET_EMAIL,
        password: envVars.SHIPROCKET_PASSWORD
      }
    };
  }
}