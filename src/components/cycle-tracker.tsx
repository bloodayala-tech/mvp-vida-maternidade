"use client";

import { useState, useEffect } from "react";
import { Calendar, Heart, Droplet, TrendingUp, AlertCircle, Plus, Crown, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PremiumFeature } from "@/components/premium-feature";
import { format, addDays, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CycleData {
  lastPeriodDate: string;
  cycleLength: number;
  periodLength: number;
}

interface CycleTrackerProps {
  currentPlan: "free" | "premium" | "family";
  onUpgrade: () => void;
}

export function CycleTracker({ currentPlan, onUpgrade }: CycleTrackerProps) {
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    lastPeriodDate: format(new Date(), "yyyy-MM-dd"),
    cycleLength: "28",
    periodLength: "5",
  });

  const isPremium = currentPlan === "premium" || currentPlan === "family";

  useEffect(() => {
    const saved = localStorage.getItem("cycleData");
    if (saved) {
      setCycleData(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    const data: CycleData = {
      lastPeriodDate: formData.lastPeriodDate,
      cycleLength: parseInt(formData.cycleLength),
      periodLength: parseInt(formData.periodLength),
    };
    setCycleData(data);
    localStorage.setItem("cycleData", JSON.stringify(data));
    setIsDialogOpen(false);
  };

  const calculateOvulation = () => {
    if (!cycleData) return null;
    const lastPeriod = parseISO(cycleData.lastPeriodDate);
    const ovulationDay = addDays(lastPeriod, cycleData.cycleLength - 14);
    return ovulationDay;
  };

  const calculateFertileWindow = () => {
    const ovulation = calculateOvulation();
    if (!ovulation) return null;
    return {
      start: addDays(ovulation, -5),
      end: addDays(ovulation, 1),
    };
  };

  const calculateNextPeriod = () => {
    if (!cycleData) return null;
    const lastPeriod = parseISO(cycleData.lastPeriodDate);
    return addDays(lastPeriod, cycleData.cycleLength);
  };

  const getCurrentPhase = () => {
    if (!cycleData) return null;
    const today = new Date();
    const lastPeriod = parseISO(cycleData.lastPeriodDate);
    const dayInCycle = differenceInDays(today, lastPeriod) % cycleData.cycleLength;

    if (dayInCycle <= cycleData.periodLength) {
      return { name: "Menstruação", color: "from-red-400 to-pink-500", icon: Droplet };
    } else if (dayInCycle <= 13) {
      return { name: "Fase Folicular", color: "from-green-400 to-emerald-500", icon: TrendingUp };
    } else if (dayInCycle <= 16) {
      return { name: "Ovulação", color: "from-purple-400 to-pink-500", icon: Heart };
    } else {
      return { name: "Fase Lútea", color: "from-blue-400 to-indigo-500", icon: Calendar };
    }
  };

  const ovulation = calculateOvulation();
  const fertileWindow = calculateFertileWindow();
  const nextPeriod = calculateNextPeriod();
  const currentPhase = getCurrentPhase();

  if (!cycleData) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Começar Acompanhamento</CardTitle>
            <CardDescription>
              Registre seu ciclo menstrual para receber previsões e dicas personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Ciclo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Registrar Ciclo Menstrual</DialogTitle>
                  <DialogDescription>
                    Informe os dados do seu último ciclo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastPeriod">Data do último período</Label>
                    <Input
                      id="lastPeriod"
                      type="date"
                      value={formData.lastPeriodDate}
                      onChange={(e) => setFormData({ ...formData, lastPeriodDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cycleLength">Duração do ciclo (dias)</Label>
                    <Input
                      id="cycleLength"
                      type="number"
                      min="21"
                      max="35"
                      value={formData.cycleLength}
                      onChange={(e) => setFormData({ ...formData, cycleLength: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Média: 28 dias</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodLength">Duração do período (dias)</Label>
                    <Input
                      id="periodLength"
                      type="number"
                      min="3"
                      max="7"
                      value={formData.periodLength}
                      onChange={(e) => setFormData({ ...formData, periodLength: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Média: 5 dias</p>
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white">
                  Salvar
                </Button>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  const PhaseIcon = currentPhase?.icon || Calendar;

  return (
    <div className="space-y-6">
      {/* Fase Atual */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-pink-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${currentPhase?.color} rounded-full flex items-center justify-center`}>
                <PhaseIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Fase Atual</CardTitle>
                <CardDescription className="text-lg font-semibold text-gray-700">
                  {currentPhase?.name}
                </CardDescription>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Editar</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Atualizar Ciclo Menstrual</DialogTitle>
                  <DialogDescription>
                    Atualize os dados do seu ciclo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastPeriod">Data do último período</Label>
                    <Input
                      id="lastPeriod"
                      type="date"
                      value={formData.lastPeriodDate}
                      onChange={(e) => setFormData({ ...formData, lastPeriodDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cycleLength">Duração do ciclo (dias)</Label>
                    <Input
                      id="cycleLength"
                      type="number"
                      min="21"
                      max="35"
                      value={formData.cycleLength}
                      onChange={(e) => setFormData({ ...formData, cycleLength: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodLength">Duração do período (dias)</Label>
                    <Input
                      id="periodLength"
                      type="number"
                      min="3"
                      max="7"
                      value={formData.periodLength}
                      onChange={(e) => setFormData({ ...formData, periodLength: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white">
                  Atualizar
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Previsões */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Heart className="w-4 h-4 text-purple-500" />
              Ovulação Prevista
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-800">
              {ovulation ? format(ovulation, "dd 'de' MMM", { locale: ptBR }) : "-"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {ovulation && differenceInDays(ovulation, new Date()) > 0
                ? `Em ${differenceInDays(ovulation, new Date())} dias`
                : "Passou"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Janela Fértil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-gray-800">
              {fertileWindow
                ? `${format(fertileWindow.start, "dd/MM", { locale: ptBR })} - ${format(fertileWindow.end, "dd/MM", { locale: ptBR })}`
                : "-"}
            </p>
            <p className="text-xs text-gray-500 mt-1">6 dias de alta fertilidade</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              Próximo Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-800">
              {nextPeriod ? format(nextPeriod, "dd 'de' MMM", { locale: ptBR }) : "-"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {nextPeriod && differenceInDays(nextPeriod, new Date()) > 0
                ? `Em ${differenceInDays(nextPeriod, new Date())} dias`
                : "Atrasado"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dicas de Fertilidade - Premium ou Bloqueado */}
      {isPremium ? (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Crown className="w-5 h-5 text-purple-600" />
              Dicas Avançadas de Fertilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Hidratação:</strong> Beba pelo menos 2 litros de água por dia para melhorar a qualidade do muco cervical.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Alimentação:</strong> Consuma alimentos ricos em ácido fólico, ferro e ômega-3.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Exercícios:</strong> Pratique atividades físicas moderadas regularmente para equilibrar hormônios.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Sono:</strong> Durma de 7-9 horas por noite para otimizar a produção hormonal.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Estresse:</strong> Pratique técnicas de relaxamento como meditação e yoga.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Temperatura Basal:</strong> Monitore sua temperatura corporal pela manhã para identificar padrões de ovulação.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Suplementação:</strong> Considere suplementos de vitamina D, CoQ10 e inositol após consulta médica.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <PremiumFeature
          title="Dicas Avançadas de Fertilidade"
          description="Acesse recomendações personalizadas baseadas em ciência para aumentar suas chances de concepção"
          onUpgrade={onUpgrade}
        />
      )}
    </div>
  );
}
