import { Injectable } from '@nestjs/common';
import Consul from 'consul';
import * as os from 'node:os';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class ConsulService {
  private readonly consul: any;

  constructor() {
    this.consul = new Consul({
      host: process.env.CONSUL_HOST || 'localhost',
      port: process.env.CONSUL_PORT || '8500',
      promisify: true,
    } as any);
  }

  async registerService(
    serviceId: string,
    name: string,
    address: string,
    port: number,
  ) {
    try {
      await this.consul.agent.service.register({
        id: serviceId,
        name,
        address,
        port,
        check: {
          grpc: `${address}:${port}`,
          grpc_use_tls: false,
          interval: '10s',
        },
      });
    } catch (err) {
      console.error('[Consul] Register failed:', err);
    }
  }

  async deregisterService(serviceId: string) {
    await this.consul.agent.service.deregister(serviceId);
  }

  async discoverService(
    name: string,
    retries = 10,
    delay = 3000,
  ): Promise<{ address: string; port: number }> {
    for (let i = 0; i < retries; i++) {
      const services = await this.consul.catalog.service.nodes(name);
      if (services && services.length > 0) {
        const svc = services[0];
        return {
          address: svc.ServiceAddress || svc.Address,
          port: svc.ServicePort,
        };
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    throw new Error(
      `[Consul] No service found with name ${name} after ${retries} retries`,
    );
  }

  getLocalIp(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  }
}
