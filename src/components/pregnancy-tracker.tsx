"use client";

import { useState, useEffect } from "react";
import { Heart, Baby, Activity, TrendingUp, AlertCircle, Calendar, Plus, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { format, addWeeks, differenceInWeeks, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PregnancyData {
  dueDate: string;
  lastPeriodDate: string;
}

interface PregnancyTrackerProps {
  currentPlan: "free" | "premium" | "family";
  onUpgrade: () => void;
}

interface WeekInfo {
  week: number;
  title: string;
  babySize: string;
  babyWeight: string;
  development: string[];
  motherTips: string[];
}

const weeklyInfo: Record<number, WeekInfo> = {
  4: {
    week: 4,
    title: "Início da Jornada",
    babySize: "Semente de papoula (2mm)",
    babyWeight: "< 1g",
    development: [
      "Implantação do embrião no útero",
      "Formação inicial do sistema nervoso",
      "Início da produção de hCG"
    ],
    motherTips: [
      "Comece a tomar ácido fólico (400-800mcg/dia)",
      "Evite álcool e tabaco",
      "Agende consulta com obstetra"
    ]
  },
  8: {
    week: 8,
    title: "Desenvolvimento Rápido",
    babySize: "Framboesa (1,6cm)",
    babyWeight: "1g",
    development: [
      "Formação de dedos das mãos e pés",
      "Coração batendo regularmente",
      "Início da formação dos órgãos principais"
    ],
    motherTips: [
      "Mantenha-se hidratada",
      "Faça refeições pequenas e frequentes",
      "Descanse quando sentir necessidade"
    ]
  },
  12: {
    week: 12,
    title: "Fim do Primeiro Trimestre",
    babySize: "Ameixa (5,4cm)",
    babyWeight: "14g",
    development: [
      "Todos os órgãos vitais formados",
      "Reflexos começam a aparecer",
      "Sistema digestivo funcionando"
    ],
    motherTips: [
      "Realize o ultrassom de translucência nucal",
      "Náuseas podem começar a diminuir",
      "Continue com vitaminas pré-natais"
    ]
  },
  16: {
    week: 16,
    title: "Segundo Trimestre",
    babySize: "Abacate (11,6cm)",
    babyWeight: "100g",
    development: [
      "Movimentos mais coordenados",
      "Audição em desenvolvimento",
      "Padrões de sono estabelecidos"
    ],
    motherTips: [
      "Você pode começar a sentir movimentos",
      "Mantenha atividade física leve",
      "Hidrate-se bem"
    ]
  },
  20: {
    week: 20,
    title: "Metade da Gestação",
    babySize: "Banana (16,4cm)",
    babyWeight: "300g",
    development: [
      "Vérnix (camada protetora) se forma",
      "Cabelo e unhas crescendo",
      "Bebê pode ouvir sons externos"
    ],
    motherTips: [
      "Ultrassom morfológico",
      "Comece a pensar em nomes",
      "Converse com seu bebê"
    ]
  },
  24: {
    week: 24,
    title: "Viabilidade Fetal",
    babySize: "Espiga de milho (30cm)",
    babyWeight: "600g",
    development: [
      "Pulmões em desenvolvimento",
      "Papilas gustativas funcionando",
      "Padrões de sono regulares"
    ],
    motherTips: [
      "Faça o teste de diabetes gestacional",
      "Monitore ganho de peso",
      "Pratique exercícios de respiração"
    ]
  },
  28: {
    week: 28,
    title: "Terceiro Trimestre",
    babySize: "Berinjela (37,6cm)",
    babyWeight: "1kg",
    development: [
      "Olhos podem abrir e fechar",
      "Cérebro em rápido desenvolvimento",
      "Pode sonhar"
    ],
    motherTips: [
      "Consultas mais frequentes",
      "Prepare o enxoval",
      "Considere curso de preparação para o parto"
    ]
  },
  32: {
    week: 32,
    title: "Crescimento Acelerado",
    babySize: "Abóbora (42,4cm)",
    babyWeight: "1,7kg",
    development: [
      "Camadas de gordura se formam",
      "Unhas completamente formadas",
      "Posição para o parto"
    ],
    motherTips: [
      "Monitore movimentos fetais",
      "Prepare a mala da maternidade",
      "Descanse com pernas elevadas"
    ]
  },
  36: {
    week: 36,
    title: "Quase Lá",
    babySize: "Melão (47,4cm)",
    babyWeight: "2,6kg",
    development: [
      "Pulmões quase maduros",
      "Sistema imunológico fortalecido",
      "Ganhando peso rapidamente"
    ],
    motherTips: [
      "Consultas semanais",
      "Finalize preparativos",
      "Pratique técnicas de respiração"
    ]
  },
  40: {
    week: 40,
    title: "Hora do Encontro",
    babySize: "Melancia (51,2cm)",
    babyWeight: "3,4kg",
    development: [
      "Totalmente desenvolvido",
      "Pronto para nascer",
      "Aguardando o momento certo"
    ],
    motherTips: [
      "Fique atenta aos sinais de trabalho de parto",
      "Mantenha-se calma e confiante",
      "Logo você conhecerá seu bebê!"
    ]
  }
};

export function PregnancyTracker({ currentPlan, onUpgrade }: PregnancyTrackerProps) {
  const [pregnancyData, setPregnancyData] = useState<PregnancyData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    lastPeriodDate: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    const saved = localStorage.getItem("pregnancyData");
    if (saved) {
      setPregnancyData(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    const lastPeriod = parseISO(formData.lastPeriodDate);
    const dueDate = addWeeks(lastPeriod, 40);
    
    const data: PregnancyData = {
      dueDate: format(dueDate, "yyyy-MM-dd"),
      lastPeriodDate: formData.lastPeriodDate,
    };
    setPregnancyData(data);
    localStorage.setItem("pregnancyData", JSON.stringify(data));
    setIsDialogOpen(false);
  };

  const getCurrentWeek = () => {
    if (!pregnancyData) return 0;
    const lastPeriod = parseISO(pregnancyData.lastPeriodDate);
    const today = new Date();
    return Math.min(differenceInWeeks(today, lastPeriod), 40);
  };

  const getDaysUntilDue = () => {
    if (!pregnancyData) return 0;
    const dueDate = parseISO(pregnancyData.dueDate);
    return Math.max(differenceInDays(dueDate, new Date()), 0);
  };

  const getWeekInfo = (week: number): WeekInfo => {
    // Encontra a informação mais próxima
    const availableWeeks = Object.keys(weeklyInfo).map(Number).sort((a, b) => a - b);
    const closestWeek = availableWeeks.reduce((prev, curr) => 
      Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
    );
    return weeklyInfo[closestWeek];
  };

  const currentWeek = getCurrentWeek();
  const daysUntilDue = getDaysUntilDue();
  const progress = (currentWeek / 40) * 100;
  const trimester = currentWeek <= 13 ? 1 : currentWeek <= 27 ? 2 : 3;
  const weekInfo = getWeekInfo(currentWeek);

  if (!pregnancyData) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Começar Acompanhamento</CardTitle>
            <CardDescription>
              Registre sua gravidez para acompanhar o desenvolvimento semanal do bebê
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Gravidez
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Registrar Gravidez</DialogTitle>
                  <DialogDescription>
                    Informe a data do seu último período menstrual
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastPeriod">Data do último período (DUM)</Label>
                    <Input
                      id="lastPeriod"
                      type="date"
                      value={formData.lastPeriodDate}
                      onChange={(e) => setFormData({ lastPeriodDate: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      A data provável do parto será calculada automaticamente
                    </p>
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white">
                  Salvar
                </Button>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo da Gestação */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-purple-800">Semana {currentWeek} de 40</CardTitle>
              <CardDescription className="text-lg text-purple-600">
                {trimester}º Trimestre
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Atualizar Dados da Gravidez</DialogTitle>
                  <DialogDescription>
                    Atualize a data do último período menstrual
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastPeriod">Data do último período (DUM)</Label>
                    <Input
                      id="lastPeriod"
                      type="date"
                      value={formData.lastPeriodDate}
                      onChange={(e) => setFormData({ lastPeriodDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white">
                  Atualizar
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-purple-700 mb-2">
              <span>Progresso da gestação</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <p className="text-sm text-gray-600">Data Provável</p>
              <p className="text-lg font-bold text-purple-800">
                {format(parseISO(pregnancyData.dueDate), "dd/MM/yyyy")}
              </p>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <p className="text-sm text-gray-600">Faltam</p>
              <p className="text-lg font-bold text-purple-800">
                {daysUntilDue} dias
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desenvolvimento do Bebê */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Baby className="w-5 h-5" />
            Desenvolvimento do Bebê - Semana {weekInfo.week}
          </CardTitle>
          <CardDescription>{weekInfo.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Tamanho</p>
              <p className="text-lg font-semibold text-purple-800">{weekInfo.babySize}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Peso Aproximado</p>
              <p className="text-lg font-semibold text-purple-800">{weekInfo.babyWeight}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Desenvolvimento
            </h4>
            <ul className="space-y-2">
              {weekInfo.development.map((item, index) => (
                <li key={index} className="flex gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Dicas para a Mãe */}
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-800">
            <Heart className="w-5 h-5" />
            Recomendações para Você
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {weekInfo.motherTips.map((tip, index) => (
              <li key={index} className="flex gap-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-700">{tip}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Alertas Importantes */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            Sinais de Alerta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-3">
            Procure atendimento médico imediatamente se apresentar:
          </p>
          <ul className="space-y-2">
            <li className="flex gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
              <span>Sangramento vaginal intenso</span>
            </li>
            <li className="flex gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
              <span>Dor abdominal severa ou persistente</span>
            </li>
            <li className="flex gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
              <span>Diminuição ou ausência de movimentos fetais</span>
            </li>
            <li className="flex gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
              <span>Febre alta (acima de 38°C)</span>
            </li>
            <li className="flex gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
              <span>Visão turva ou dor de cabeça intensa</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
