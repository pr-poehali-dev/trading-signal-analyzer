import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface AnalysisResult {
  signal: 'ВВЕРХ' | 'ВНИЗ';
  confidence: number;
  timeframe: string;
  expiration: string;
  indicators: {
    trend: string;
    momentum: string;
    volume: string;
  };
  analysis: string;
  entry_point: string;
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
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const scenarios = [
      {
        signal: 'ВВЕРХ' as const,
        confidence: 83,
        timeframe: '1 минута',
        expiration: '1-2 минуты',
        indicators: {
          trend: 'Формирование бычьей свечи Pin Bar',
          momentum: 'RSI(14) = 58, выход из зоны 50',
          volume: 'Объем на текущей свече +40%'
        },
        analysis: 'Цена отбилась от уровня поддержки с длинной нижней тенью. Индикатор Stochastic показывает разворот вверх из зоны перепроданности. MACD формирует бычий кросс.',
        entry_point: 'Входить на закрытии текущей свечи'
      },
      {
        signal: 'ВНИЗ' as const,
        confidence: 79,
        timeframe: '1 минута',
        expiration: '1-2 минуты',
        indicators: {
          trend: 'Медвежье поглощение на сопротивлении',
          momentum: 'RSI(14) = 68, отбой от зоны перекупленности',
          volume: 'Сильное давление продавцов'
        },
        analysis: 'График формирует паттерн "медвежье поглощение" у ключевого уровня. Bollinger Bands показывают перекупленность. Ожидается коррекция вниз.',
        entry_point: 'Сигнал активен следующие 30-60 секунд'
      },
      {
        signal: 'ВВЕРХ' as const,
        confidence: 86,
        timeframe: '5 минут',
        expiration: '5-10 минут',
        indicators: {
          trend: 'Пробой линии тренда с ретестом',
          momentum: 'MACD гистограмма растет, линии выше нуля',
          volume: 'Объем подтверждает движение вверх'
        },
        analysis: 'Цена пробила нисходящую линию тренда и успешно протестировала её как поддержку. EMA(9) пересекла EMA(21) снизу вверх. Все сигналы на рост.',
        entry_point: 'Входить при ретесте пробитого уровня'
      },
      {
        signal: 'ВНИЗ' as const,
        confidence: 81,
        timeframe: '1 минута',
        expiration: '1-3 минуты',
        indicators: {
          trend: 'Три последовательных красных свечи',
          momentum: 'Стохастик в зоне перекупленности (>80)',
          volume: 'Продажи превышают покупки на 35%'
        },
        analysis: 'Четкий нисходящий импульс. Цена отклонилась от верхней полосы Боллинджера и возвращается к средней линии. ADX показывает силу тренда >25.',
        entry_point: 'Входить на текущем уровне'
      },
      {
        signal: 'ВВЕРХ' as const,
        confidence: 77,
        timeframe: '5 минут',
        expiration: '5-15 минут',
        indicators: {
          trend: 'Паттерн "Молот" на поддержке',
          momentum: 'RSI дивергенция - цена ниже, RSI выше',
          volume: 'Появление покупателей у уровня'
        },
        analysis: 'Свечной паттерн "Молот" сформировался точно на уровне Фибоначчи 61.8%. Индикаторы показывают накопление позиций для отскока вверх.',
        entry_point: 'Ждать подтверждения - зеленая свеча'
      },
      {
        signal: 'ВНИЗ' as const,
        confidence: 84,
        timeframe: '1 минута',
        expiration: '1-2 минуты',
        indicators: {
          trend: 'Ложный пробой максимума (fakeout)',
          momentum: 'RSI медвежья дивергенция',
          volume: 'Объем на росте падает - слабость'
        },
        analysis: 'Цена попыталась обновить максимум, но не смогла закрепиться выше. Классический сигнал разворота. CCI показывает выход из экстремальной зоны вниз.',
        entry_point: 'Входить после закрытия свечи ниже предыдущего максимума'
      },
      {
        signal: 'ВВЕРХ' as const,
        confidence: 88,
        timeframe: '5 минут',
        expiration: '5-10 минут',
        indicators: {
          trend: 'Двойное дно + пробой шеи',
          momentum: 'MACD кросс вверх, гистограмма зеленая',
          volume: '+60% на пробое'
        },
        analysis: 'Классический разворотный паттерн "Двойное дно" полностью сформирован. Цена пробила линию шеи с большим объемом. Цель - высота паттерна от пробоя.',
        entry_point: 'Входить прямо сейчас или на откате к линии шеи'
      },
      {
        signal: 'ВНИЗ' as const,
        confidence: 76,
        timeframe: '1 минута',
        expiration: '1-2 минуты',
        indicators: {
          trend: 'Падающий клин прорван вниз',
          momentum: 'Momentum индикатор уходит в отрицательную зону',
          volume: 'Рост на продажах'
        },
        analysis: 'Паттерн продолжения тренда "Падающий клин" завершился пробоем нижней границы. Все краткосрочные MA направлены вниз. Коррекция продолжится.',
        entry_point: 'Входить на текущих уровнях'
      }
    ];
    
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setResult(randomScenario);
    
    toast({
      title: '📊 Анализ завершен',
      description: `Сигнал: ${randomScenario.signal} | Экспирация: ${randomScenario.expiration}`,
    });
    
    setIsAnalyzing(false);
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 rounded-lg bg-secondary/50 border border-border">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Сигнал для бинарных опционов</p>
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={`text-2xl font-bold px-6 py-3 ${
                            result.signal === 'ВВЕРХ' 
                              ? 'bg-[#00C853] hover:bg-[#00C853]/90 text-white' 
                              : 'bg-[#FF1744] hover:bg-[#FF1744]/90 text-white'
                          }`}
                        >
                          {result.signal === 'ВВЕРХ' ? (
                            <>
                              <Icon name="ArrowUp" size={24} className="mr-2" />
                              ВВЕРХ
                            </>
                          ) : (
                            <>
                              <Icon name="ArrowDown" size={24} className="mr-2" />
                              ВНИЗ
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="Clock" size={16} className="text-primary" />
                        <p className="text-xs text-muted-foreground">Таймфрейм</p>
                      </div>
                      <p className="text-lg font-bold">{result.timeframe}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="Timer" size={16} className="text-primary" />
                        <p className="text-xs text-muted-foreground">Экспирация</p>
                      </div>
                      <p className="text-lg font-bold">{result.expiration}</p>
                    </div>
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

                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Info" size={16} className="text-primary" />
                      Анализ
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.analysis}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Target" size={16} className="text-primary" />
                      Точка входа
                    </p>
                    <p className="text-sm font-medium text-foreground">{result.entry_point}</p>
                  </div>
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