import { EndpointAnalysis } from '../schemas';

interface TrafficStats {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    lastStatus: number | null;
    lastResponse: string | null;
    isRunning: boolean;
}

export class TrafficGenerator {
    private intervalId: NodeJS.Timeout | null = null;
    private stats: TrafficStats = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        lastStatus: null,
        lastResponse: null,
        isRunning: false
    };

    // Generate smart mock data based on parameter name and type
    private generateMockValue(param: { name: string; type: string }): any {
        const name = param.name.toLowerCase();
        const type = param.type.toLowerCase();

        // String handling
        if (type === 'string') {
            if (name.includes('email')) {
                return `user_${Math.floor(Math.random() * 10000)}@example.com`;
            }
            if (name.includes('name') || name.includes('user')) {
                const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'];
                return `${names[Math.floor(Math.random() * names.length)]}_${Math.floor(Math.random() * 1000)}`;
            }
            if (name.includes('phone')) {
                return `+1${Math.floor(Math.random() * 10000000000)}`;
            }
            if (name.includes('account')) {
                return `RO${Math.floor(Math.random() * 100000000000000)}`;
            }
            return `test_${name}_${Math.floor(Math.random() * 1000)}`;
        }

        // Number handling
        if (type === 'number' || type === 'integer' || type === 'float') {
            if (name.includes('amount') || name.includes('price') || name.includes('balance')) {
                return parseFloat((Math.random() * 1000).toFixed(2));
            }
            if (name.includes('age')) {
                return Math.floor(Math.random() * 60) + 18;
            }
            if (name.includes('id')) {
                return Math.floor(Math.random() * 1000);
            }
            return Math.floor(Math.random() * 100);
        }

        // Boolean handling
        if (type === 'boolean') {
            return Math.random() > 0.5;
        }

        return null;
    }

    private generatePayload(endpointAnalysis: EndpointAnalysis): any {
        const payload: Record<string, any> = {};

        // Filter for body parameters
        const bodyParams = endpointAnalysis.inputParameters.filter(p =>
            p.source === 'body'
        );

        for (const param of bodyParams) {
            payload[param.name] = this.generateMockValue(param);
        }

        return payload;
    }

    start(url: string, endpointAnalysis: EndpointAnalysis) {
        if (this.stats.isRunning) return;

        console.log(`🚀 Starting traffic simulation to ${url}`);
        this.stats.isRunning = true;
        this.stats.totalRequests = 0;
        this.stats.successfulRequests = 0;
        this.stats.failedRequests = 0;

        this.intervalId = setInterval(async () => {
            try {
                const payload = this.generatePayload(endpointAnalysis);

                console.log(`📤 Sending request to ${url}`, payload);

                const response = await fetch(url, {
                    method: endpointAnalysis.method || 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                this.stats.totalRequests++;
                this.stats.lastStatus = response.status;

                if (response.ok) {
                    this.stats.successfulRequests++;
                    const data = await response.json().catch(() => ({}));
                    this.stats.lastResponse = JSON.stringify(data);
                    console.log(`✅ Request success: ${response.status}`);
                } else {
                    this.stats.failedRequests++;
                    const text = await response.text();
                    this.stats.lastResponse = text;
                    console.error(`❌ Request failed: ${response.status}`, text);
                }

            } catch (error) {
                this.stats.totalRequests++;
                this.stats.failedRequests++;
                this.stats.lastResponse = error instanceof Error ? error.message : 'Network Error';
                console.error('❌ Network error during simulation:', error);
            }
        }, 1000); // 1 request per second
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.stats.isRunning = false;
        console.log('🛑 Traffic simulation stopped');
    }

    getStats(): TrafficStats {
        return { ...this.stats };
    }
}

// Singleton instance for the server
export const trafficGenerator = new TrafficGenerator();
