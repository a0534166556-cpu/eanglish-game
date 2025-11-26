// מערכת Monitoring ו-Health Check
interface HealthMetrics {
  timestamp: number;
  cpu: number;
  memory: number;
  activeConnections: number;
  responseTime: number;
  errorRate: number;
}

class MonitoringSystem {
  private metrics: HealthMetrics[] = [];
  private maxMetrics = 1000; // מקסימום מדדים
  private alertThresholds = {
    cpu: 80, // 80%
    memory: 85, // 85%
    responseTime: 5000, // 5 שניות
    errorRate: 10 // 10%
  };

  // הוספת מדד
  addMetric(metric: HealthMetrics): void {
    this.metrics.push(metric);
    
    // שמירה על מקסימום מדדים
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // בדיקת התראות
    this.checkAlerts(metric);
  }

  // בדיקת התראות
  private checkAlerts(metric: HealthMetrics): void {
    const alerts: string[] = [];

    if (metric.cpu > this.alertThresholds.cpu) {
      alerts.push(`CPU גבוה: ${metric.cpu}%`);
    }

    if (metric.memory > this.alertThresholds.memory) {
      alerts.push(`זיכרון גבוה: ${metric.memory}%`);
    }

    if (metric.responseTime > this.alertThresholds.responseTime) {
      alerts.push(`זמן תגובה איטי: ${metric.responseTime}ms`);
    }

    if (metric.errorRate > this.alertThresholds.errorRate) {
      alerts.push(`שיעור שגיאות גבוה: ${metric.errorRate}%`);
    }

    if (alerts.length > 0) {
      console.warn('🚨 התראות מערכת:', alerts.join(', '));
      // כאן תוכל לשלוח התראות למייל/Slack/וכו'
    }
  }

  // קבלת מדדים אחרונים
  getRecentMetrics(count: number = 10): HealthMetrics[] {
    return this.metrics.slice(-count);
  }

  // קבלת ממוצעים
  getAverages(): Partial<HealthMetrics> {
    if (this.metrics.length === 0) {
      return {};
    }

    const sum = this.metrics.reduce((acc, metric) => ({
      cpu: acc.cpu + metric.cpu,
      memory: acc.memory + metric.memory,
      activeConnections: acc.activeConnections + metric.activeConnections,
      responseTime: acc.responseTime + metric.responseTime,
      errorRate: acc.errorRate + metric.errorRate
    }), { cpu: 0, memory: 0, activeConnections: 0, responseTime: 0, errorRate: 0 });

    const count = this.metrics.length;
    return {
      cpu: sum.cpu / count,
      memory: sum.memory / count,
      activeConnections: sum.activeConnections / count,
      responseTime: sum.responseTime / count,
      errorRate: sum.errorRate / count
    };
  }

  // בדיקת בריאות המערכת
  isHealthy(): boolean {
    const recent = this.getRecentMetrics(5);
    if (recent.length === 0) return true;

    const avg = this.getAverages();
    return !(
      (avg.cpu && avg.cpu > this.alertThresholds.cpu) ||
      (avg.memory && avg.memory > this.alertThresholds.memory) ||
      (avg.responseTime && avg.responseTime > this.alertThresholds.responseTime) ||
      (avg.errorRate && avg.errorRate > this.alertThresholds.errorRate)
    );
  }

  // קבלת סטטיסטיקות
  getStats() {
    const recent = this.getRecentMetrics(10);
    const averages = this.getAverages();
    
    return {
      isHealthy: this.isHealthy(),
      totalMetrics: this.metrics.length,
      recentMetrics: recent,
      averages,
      thresholds: this.alertThresholds
    };
  }
}

// יצירת instance יחיד
export const monitoring = new MonitoringSystem();

// פונקציה לאיסוף מדדי מערכת
export function collectSystemMetrics(): HealthMetrics {
  const startTime = Date.now();
  
  // מדדי מערכת (בפרודקשן תהיה קריאה אמיתית)
  const cpu = Math.random() * 100; // סימולציה
  const memory = Math.random() * 100; // סימולציה
  const activeConnections = Math.floor(Math.random() * 1000); // סימולציה
  const responseTime = Date.now() - startTime;
  const errorRate = Math.random() * 20; // סימולציה

  const metric: HealthMetrics = {
    timestamp: Date.now(),
    cpu,
    memory,
    activeConnections,
    responseTime,
    errorRate
  };

  monitoring.addMetric(metric);
  return metric;
}

// איסוף מדדים כל 30 שניות
setInterval(() => {
  collectSystemMetrics();
}, 30 * 1000);


