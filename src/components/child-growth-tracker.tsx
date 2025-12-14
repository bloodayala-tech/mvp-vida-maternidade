"use client";

import { useState, useEffect } from "react";
import { Baby, TrendingUp, AlertTriangle, Plus, Edit, Trash2, LineChart, Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PremiumFeature } from "@/components/premium-feature";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChildData {
  id: string;
  name: string;
  birthDate: string;
  gender: "male" | "female";
}

interface GrowthRecord {
  id: string;
  childId: string;
  date: string;
  ageMonths: number;
  weight: number;
  height: number;
  headCircumference: number;
}

interface ChildGrowthTrackerProps {
  currentPlan: "free" | "premium" | "family";
  onUpgrade: () => void;
}

// Dados baseados nas curvas de crescimento da OMS
const growthStandards = {
  male: {
    weight: {
      0: { p3: 2.5, p50: 3.3, p97: 4.4 },
      6: { p3: 6.4, p50: 7.9, p97: 9.8 },
      12: { p3: 7.7, p50: 9.6, p97: 12.0 },
      24: { p3: 9.7, p50: 12.2, p97: 15.3 },
      36: { p3: 11.3, p50: 14.3, p97: 18.3 },
      60: { p3: 14.1, p50: 18.3, p97: 24.2 },
      120: { p3: 24.0, p50: 35.5, p97: 51.5 },
      156: { p3: 34.0, p50: 50.5, p97: 72.0 }
    },
    height: {
      0: { p3: 46.1, p50: 49.9, p97: 53.7 },
      6: { p3: 63.3, p50: 67.6, p97: 72.0 },
      12: { p3: 71.0, p50: 75.7, p97: 80.5 },
      24: { p3: 81.7, p50: 87.1, p97: 93.0 },
      36: { p3: 88.7, p50: 96.1, p97: 103.5 },
      60: { p3: 101.7, p50: 110.0, p97: 119.2 },
      120: { p3: 128.0, p50: 145.0, p97: 163.0 },
      156: { p3: 148.0, p50: 169.0, p97: 188.0 }
    }
  },
  female: {
    weight: {
      0: { p3: 2.4, p50: 3.2, p97: 4.2 },
      6: { p3: 5.7, p50: 7.3, p97: 9.3 },
      12: { p3: 7.0, p50: 8.9, p97: 11.2 },
      24: { p3: 9.0, p50: 11.5, p97: 14.8 },
      36: { p3: 10.8, p50: 13.9, p97: 18.1 },
      60: { p3: 13.7, p50: 18.2, p97: 24.9 },
      120: { p3: 23.5, p50: 36.0, p97: 54.0 },
      156: { p3: 34.0, p50: 52.0, p97: 76.0 }
    },
    height: {
      0: { p3: 45.4, p50: 49.1, p97: 52.9 },
      6: { p3: 61.2, p50: 65.7, p97: 70.3 },
      12: { p3: 68.9, p50: 74.0, p97: 79.2 },
      24: { p3: 80.0, p50: 86.4, p97: 92.9 },
      36: { p3: 87.4, p50: 95.1, p97: 103.0 },
      60: { p3: 100.0, p50: 109.0, p97: 118.9 },
      120: { p3: 127.0, p50: 144.0, p97: 162.0 },
      156: { p3: 147.0, p50: 160.0, p97: 173.0 }
    }
  }
};

// Marcos de desenvolvimento por idade (Premium)
const developmentMilestones = {
  0: ["Reflexos primitivos", "Foco visual limitado", "Reconhece voz materna"],
  3: ["Sustenta a cabeça", "Sorri socialmente", "Segue objetos com os olhos"],
  6: ["Senta com apoio", "Balbucia", "Pega objetos", "Rola"],
  9: ["Senta sem apoio", "Engatinha", "Diz 'mamã' e 'papá'", "Brinca de esconde-esconde"],
  12: ["Primeiros passos", "Primeiras palavras", "Aponta para objetos", "Bebe no copo"],
  18: ["Corre", "Sobe escadas", "Usa colher", "Vocabulário de 10-20 palavras"],
  24: ["Chuta bola", "Frases de 2 palavras", "Imita adultos", "Brinca ao lado de outras crianças"],
  36: ["Pedala triciclo", "Frases completas", "Usa banheiro", "Brinca de faz de conta"],
  48: ["Pula em um pé", "Conta histórias", "Desenha círculos", "Brinca cooperativamente"],
  60: ["Equilibra-se em um pé", "Conta até 10", "Escreve algumas letras", "Segue regras de jogos"]
};

export function ChildGrowthTracker({ currentPlan, onUpgrade }: ChildGrowthTrackerProps) {
  const [children, setChildren] = useState<ChildData[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [isChildDialogOpen, setIsChildDialogOpen] = useState(false);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  
  const isPremium = currentPlan === "premium" || currentPlan === "family";
  const maxChildren = currentPlan === "free" ? 1 : currentPlan === "premium" ? 3 : 5;

  const [childFormData, setChildFormData] = useState({
    name: "",
    birthDate: format(new Date(), "yyyy-MM-dd"),
    gender: "female" as "male" | "female",
  });

  const [recordFormData, setRecordFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    weight: "",
    height: "",
    headCircumference: "",
  });

  useEffect(() => {
    const savedChildren = localStorage.getItem("children");
    const savedRecords = localStorage.getItem("growthRecords");
    
    if (savedChildren) {
      const parsedChildren = JSON.parse(savedChildren);
      setChildren(parsedChildren);
      if (parsedChildren.length > 0 && !selectedChild) {
        setSelectedChild(parsedChildren[0].id);
      }
    }
    
    if (savedRecords) {
      setGrowthRecords(JSON.parse(savedRecords));
    }
  }, []);

  const calculateAgeInMonths = (birthDate: string, recordDate: string) => {
    const birth = parseISO(birthDate);
    const record = parseISO(recordDate);
    const diffTime = Math.abs(record.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.44);
  };

  const handleSaveChild = () => {
    if (children.length >= maxChildren) {
      alert(`Você atingiu o limite de ${maxChildren} criança(s) no plano ${currentPlan === "free" ? "Gratuito" : "atual"}. Faça upgrade para adicionar mais!`);
      return;
    }

    const newChild: ChildData = {
      id: Date.now().toString(),
      ...childFormData,
    };
    
    const updatedChildren = [...children, newChild];
    setChildren(updatedChildren);
    localStorage.setItem("children", JSON.stringify(updatedChildren));
    setSelectedChild(newChild.id);
    setIsChildDialogOpen(false);
    setChildFormData({
      name: "",
      birthDate: format(new Date(), "yyyy-MM-dd"),
      gender: "female",
    });
  };

  const handleSaveRecord = () => {
    const child = children.find(c => c.id === selectedChild);
    if (!child) return;

    const ageMonths = calculateAgeInMonths(child.birthDate, recordFormData.date);
    
    const newRecord: GrowthRecord = {
      id: Date.now().toString(),
      childId: selectedChild!,
      date: recordFormData.date,
      ageMonths,
      weight: parseFloat(recordFormData.weight),
      height: parseFloat(recordFormData.height),
      headCircumference: parseFloat(recordFormData.headCircumference),
    };
    
    const updatedRecords = [...growthRecords, newRecord];
    setGrowthRecords(updatedRecords);
    localStorage.setItem("growthRecords", JSON.stringify(updatedRecords));
    setIsRecordDialogOpen(false);
    setRecordFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      weight: "",
      height: "",
      headCircumference: "",
    });
  };

  const deleteRecord = (recordId: string) => {
    const updatedRecords = growthRecords.filter(r => r.id !== recordId);
    setGrowthRecords(updatedRecords);
    localStorage.setItem("growthRecords", JSON.stringify(updatedRecords));
  };

  const getClosestStandard = (ageMonths: number) => {
    const availableAges = [0, 6, 12, 24, 36, 60, 120, 156];
    return availableAges.reduce((prev, curr) => 
      Math.abs(curr - ageMonths) < Math.abs(prev - ageMonths) ? curr : prev
    );
  };

  const getClosestMilestone = (ageMonths: number) => {
    const availableAges = [0, 3, 6, 9, 12, 18, 24, 36, 48, 60];
    const closest = availableAges.reduce((prev, curr) => 
      Math.abs(curr - ageMonths) < Math.abs(prev - ageMonths) ? curr : prev
    );
    return developmentMilestones[closest as keyof typeof developmentMilestones] || [];
  };

  const analyzeGrowth = (record: GrowthRecord, child: ChildData) => {
    const closestAge = getClosestStandard(record.ageMonths);
    const standards = growthStandards[child.gender];
    
    const weightStandard = standards.weight[closestAge as keyof typeof standards.weight];
    const heightStandard = standards.height[closestAge as keyof typeof standards.height];
    
    const alerts: string[] = [];
    
    if (record.weight < weightStandard.p3) {
      alerts.push("Peso abaixo do percentil 3 - consulte o pediatra");
    } else if (record.weight > weightStandard.p97) {
      alerts.push("Peso acima do percentil 97 - monitore com atenção");
    }
    
    if (record.height < heightStandard.p3) {
      alerts.push("Altura abaixo do percentil 3 - avaliação necessária");
    } else if (record.height > heightStandard.p97) {
      alerts.push("Altura acima do percentil 97");
    }
    
    return {
      alerts,
      weightPercentile: record.weight < weightStandard.p3 ? "< P3" : 
                       record.weight > weightStandard.p97 ? "> P97" : "P3-P97",
      heightPercentile: record.height < heightStandard.p3 ? "< P3" : 
                       record.height > heightStandard.p97 ? "> P97" : "P3-P97",
    };
  };

  const currentChild = children.find(c => c.id === selectedChild);
  const childRecords = growthRecords
    .filter(r => r.childId === selectedChild)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentAgeMonths = currentChild ? calculateAgeInMonths(currentChild.birthDate, format(new Date(), "yyyy-MM-dd")) : 0;
  const milestones = getClosestMilestone(currentAgeMonths);

  if (children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
              <Baby className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Começar Acompanhamento</CardTitle>
            <CardDescription>
              Cadastre seu filho(a) para monitorar o crescimento e desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isChildDialogOpen} onOpenChange={setIsChildDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Criança
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cadastrar Criança</DialogTitle>
                  <DialogDescription>
                    Informe os dados da criança
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={childFormData.name}
                      onChange={(e) => setChildFormData({ ...childFormData, name: e.target.value })}
                      placeholder="Nome da criança"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={childFormData.birthDate}
                      onChange={(e) => setChildFormData({ ...childFormData, birthDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Sexo</Label>
                    <Select
                      value={childFormData.gender}
                      onValueChange={(value: "male" | "female") => 
                        setChildFormData({ ...childFormData, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="male">Masculino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveChild} className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white">
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
      {/* Seleção de Criança */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="childSelect" className="text-sm text-gray-600 mb-2 block">
                Criança Selecionada ({children.length}/{maxChildren})
              </Label>
              <Select value={selectedChild || undefined} onValueChange={setSelectedChild}>
                <SelectTrigger id="childSelect" className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name} - {format(parseISO(child.birthDate), "dd/MM/yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isChildDialogOpen} onOpenChange={setIsChildDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={children.length >= maxChildren}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Criança
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cadastrar Criança</DialogTitle>
                  <DialogDescription>
                    Informe os dados da criança
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={childFormData.name}
                      onChange={(e) => setChildFormData({ ...childFormData, name: e.target.value })}
                      placeholder="Nome da criança"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={childFormData.birthDate}
                      onChange={(e) => setChildFormData({ ...childFormData, birthDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Sexo</Label>
                    <Select
                      value={childFormData.gender}
                      onValueChange={(value: "male" | "female") => 
                        setChildFormData({ ...childFormData, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="male">Masculino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveChild} className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white">
                  Salvar
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Marcos de Desenvolvimento - Premium ou Bloqueado */}
      {isPremium ? (
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-800">
              <Crown className="w-5 h-5 text-cyan-600" />
              Marcos de Desenvolvimento - {currentAgeMonths} meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {milestones.map((milestone, index) => (
                <li key={index} className="flex gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{milestone}</p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              * Cada criança se desenvolve em seu próprio ritmo. Consulte o pediatra se tiver dúvidas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <PremiumFeature
          title="Marcos de Desenvolvimento"
          description="Acompanhe os marcos esperados para cada idade e monitore o desenvolvimento do seu filho"
          onUpgrade={onUpgrade}
        />
      )}

      {/* Adicionar Medição */}
      {currentChild && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <TrendingUp className="w-5 h-5" />
              Registrar Nova Medição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Medição
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova Medição - {currentChild.name}</DialogTitle>
                  <DialogDescription>
                    Registre as medidas atuais
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data da Medição</Label>
                    <Input
                      id="date"
                      type="date"
                      value={recordFormData.date}
                      onChange={(e) => setRecordFormData({ ...recordFormData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={recordFormData.weight}
                      onChange={(e) => setRecordFormData({ ...recordFormData, weight: e.target.value })}
                      placeholder="Ex: 3.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={recordFormData.height}
                      onChange={(e) => setRecordFormData({ ...recordFormData, height: e.target.value })}
                      placeholder="Ex: 50.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headCircumference">Perímetro Cefálico (cm)</Label>
                    <Input
                      id="headCircumference"
                      type="number"
                      step="0.1"
                      value={recordFormData.headCircumference}
                      onChange={(e) => setRecordFormData({ ...recordFormData, headCircumference: e.target.value })}
                      placeholder="Ex: 35.0"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveRecord} className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white">
                  Salvar Medição
                </Button>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Medições */}
      {childRecords.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-500" />
            Histórico de Crescimento
          </h3>
          {childRecords.map((record) => {
            const analysis = currentChild ? analyzeGrowth(record, currentChild) : null;
            
            return (
              <Card key={record.id} className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {format(parseISO(record.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </CardTitle>
                      <CardDescription>
                        {record.ageMonths} meses de idade
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRecord(record.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Peso</p>
                      <p className="text-lg font-bold text-blue-800">{record.weight} kg</p>
                      {analysis && (
                        <p className="text-xs text-gray-500 mt-1">{analysis.weightPercentile}</p>
                      )}
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Altura</p>
                      <p className="text-lg font-bold text-blue-800">{record.height} cm</p>
                      {analysis && (
                        <p className="text-xs text-gray-500 mt-1">{analysis.heightPercentile}</p>
                      )}
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">P. Cefálico</p>
                      <p className="text-lg font-bold text-blue-800">{record.headCircumference} cm</p>
                    </div>
                  </div>
                  
                  {analysis && analysis.alerts.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          {analysis.alerts.map((alert, index) => (
                            <p key={index} className="text-sm text-amber-800">{alert}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma medição registrada ainda</p>
            <p className="text-sm text-gray-500 mt-2">
              Adicione a primeira medição para começar o acompanhamento
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informações sobre Percentis */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-indigo-800">Sobre os Percentis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>P3-P97:</strong> Faixa considerada normal pela OMS (Organização Mundial da Saúde)
          </p>
          <p>
            <strong>&lt; P3:</strong> Abaixo do esperado - requer avaliação médica
          </p>
          <p>
            <strong>&gt; P97:</strong> Acima do esperado - monitoramento recomendado
          </p>
          <p className="text-xs text-gray-600 mt-3">
            * Os percentis são baseados nas curvas de crescimento da OMS e servem como referência. 
            Sempre consulte um pediatra para avaliação completa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
