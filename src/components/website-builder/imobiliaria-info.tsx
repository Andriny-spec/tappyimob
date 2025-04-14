import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { motion } from 'framer-motion';
import { Building2, Phone, MapPin, FileText, PencilRuler, Info } from 'lucide-react';

export type ImobiliariaInfo = {
  telefone: string;
  endereco: string;
  cnpj: string;
  creci: string;
  descricao: string;
};

interface ImobiliariaInfoStepProps {
  imobiliariaInfo: ImobiliariaInfo;
  onUpdateInfo: (info: ImobiliariaInfo) => void;
  onNextStep: () => void;
}

export function ImobiliariaInfoStep({
  imobiliariaInfo,
  onUpdateInfo,
  onNextStep
}: ImobiliariaInfoStepProps) {
  const [formValues, setFormValues] = useState<ImobiliariaInfo>(imobiliariaInfo || {
    telefone: '',
    endereco: '',
    cnpj: '',
    creci: '',
    descricao: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateInfo(formValues);
    onNextStep();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Informações da sua Imobiliária</h2>
        <p className="text-muted-foreground mb-2">
          Essas informações serão usadas para personalizar o conteúdo do seu site
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 text-amber-800 max-w-3xl mx-auto">
          <div className="flex items-start">
            <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-amber-500" />
            <p className="text-sm text-left">
              <strong>Importante:</strong> Preencha todos os campos com atenção, especialmente a descrição. 
              Nossa Inteligência Artificial irá gerar todo o conteúdo do seu site com base nestas informações. 
              Quanto mais detalhada for sua descrição, melhor será o resultado final!
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Contato</CardTitle>
              </div>
              <CardDescription>
                Telefone de contato principal da sua imobiliária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  placeholder="(XX) XXXXX-XXXX"
                  value={formValues.telefone}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Endereço</CardTitle>
              </div>
              <CardDescription>
                Localização física da sua imobiliária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço completo</Label>
                <Input
                  id="endereco"
                  name="endereco"
                  placeholder="Rua, número, bairro, cidade - UF"
                  value={formValues.endereco}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Documentação</CardTitle>
              </div>
              <CardDescription>
                Documentos oficiais da sua imobiliária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    placeholder="XX.XXX.XXX/XXXX-XX"
                    value={formValues.cnpj}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creci">CRECI</Label>
                  <Input
                    id="creci"
                    name="creci"
                    placeholder="Número do CRECI"
                    value={formValues.creci}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Sobre a Imobiliária</CardTitle>
              </div>
              <CardDescription>
                Descreva sua imobiliária, histórico, especialidades e diferenciais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="descricao" className="flex items-center gap-1">
                  Descrição
                  <span className="text-red-500">*</span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Essencial para IA
                  </span>
                </Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  placeholder="Conte detalhes sobre sua imobiliária, como: tempo de mercado, especialidades (aluguel, venda, imóveis de luxo, etc), diferenciais, regiões de atuação, valores da empresa..."
                  className="min-h-[180px]"
                  value={formValues.descricao}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">
                  Quanto mais detalhes você fornecer, melhor a IA poderá gerar conteúdo personalizado e atraente para seu site.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg"
            className="gap-2"
            disabled={!formValues.telefone || !formValues.endereco || !formValues.cnpj || !formValues.creci || !formValues.descricao}
          >
            Próximo Passo
          </Button>
          {(!formValues.telefone || !formValues.endereco || !formValues.cnpj || !formValues.creci || !formValues.descricao) && (
            <p className="text-sm text-red-500 mt-2">
              Preencha todos os campos obrigatórios para continuar
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
