"use client";

import { useState } from "react";
import { X, Check, CreditCard, Lock, Crown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Plan = "free" | "premium" | "family";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (plan: Plan) => void;
  currentPlan?: Plan;
}

const plans = {
  free: {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    icon: Lock,
    color: "from-gray-400 to-gray-500",
    features: [
      "Registro básico do ciclo",
      "Acompanhamento de 1 criança",
      "Dados salvos localmente",
      "Anúncios ocasionais"
    ],
    limitations: [
      "Sem previsões avançadas",
      "Sem exportação de dados",
      "Sem suporte prioritário"
    ]
  },
  premium: {
    name: "Premium",
    price: "R$ 19,90",
    period: "/mês",
    icon: Crown,
    color: "from-purple-400 to-indigo-500",
    features: [
      "Todas as funcionalidades gratuitas",
      "Previsões avançadas de fertilidade",
      "Acompanhamento ilimitado de crianças",
      "Exportação de dados em PDF",
      "Gráficos e análises detalhadas",
      "Sem anúncios",
      "Suporte prioritário"
    ],
    popular: true
  },
  family: {
    name: "Família",
    price: "R$ 29,90",
    period: "/mês",
    icon: Users,
    color: "from-blue-400 to-cyan-500",
    features: [
      "Todas as funcionalidades Premium",
      "Até 5 perfis de usuário",
      "Compartilhamento de dados entre perfis",
      "Lembretes personalizados",
      "Consultas com especialistas (1x/mês)",
      "Acesso antecipado a novos recursos"
    ]
  }
};

export function PaymentModal({ isOpen, onClose, onSuccess, currentPlan = "free" }: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("premium");
  const [step, setStep] = useState<"plans" | "payment" | "success">("plans");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });

  const handlePlanSelect = (plan: Plan) => {
    if (plan === "free") {
      onSuccess(plan);
      onClose();
      return;
    }
    setSelectedPlan(plan);
    setStep("payment");
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulação de processamento de pagamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setStep("success");
    
    setTimeout(() => {
      onSuccess(selectedPlan);
      onClose();
      setStep("plans");
      setCardData({ number: "", name: "", expiry: "", cvv: "" });
    }, 2000);
  };

  const isFormValid = () => {
    return (
      cardData.number.replace(/\s/g, "").length === 16 &&
      cardData.name.length > 3 &&
      cardData.expiry.length === 5 &&
      cardData.cvv.length === 3
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {step === "plans" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl md:text-3xl font-bold text-center">
                Escolha seu Plano
              </DialogTitle>
              <DialogDescription className="text-center">
                Desbloqueie todo o potencial da sua jornada maternal
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 md:grid-cols-3 mt-6">
              {(Object.keys(plans) as Plan[]).map((planKey) => {
                const plan = plans[planKey];
                const Icon = plan.icon;
                const isCurrentPlan = planKey === currentPlan;

                return (
                  <Card
                    key={planKey}
                    className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl ${
                      plan.popular ? "border-2 border-purple-400 scale-105" : "hover:scale-105"
                    } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
                    onClick={() => !isCurrentPlan && handlePlanSelect(planKey)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MAIS POPULAR
                      </div>
                    )}
                    
                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        PLANO ATUAL
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <div className={`mx-auto mb-4 w-16 h-16 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-gray-500">{plan.period}</span>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.limitations?.map((limitation, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                            <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full mt-6 ${
                          isCurrentPlan 
                            ? "bg-gray-300 cursor-not-allowed" 
                            : planKey === "free" 
                            ? "bg-gray-500 hover:bg-gray-600" 
                            : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                        } text-white`}
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan ? "Plano Atual" : planKey === "free" ? "Continuar Gratuito" : "Assinar Agora"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Finalizar Assinatura - {plans[selectedPlan].name}
              </DialogTitle>
              <DialogDescription>
                {plans[selectedPlan].price}/mês • Cancele quando quiser
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Informações do Cartão
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                      maxLength={19}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input
                      id="cardName"
                      placeholder="MARIA DA SILVA"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Validade</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/AA"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                        maxLength={5}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "").substring(0, 3) })}
                        maxLength={3}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("plans")}
                  disabled={isProcessing}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white"
                  onClick={handlePayment}
                  disabled={!isFormValid() || isProcessing}
                >
                  {isProcessing ? "Processando..." : `Pagar ${plans[selectedPlan].price}`}
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500">
                🔒 Pagamento seguro e criptografado • Cancele quando quiser
              </p>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="text-center py-8">
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
              <Check className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold mb-2">
              Pagamento Confirmado!
            </DialogTitle>
            <DialogDescription className="text-lg">
              Bem-vinda ao plano {plans[selectedPlan].name}! 🎉
            </DialogDescription>
            <p className="mt-4 text-sm text-gray-600">
              Todas as funcionalidades premium foram desbloqueadas.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
