/**
 * Professional E2E Test Logging Utility
 * Provides structured, consistent logging for E2E tests without emojis
 */

export class TestLogger {
  private testName: string;
  private stepCounter: number = 0;

  constructor(testName: string) {
    this.testName = testName;
  }

  /**
   * Log test start
   */
  start() {
    console.log('\n' + '='.repeat(80));
    console.log(`TEST: ${this.testName}`);
    console.log('='.repeat(80));
  }

  /**
   * Log test completion
   */
  pass(message?: string) {
    console.log('-'.repeat(80));
    console.log(`RESULT: PASSED${message ? ' - ' + message : ''}`);
    console.log('='.repeat(80) + '\n');
  }

  /**
   * Log test step
   */
  step(description: string) {
    this.stepCounter++;
    console.log(`\n[Step ${this.stepCounter}] ${description}`);
  }

  /**
   * Log information
   */
  info(message: string, data?: any) {
    if (data !== undefined) {
      console.log(`  INFO: ${message}`, data);
    } else {
      console.log(`  INFO: ${message}`);
    }
  }

  /**
   * Log success
   */
  success(message: string) {
    console.log(`  SUCCESS: ${message}`);
  }

  /**
   * Log warning
   */
  warn(message: string) {
    console.log(`  WARNING: ${message}`);
  }

  /**
   * Log error
   */
  error(message: string, error?: any) {
    if (error) {
      console.log(`  ERROR: ${message}`, error);
    } else {
      console.log(`  ERROR: ${message}`);
    }
  }

  /**
   * Log URL navigation
   */
  url(label: string, url: string) {
    console.log(`  URL [${label}]: ${url}`);
  }

  /**
   * Log user action
   */
  action(description: string) {
    console.log(`  ACTION: ${description}`);
  }

  /**
   * Log verification
   */
  verify(description: string, result: boolean) {
    const status = result ? 'PASS' : 'FAIL';
    console.log(`  VERIFY: ${description} - ${status}`);
  }

  /**
   * Log API request/response
   */
  api(method: string, endpoint: string, status?: number) {
    if (status) {
      console.log(`  API: ${method} ${endpoint} - Status: ${status}`);
    } else {
      console.log(`  API: ${method} ${endpoint}`);
    }
  }

  /**
   * Log token information
   */
  tokens(tokens: { accessToken?: boolean; refreshToken?: boolean; tokenType?: string }) {
    console.log(`  TOKENS:`);
    console.log(`    - Access Token: ${tokens.accessToken ? 'Present' : 'Missing'}`);
    console.log(`    - Refresh Token: ${tokens.refreshToken ? 'Present' : 'Missing'}`);
    if (tokens.tokenType) {
      console.log(`    - Token Type: ${tokens.tokenType}`);
    }
  }

  /**
   * Log form elements visibility
   */
  formElements(elements: { [key: string]: boolean }) {
    console.log(`  FORM ELEMENTS:`);
    Object.entries(elements).forEach(([name, visible]) => {
      console.log(`    - ${name}: ${visible ? 'Visible' : 'Hidden'}`);
    });
  }

  /**
   * Log user information
   */
  user(user: { email: string; roles?: string[]; mfaEnabled?: boolean }) {
    console.log(`  USER:`);
    console.log(`    - Email: ${user.email}`);
    if (user.roles) {
      console.log(`    - Roles: ${user.roles.join(', ')}`);
    }
    if (user.mfaEnabled !== undefined) {
      console.log(`    - MFA: ${user.mfaEnabled ? 'Enabled' : 'Disabled'}`);
    }
  }

  /**
   * Log test skip
   */
  skip(reason: string) {
    console.log('\n' + '='.repeat(80));
    console.log(`TEST SKIPPED: ${this.testName}`);
    console.log(`REASON: ${reason}`);
    console.log('='.repeat(80) + '\n');
  }

  /**
   * Log table of data
   */
  table(data: { [key: string]: any }) {
    console.log('  DATA:');
    Object.entries(data).forEach(([key, value]) => {
      console.log(`    - ${key}: ${value}`);
    });
  }
}

/**
 * Create a new logger for a test
 */
export function createLogger(testName: string): TestLogger {
  return new TestLogger(testName);
}
