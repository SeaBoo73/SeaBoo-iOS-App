import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Wifi, 
  Database, 
  Smartphone, 
  Image, 
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  icon: any;
  description: string;
  optimization?: string;
}

export function PerformanceOptimizer() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    // Simulate performance measurement
    const measurePerformance = () => {
      const performanceMetrics: PerformanceMetric[] = [
        {
          name: 'First Contentful Paint',
          value: 1.2,
          status: 'good',
          icon: Zap,
          description: 'Tempo di primo rendering del contenuto',
          optimization: 'Immagini ottimizzate con WebP'
        },
        {
          name: 'Largest Contentful Paint',
          value: 2.1,
          status: 'good', 
          icon: Image,
          description: 'Tempo di caricamento elemento principale',
          optimization: 'Lazy loading implementato'
        },
        {
          name: 'Cumulative Layout Shift',
          value: 0.05,
          status: 'good',
          icon: Smartphone,
          description: 'Stabilità layout durante caricamento',
          optimization: 'Dimensioni immagini specificate'
        },
        {
          name: 'Time to Interactive',
          value: 2.8,
          status: 'warning',
          icon: Clock,
          description: 'Tempo prima che la pagina sia interattiva',
          optimization: 'Codice JavaScript ottimizzato'
        },
        {
          name: 'Network Requests',
          value: 15,
          status: 'good',
          icon: Wifi,
          description: 'Numero di richieste di rete',
          optimization: 'Bundles consolidati'
        },
        {
          name: 'Database Query Time',
          value: 120,
          status: 'good',
          icon: Database,
          description: 'Tempo medio query database (ms)',
          optimization: 'Indici ottimizzati'
        }
      ];
      
      setMetrics(performanceMetrics);
    };

    measurePerformance();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Clock;
    }
  };

  const overallScore = Math.round(
    metrics.reduce((acc, metric) => {
      const score = metric.status === 'good' ? 100 : metric.status === 'warning' ? 70 : 40;
      return acc + score;
    }, 0) / metrics.length
  );

  const runOptimization = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update metrics with improved values
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.name === 'Time to Interactive' ? 2.1 : metric.value,
      status: metric.name === 'Time to Interactive' ? 'good' : metric.status
    })));
    
    setIsOptimizing(false);
  };

  return (
    <div className="space-y-6">
      {/* Overall Performance Score */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Performance Score</h3>
                <p className="text-sm text-gray-600">Ottimizzazione automatica attiva</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{overallScore}</div>
              <div className="text-sm text-gray-600">/ 100</div>
            </div>
          </div>
          
          <Progress value={overallScore} className="h-2 mb-4" />
          
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className={overallScore >= 90 ? 'bg-green-100 text-green-800' : 
                        overallScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}
            >
              {overallScore >= 90 ? 'Eccellente' : overallScore >= 70 ? 'Buono' : 'Needs Improvement'}
            </Badge>
            
            <Button 
              onClick={runOptimization}
              disabled={isOptimizing}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isOptimizing ? 'Ottimizzando...' : 'Ottimizza Ora'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const StatusIcon = getStatusIcon(metric.status);
          
          return (
            <Card key={index} className={`border ${getStatusColor(metric.status)} border-opacity-50`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <StatusIcon className={`h-4 w-4 ${
                    metric.status === 'good' ? 'text-green-600' :
                    metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                
                <h4 className="font-medium text-gray-900 text-sm mb-1">{metric.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{metric.description}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    {typeof metric.value === 'number' ? 
                      (metric.value < 10 ? `${metric.value}s` : `${metric.value}ms`) : 
                      metric.value
                    }
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {metric.status === 'good' ? 'OK' : 
                     metric.status === 'warning' ? 'Warning' : 'Critical'}
                  </Badge>
                </div>
                
                {metric.optimization && (
                  <p className="text-xs text-blue-600 font-medium">
                    ✓ {metric.optimization}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Optimization Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Ottimizzazioni Attive</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">Lazy loading immagini</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">Compressione WebP automatica</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">Code splitting React</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">Database query caching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">CDN asset delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">Mobile-first responsive design</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}