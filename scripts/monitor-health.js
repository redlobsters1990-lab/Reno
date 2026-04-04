#!/usr/bin/env node
// Health Monitoring Script
// Run periodically to check system health

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class HealthMonitor {
  constructor() {
    this.checks = [];
    this.results = [];
    this.timestamp = new Date().toISOString();
  }

  addCheck(name, checkFn) {
    this.checks.push({ name, checkFn });
  }

  async runAll() {
    console.log(`🚀 Health Check - ${this.timestamp}\n`);
    
    for (const check of this.checks) {
      try {
        const result = await check.checkFn();
        this.results.push({
          name: check.name,
          status: 'healthy',
          message: result.message,
          data: result.data
        });
        console.log(`✅ ${check.name}: ${result.message}`);
      } catch (error) {
        this.results.push({
          name: check.name,
          status: 'unhealthy',
          message: error.message,
          error: error
        });
        console.log(`❌ ${check.name}: ${error.message}`);
      }
    }

    this.generateReport();
  }

  generateReport() {
    const report = {
      timestamp: this.timestamp,
      summary: {
        total: this.results.length,
        healthy: this.results.filter(r => r.status === 'healthy').length,
        unhealthy: this.results.filter(r => r.status === 'unhealthy').length
      },
      checks: this.results
    };

    // Save report to file
    const reportsDir = path.join(__dirname, '../health-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFile = path.join(reportsDir, `health-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Report saved to: ${reportFile}`);
    
    // Alert if unhealthy checks
    const unhealthy = report.summary.unhealthy;
    if (unhealthy > 0) {
      console.log(`\n🚨 ALERT: ${unhealthy} unhealthy check(s) detected!`);
      this.results
        .filter(r => r.status === 'unhealthy')
        .forEach(r => console.log(`   - ${r.name}: ${r.message}`));
    }
  }
}

// Create monitor instance
const monitor = new HealthMonitor();

// Add health checks
monitor.addCheck('Next.js Server', async () => {
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ -m 5', { encoding: 'utf8' }).trim();
    if (response === '200') {
      return { message: `HTTP ${response} - Server responding` };
    }
    throw new Error(`HTTP ${response} - Server not healthy`);
  } catch (error) {
    throw new Error(`Server check failed: ${error.message}`);
  }
});

monitor.addCheck('Database Connection', async () => {
  try {
    execSync('psql "postgresql://chozengone@localhost:5432/renovation_advisor" -c "SELECT 1 as test;" 2>/dev/null', { stdio: 'ignore' });
    return { message: 'Database connection successful' };
  } catch (error) {
    throw new Error('Database connection failed');
  }
});

monitor.addCheck('Prisma Studio', async () => {
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5555 -m 5 2>/dev/null || echo "DOWN"', { encoding: 'utf8' }).trim();
    if (response === '200') {
      return { message: `HTTP ${response} - Prisma Studio running` };
    }
    throw new Error(`HTTP ${response} - Prisma Studio not responding`);
  } catch (error) {
    throw new Error(`Prisma Studio check failed: ${error.message}`);
  }
});

monitor.addCheck('Disk Space', async () => {
  try {
    const output = execSync('df -h . | tail -1', { encoding: 'utf8' });
    const [, size, used, avail, percent] = output.trim().split(/\s+/);
    const percentNum = parseInt(percent);
    
    if (percentNum > 90) {
      throw new Error(`Disk space critical: ${percent} used`);
    } else if (percentNum > 80) {
      return { message: `Disk space warning: ${percent} used (${avail} available)`, data: { used, avail, percent } };
    }
    return { message: `Disk space OK: ${percent} used (${avail} available)`, data: { used, avail, percent } };
  } catch (error) {
    throw new Error(`Disk space check failed: ${error.message}`);
  }
});

monitor.addCheck('Memory Usage', async () => {
  try {
    const output = execSync('ps aux | grep -E "(next.*dev|prisma.*studio)" | grep -v grep', { encoding: 'utf8' });
    const processes = output.trim().split('\n').filter(line => line);
    
    const memoryInfo = processes.map(line => {
      const parts = line.split(/\s+/);
      return {
        process: parts[10] || parts[11] || 'unknown',
        memory: parts[3] + '%',
        rss: Math.round(parseInt(parts[5]) / 1024) + 'MB'
      };
    });
    
    return { 
      message: `${processes.length} processes running`, 
      data: { processes: memoryInfo }
    };
  } catch (error) {
    throw new Error(`Memory check failed: ${error.message}`);
  }
});

monitor.addCheck('Recent Errors', async () => {
  try {
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      return { message: 'No log directory found' };
    }
    
    // Check for recent error logs
    const files = fs.readdirSync(logDir).filter(f => f.includes('error') || f.includes('fail'));
    const recentErrors = files.slice(0, 5);
    
    if (recentErrors.length > 0) {
      return { 
        message: `${recentErrors.length} recent error log(s) found`, 
        data: { errorLogs: recentErrors }
      };
    }
    return { message: 'No recent error logs found' };
  } catch (error) {
    return { message: 'Error log check skipped' };
  }
});

// Run all checks
monitor.runAll().catch(console.error);