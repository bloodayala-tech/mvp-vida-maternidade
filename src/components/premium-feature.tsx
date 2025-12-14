"use client";

import { Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PremiumFeatureProps {
  title: string;
  description: string;
  onUpgrade: () => void;
}

export function PremiumFeature({ title, description, onUpgrade }: PremiumFeatureProps) {
  return (
    <Card className="relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-bl-full" />
      
      <CardHeader className="text-center pb-4 relative">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="text-center relative">
        <div className="mb-6 p-4 bg-white/50 rounded-lg">
          <Crown className="w-8 h-8 mx-auto mb-2 text-purple-500" />
          <p className="text-sm text-gray-600">
            Esta funcionalidade está disponível apenas para assinantes Premium
          </p>
        </div>

        <Button
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white"
        >
          Fazer Upgrade para Premium
        </Button>

        <p className="mt-3 text-xs text-gray-500">
          A partir de R$ 19,90/mês • Cancele quando quiser
        </p>
      </CardContent>
    </Card>
  );
}
