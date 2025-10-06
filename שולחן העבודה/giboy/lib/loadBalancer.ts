// מערכת Load Balancing
interface ServerInstance {
  id: string;
  url: string;
  isHealthy: boolean;
  load: number; // 0-100
  lastCheck: number;
}

class LoadBalancer {
  private servers: ServerInstance[] = [];
  private currentIndex = 0;

  // הוספת שרת
  addServer(id: string, url: string): void {
    this.servers.push({
      id,
      url,
      isHealthy: true,
      load: 0,
      lastCheck: Date.now()
    });
  }

  // קבלת שרת הבא (Round Robin)
  getNextServer(): ServerInstance | null {
    const healthyServers = this.servers.filter(s => s.isHealthy);
    
    if (healthyServers.length === 0) {
      return null;
    }

    // Round Robin
    const server = healthyServers[this.currentIndex % healthyServers.length];
    this.currentIndex++;
    
    return server;
  }

  // קבלת שרת עם העומס הנמוך ביותר
  getLeastLoadedServer(): ServerInstance | null {
    const healthyServers = this.servers.filter(s => s.isHealthy);
    
    if (healthyServers.length === 0) {
      return null;
    }

    return healthyServers.reduce((prev, current) => 
      prev.load < current.load ? prev : current
    );
  }

  // עדכון עומס שרת
  updateServerLoad(serverId: string, load: number): void {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      server.load = Math.max(0, Math.min(100, load));
      server.lastCheck = Date.now();
    }
  }

  // סימון שרת כלא בריא
  markServerUnhealthy(serverId: string): void {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      server.isHealthy = false;
    }
  }

  // סימון שרת כבריא
  markServerHealthy(serverId: string): void {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      server.isHealthy = true;
      server.load = 0;
    }
  }

  // קבלת סטטיסטיקות
  getStats() {
    const healthy = this.servers.filter(s => s.isHealthy).length;
    const total = this.servers.length;
    const avgLoad = this.servers.reduce((sum, s) => sum + s.load, 0) / total;

    return {
      totalServers: total,
      healthyServers: healthy,
      averageLoad: avgLoad,
      servers: this.servers.map(s => ({
        id: s.id,
        url: s.url,
        isHealthy: s.isHealthy,
        load: s.load
      }))
    };
  }
}

// יצירת instance יחיד
export const loadBalancer = new LoadBalancer();

// הוספת שרתים (בפרודקשן תהיה רשימה אמיתית)
loadBalancer.addServer('main', 'http://localhost:3000');
loadBalancer.addServer('backup', 'http://localhost:3001');

// פונקציה לקבלת URL של שרת
export function getServerUrl(): string {
  const server = loadBalancer.getLeastLoadedServer();
  return server ? server.url : 'http://localhost:3000';
}


