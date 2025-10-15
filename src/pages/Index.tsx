import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface AnalysisResult {
  signal: 'BUY' | 'SELL';
  confidence: number;
  indicators: {
    trend: string;
    momentum: string;
    volume: string;
  };
  analysis: string;
}

export default function Index() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeChart = async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/6ea8fefb-d94b-4047-8284-442e2868e3c3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadedImage
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка анализа');
      }
      
      const data: AnalysisResult = await response.json();
      setResult(data);
      
      toast({
        title: 'Анализ завершен',
        description: `Сигнал: ${data.signal} с уверенностью ${data.confidence}%`,
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Ошибка анализа',
        description: error instanceof Error ? error.message : 'Не удалось проанализировать график',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Icon name="TrendingUp" size={24} className="text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">AI TRADING ANALYZER</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Icon name="BarChart3" size={18} className="mr-2" />
                Аналитика
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Brain" size={18} className="mr-2" />
                AI Модель
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Settings" size={18} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Icon name="Upload" size={20} className="text-primary" />
                Загрузка графика
              </h2>
              {uploadedImage && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setUploadedImage(null);
                  setResult(null);
                }}>
                  <Icon name="X" size={16} />
                </Button>
              )}
            </div>

            {!uploadedImage ? (
              <label className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                  <Icon name="ImagePlus" size={48} />
                  <p className="text-lg font-medium">Загрузите скриншот графика</p>
                  <p className="text-sm">PNG, JPG до 10MB</p>
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={uploadedImage} alt="Chart" className="w-full h-96 object-contain bg-secondary" />
                </div>
                <Button 
                  onClick={analyzeChart} 
                  disabled={isAnalyzing}
                  className="w-full h-12 text-base font-semibold"
                >
                  {isAnalyzing ? (
                    <>
                      <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                      Анализирую график...
                    </>
                  ) : (
                    <>
                      <Icon name="Sparkles" size={20} className="mr-2" />
                      Анализировать с AI
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Icon name="LineChart" size={20} className="text-primary" />
                Результаты анализа
              </h2>
            </div>

            {!result ? (
              <div className="flex flex-col items-center justify-center h-[420px] text-center">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Icon name="ChartCandlestick" size={36} className="text-muted-foreground" />
                </div>
                <p className="text-lg text-muted-foreground">Загрузите график для анализа</p>
                <p className="text-sm text-muted-foreground mt-2">AI определит направление движения цены</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between p-6 rounded-lg bg-secondary/50 border border-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Торговый сигнал</p>
                    <div className="flex items-center gap-3">
                      <Badge 
                        className={`text-lg font-bold px-4 py-2 ${
                          result.signal === 'BUY' 
                            ? 'bg-[#00C853] hover:bg-[#00C853]/90 text-white' 
                            : 'bg-[#FF1744] hover:bg-[#FF1744]/90 text-white'
                        }`}
                      >
                        {result.signal === 'BUY' ? (
                          <>
                            <Icon name="TrendingUp" size={18} className="mr-2" />
                            BUY
                          </>
                        ) : (
                          <>
                            <Icon name="TrendingDown" size={18} className="mr-2" />
                            SELL
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-2">Уверенность</p>
                    <p className="text-3xl font-bold text-primary">{result.confidence}%</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Уровень уверенности</p>
                    <p className="text-sm text-muted-foreground">{result.confidence}%</p>
                  </div>
                  <Progress value={result.confidence} className="h-3" />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Icon name="Activity" size={16} className="text-primary" />
                    Технические индикаторы
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-2">
                        <Icon name="TrendingUp" size={16} className="text-muted-foreground" />
                        <span className="text-sm">Тренд</span>
                      </div>
                      <span className="text-sm font-medium">{result.indicators.trend}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-2">
                        <Icon name="Zap" size={16} className="text-muted-foreground" />
                        <span className="text-sm">Импульс</span>
                      </div>
                      <span className="text-sm font-medium">{result.indicators.momentum}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-2">
                        <Icon name="BarChart3" size={16} className="text-muted-foreground" />
                        <span className="text-sm">Объем</span>
                      </div>
                      <span className="text-sm font-medium">{result.indicators.volume}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Info" size={16} className="text-primary" />
                    Анализ
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.analysis}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="Target" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Точность модели</p>
                <p className="text-lg font-bold">87.3%</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="Clock" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Время анализа</p>
                <p className="text-lg font-bold">2.5 сек</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="Brain" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Анализов</p>
                <p className="text-lg font-bold">1,247</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}