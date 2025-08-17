
export class ClientSimulator {
  private isRunning: boolean = false;
  private clients: Array<{ id: string; status: string; lastSeen: Date }> = [];
  private simulationInterval?: NodeJS.Timeout;

  constructor() {
    console.log('Client Simulator initialized');
    this.initializeClients();
  }

  private initializeClients() {
    // Initialize some mock clients
    for (let i = 1; i <= 10; i++) {
      this.clients.push({
        id: `client-${i}`,
        status: Math.random() > 0.3 ? 'online' : 'offline',
        lastSeen: new Date()
      });
    }
  }

  async startSimulation() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('Starting client simulation...');

    // Simulate client status changes every 10 seconds
    this.simulationInterval = setInterval(() => {
      this.simulateClientActivity();
    }, 10000);

    console.log('Client simulation started');
  }

  private simulateClientActivity() {
    if (!this.isRunning) return;

    // Randomly update client statuses
    this.clients.forEach(client => {
      const rand = Math.random();
      if (rand < 0.1) { // 10% chance to change status
        client.status = client.status === 'online' ? 'offline' : 'online';
        client.lastSeen = new Date();
      } else if (rand < 0.15 && client.status === 'online') { // 5% chance to participate in FL
        client.status = 'participating';
        client.lastSeen = new Date();
      }
    });

    console.log(`Client simulation update: ${this.getOnlineCount()} clients online, ${this.getParticipatingCount()} participating`);
  }

  stopSimulation() {
    this.isRunning = false;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = undefined;
    }
    console.log('Client simulation stopped');
  }

  getClients() {
    return this.clients;
  }

  getOnlineCount() {
    return this.clients.filter(c => c.status === 'online' || c.status === 'participating').length;
  }

  getParticipatingCount() {
    return this.clients.filter(c => c.status === 'participating').length;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      totalClients: this.clients.length,
      onlineClients: this.getOnlineCount(),
      participatingClients: this.getParticipatingCount()
    };
  }
}
