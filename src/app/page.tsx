"use client";

import { useState, useEffect } from "react";
import { Calendar, Baby, Heart, TrendingUp, Plus, ChevronRight, Activity, Crown, Settings } from "lucide-react";
import { CycleTracker } from "@/components/cycle-tracker";
import { PregnancyTracker } from "@/components/pregnancy-tracker";
import { ChildGrowthTracker } from "@/components/child-growth-tracker";
import { PaymentModal } from "@/components/payment-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type UserPhase = "cycle" | "pregnancy" | "postpartum" | null;
type Plan = "free" | "premium" | "family";

export default function Home() {
  const [userPhase, setUserPhase] = useState<UserPhase>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<Plan>("free");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // Carregar fase do usuário e plano do localStorage
    const savedPhase = localStorage.getItem("userPhase") as UserPhase;
    const savedPlan = (localStorage.getItem("userPlan") as Plan) || "free";
    setUserPhase(savedPhase);
    setCurrentPlan(savedPlan);
    setIsLoading(false);
  }, []);

  const handlePhaseSelect = (phase: UserPhase) => {
    setUserPhase(phase);
    if (phase) {
      localStorage.setItem("userPhase", phase);
    }
  };

  const handlePlanChange = (plan: Plan) => {
    setCurrentPlan(plan);
    localStorage.setItem("userPlan", plan);
  };

  const getPlanBadge = () => {
    const badges = {
      free: { label: "Gratuito", color: "bg-gray-500" },
      premium: { label: "Premium", color: "bg-gradient-to-r from-purple-500 to-indigo-600" },
      family: { label: "Família", color: "bg-gradient-to-r from-blue-500 to-cyan-600" }
    };
    
    const badge = badges[currentPlan];
    return (
      <Badge className={`${badge.color} text-white border-0`}>
        {currentPlan !== "free" && <Crown className="w-3 h-3 mr-1" />}
        {badge.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="animate-pulse text-purple-600">Carregando...</div>
      </div>
    );
  }

  if (!userPhase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto py-8 md:py-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                Vida e Desenvolvimento
              </h1>
              {getPlanBadge()}
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-4">
              Acompanhamento personalizado em cada fase da sua jornada maternal
            </p>
            
            {currentPlan === "free" && (
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Desbloquear Recursos Premium
              </Button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-pink-300 bg-white/80 backdrop-blur-sm"
              onClick={() => handlePhaseSelect("cycle")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">Planejamento</CardTitle>
                <CardDescription className="text-gray-600">
                  Ciclo menstrual e fertilidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-pink-500 flex-shrink-0" />
                    <span>Registro do ciclo menstrual</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-pink-500 flex-shrink-0" />
                    <span>Previsão de ovulação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-pink-500 flex-shrink-0" />
                    <span>Dicas de fertilidade</span>
                    {currentPlan === "free" && <Crown className="w-3 h-3 text-purple-500" />}
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-purple-300 bg-white/80 backdrop-blur-sm"
              onClick={() => handlePhaseSelect("pregnancy")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">Gravidez</CardTitle>
                <CardDescription className="text-gray-600">
                  Acompanhamento semanal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>Desenvolvimento fetal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>Métricas vitais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>Recomendações personalizadas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-blue-300 bg-white/80 backdrop-blur-sm"
              onClick={() => handlePhaseSelect("postpartum")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <Baby className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">Pós-Parto</CardTitle>
                <CardDescription className="text-gray-600">
                  Crescimento infantil (0-13 anos)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span>Monitoramento de crescimento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span>Alertas de desvios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span>Marcos de desenvolvimento</span>
                    {currentPlan === "free" && <Crown className="w-3 h-3 text-purple-500" />}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Baseado em dados científicos e recomendações médicas
            </p>
          </div>
        </div>

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePlanChange}
          currentPlan={currentPlan}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Vida e Desenvolvimento
              </h1>
              {getPlanBadge()}
            </div>
            <div className="flex items-center gap-2">
              {currentPlan === "free" && (
                <Button
                  size="sm"
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white hidden sm:flex"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPaymentModal(true)}
                className="text-gray-600 hover:text-gray-800"
              >
                <Settings className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Plano</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUserPhase(null);
                  localStorage.removeItem("userPhase");
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Trocar Fase
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <Tabs defaultValue={userPhase} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm">
            <TabsTrigger 
              value="cycle" 
              onClick={() => handlePhaseSelect("cycle")}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Planejamento</span>
              <span className="sm:hidden">Ciclo</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pregnancy"
              onClick={() => handlePhaseSelect("pregnancy")}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Gravidez</span>
              <span className="sm:hidden">Gestação</span>
            </TabsTrigger>
            <TabsTrigger 
              value="postpartum"
              onClick={() => handlePhaseSelect("postpartum")}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <Baby className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Pós-Parto</span>
              <span className="sm:hidden">Bebê</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cycle" className="mt-0">
            <CycleTracker currentPlan={currentPlan} onUpgrade={() => setShowPaymentModal(true)} />
          </TabsContent>

          <TabsContent value="pregnancy" className="mt-0">
            <PregnancyTracker currentPlan={currentPlan} onUpgrade={() => setShowPaymentModal(true)} />
          </TabsContent>

          <TabsContent value="postpartum" className="mt-0">
            <ChildGrowthTracker currentPlan={currentPlan} onUpgrade={() => setShowPaymentModal(true)} />
          </TabsContent>
        </Tabs>
      </main>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePlanChange}
        currentPlan={currentPlan}
      />
    </div>
  );
}
