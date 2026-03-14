import { DashboardRepository } from './repository';

export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  async getKPIs() { return this.repository.getKPIs(); }
  async getRecentActivity(limit?: number) { return this.repository.getRecentActivity(limit); }
}
