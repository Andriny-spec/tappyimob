"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
  RiLoader4Line,
  RiHome4Line,
  RiMapPinLine,
  RiSettings4Line,
  RiMoneyDollarCircleLine,
  RiImageLine,
  RiUserLine,
  RiFileTextLine,
  RiSearchLine,
  RiAddLine,
  RiCloseLine,
  RiPlayCircleLine,
  RiCameraLine,
  RiLayoutLine,
  RiDeleteBinLine,
  RiStarLine,
  RiStarFill,
  RiDragMoveLine,
  RiBuildingLine,
  RiExchangeLine,
  RiEditLine,
  RiPencilLine,
  RiGlobalLine,
  RiEyeOffLine,
} from "react-icons/ri";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

// Steps do wizard
const steps = [
  { id: 1, title: "Localização", icon: RiMapPinLine },
  { id: 2, title: "Tipo", icon: RiHome4Line },
  { id: 3, title: "Características", icon: RiSettings4Line },
  { id: 4, title: "Valores", icon: RiMoneyDollarCircleLine },
  { id: 5, title: "Mídia", icon: RiImageLine },
  { id: 6, title: "Proprietário", icon: RiUserLine },
  { id: 7, title: "Documentos", icon: RiFileTextLine },
  { id: 8, title: "Publicação", icon: RiGlobalLine },
];

// Subtipos por tipo
const subTypesByType: Record<string, { value: string; label: string }[]> = {
  APARTAMENTO: [
    { value: "APARTAMENTO_PADRAO", label: "Padrão" },
    { value: "APARTAMENTO_COBERTURA", label: "Cobertura" },
    { value: "APARTAMENTO_DUPLEX", label: "Duplex" },
    { value: "APARTAMENTO_GARDEN", label: "Garden" },
    { value: "APARTAMENTO_FLAT", label: "Flat" },
    { value: "APARTAMENTO_STUDIO", label: "Studio" },
    { value: "APARTAMENTO_LOFT", label: "Loft" },
  ],
  CASA: [
    { value: "CASA_TERREA", label: "Térrea" },
    { value: "CASA_SOBRADO", label: "Sobrado" },
    { value: "CASA_DUPLEX", label: "Duplex" },
    { value: "CASA_TRIPLEX", label: "Triplex" },
    { value: "CASA_VILLAGIO", label: "Villagio" },
    { value: "CASA_GEMINADA", label: "Geminada" },
  ],
  TERRENO: [
    { value: "TERRENO_PADRAO", label: "Padrão" },
    { value: "TERRENO_ESQUINA", label: "Esquina" },
    { value: "TERRENO_DECLIVE", label: "Declive" },
    { value: "TERRENO_ACLIVE", label: "Aclive" },
    { value: "TERRENO_PLANO", label: "Plano" },
  ],
  COMERCIAL: [
    { value: "SALA_COMERCIAL", label: "Sala Comercial" },
    { value: "LOJA", label: "Loja" },
    { value: "GALPAO", label: "Galpão" },
    { value: "PREDIO_COMERCIAL", label: "Prédio Comercial" },
    { value: "PONTO_COMERCIAL", label: "Ponto Comercial" },
  ],
};

// Amenidades - inicializado vazio, opções vêm da API (que respeita hidden)
const defaultAmenitiesOptions = {
  common: [] as string[],
  private: [] as string[],
  extras: [] as string[],
  special: [] as string[],
  propertyCategories: [] as string[],
};

// Gerar código de referência
const generateCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `IMB-${timestamp.slice(-4)}${random}`;
};

function NovoImovelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id"); // Se tiver ID, é modo de edição
  const isEditMode = !!editId;
  
  // Estado para validação de duplicatas (Step 0)
  const [showDuplicateCheck, setShowDuplicateCheck] = useState(!isEditMode);
  const [duplicateCheckData, setDuplicateCheckData] = useState({
    condominiumId: "",
    towerName: "",
    unitNumber: "",
    floor: "",
    address: "",
    number: "",
    zipCode: "",
    neighborhood: "",
    city: "",
    state: "",
    complement: ""
  });
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateResults, setDuplicateResults] = useState<any[]>([]);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [hasProbableDuplicate, setHasProbableDuplicate] = useState(false);
  const [addressLockedFromCheck, setAddressLockedFromCheck] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const formDataRef = useRef<any>(null);
  const cepSkipRef = useRef(false);
  const [isLoadingProperty, setIsLoadingProperty] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingExchange, setIsGeneratingExchange] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [condominiums, setCondominiums] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  
  const [lastCode, setLastCode] = useState("");

  // Estado para opções de amenidades (editáveis)
  const [amenitiesOptions, setAmenitiesOptions] = useState(defaultAmenitiesOptions);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<"common" | "private" | "extras" | "special" | null>(null);
  const [newAmenityInput, setNewAmenityInput] = useState("");

  // Carregar condomínios e corretores
  useEffect(() => {
    const fetchCondominiums = async () => {
      try {
        const res = await fetch("/api/condominiums");
        if (res.ok) {
          const data = await res.json();
          setCondominiums(data.condominiums || []);
        }
      } catch (error) {
        console.error("Erro ao carregar condomínios:", error);
      }
    };
    
    const fetchBrokers = async () => {
      try {
        const res = await fetch("/api/brokers");
        if (res.ok) {
          const data = await res.json();
          setBrokers(data.brokers || []);
        }
      } catch (error) {
        console.error("Erro ao carregar corretores:", error);
      }
    };
    
    const fetchPropertyOptions = async () => {
      try {
        const res = await fetch("/api/admin/properties/options");
        if (res.ok) {
          const data = await res.json();
          // Substituir opções (não mergear) - a API já retorna tudo filtrado por hidden
          setAmenitiesOptions(prev => ({
            ...prev,
            extras: data.features?.length ? data.features : prev.extras,
            private: data.private?.length ? data.private : prev.private,
            propertyCategories: data.propertyCategories?.length ? data.propertyCategories : prev.propertyCategories,
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar opções:", error);
      }
    };
    
    const fetchAgencies = async () => {
      try {
        const res = await fetch("/api/admin/real-estate-agencies?limit=500");
        if (res.ok) {
          const data = await res.json();
          setAgencies(data.agencies || []);
        }
      } catch (error) {
        console.error("Erro ao carregar imobiliárias:", error);
      }
    };
    
    const fetchLastCode = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = meRes.ok ? await meRes.json() : null;
        const userId = meData?.user?.id;
        const url = userId
          ? `/api/properties?sortBy=createdAt&sortOrder=desc&limit=1&ownerId=${userId}&showAll=true`
          : "/api/properties?sortBy=createdAt&sortOrder=desc&limit=1";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.properties?.[0]?.code) {
            setLastCode(data.properties[0].code);
          }
        }
      } catch (e) { /* ignore */ }
    };

    fetchCondominiums();
    fetchBrokers();
    fetchAgencies();
    fetchPropertyOptions();
    fetchLastCode();
  }, []);

  // Função para verificar duplicatas
  const checkDuplicates = async () => {
    setIsCheckingDuplicate(true);
    setDuplicateResults([]);
    setDuplicateMessage("");
    setHasProbableDuplicate(false);
    
    try {
      const res = await fetch("/api/admin/properties/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...duplicateCheckData,
          condoType: condominiums.find((c: any) => c.id === duplicateCheckData.condominiumId)?.condoType || null
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setDuplicateResults(data.properties || []);
        setDuplicateMessage(data.message || "");
        setHasProbableDuplicate(data.hasProbableDuplicate || false);
      }
    } catch (error) {
      console.error("Erro ao verificar duplicatas:", error);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Prosseguir para cadastro após validação
  const proceedToRegister = () => {
    // Preencher dados iniciais do formulário com os dados da validação
    setFormData(prev => ({
      ...prev,
      condominiumId: duplicateCheckData.condominiumId,
      towerName: duplicateCheckData.towerName,
      unitNumber: duplicateCheckData.unitNumber,
      floor: duplicateCheckData.floor,
      address: duplicateCheckData.address,
      number: duplicateCheckData.number,
      zipCode: duplicateCheckData.zipCode,
      neighborhood: duplicateCheckData.neighborhood,
      city: duplicateCheckData.city,
      state: duplicateCheckData.state,
      complement: duplicateCheckData.complement
    }));
    // Travar endereço se veio preenchido da verificação
    const hasAddressData = duplicateCheckData.address || duplicateCheckData.condominiumId || duplicateCheckData.neighborhood;
    if (hasAddressData) {
      setAddressLockedFromCheck(true);
    }
    setShowDuplicateCheck(false);
  };

  // Cadastrar com novo proprietário (finaliza anúncio anterior e cria novo agrupado)
  const handleNewOwnerRegistration = async (existingProperty: any) => {
    try {
      // 1. Finalizar o anúncio anterior se ainda estiver ativo
      if (existingProperty.status === "DISPONIVEL" || existingProperty.saleStatus === "DISPONIVEL" || existingProperty.rentalStatus === "DISPONIVEL") {
        await fetch(`/api/properties/${existingProperty.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "INDISPONIVEL",
            saleStatus: "INDISPONIVEL",
            rentalStatus: "INDISPONIVEL",
            offMarket: true,
            changelog: [{
              field: "Status alterado automaticamente",
              oldValue: existingProperty.status,
              newValue: "INDISPONIVEL",
              changedAt: new Date().toISOString(),
              userName: "Sistema - Novo Proprietário"
            }]
          })
        });
      }

      // 2. Preencher dados do formulário com os dados do imóvel existente (exceto proprietário)
      setFormData(prev => ({
        ...prev,
        // Dados de localização
        condominiumId: existingProperty.condominiumId || "",
        towerName: existingProperty.towerName || "",
        unitNumber: existingProperty.unitNumber || "",
        floor: existingProperty.floor || "",
        address: existingProperty.address || "",
        number: existingProperty.number || "",
        zipCode: existingProperty.zipCode || "",
        neighborhood: existingProperty.neighborhood || "",
        city: existingProperty.city || "",
        state: existingProperty.state || "",
        // Dados do imóvel
        type: existingProperty.type || "APARTAMENTO",
        subType: existingProperty.subType || "",
        category: existingProperty.category || "VENDA",
        bedrooms: existingProperty.bedrooms || 0,
        suites: existingProperty.suites || 0,
        bathrooms: existingProperty.bathrooms || 0,
        parkingSpaces: existingProperty.parkingSpaces || 0,
        area: existingProperty.area || 0,
        totalArea: existingProperty.totalArea || 0,
        // Gerar novo código
        code: generateCode(),
        // Limpar proprietário para ser preenchido
        ownerId: "",
      }));

      // 3. Prosseguir para o cadastro
      setShowDuplicateCheck(false);
      
      // Mostrar mensagem de sucesso
      alert(`Anúncio anterior (${existingProperty.code}) foi finalizado. Preencha os dados do novo proprietário.`);
    } catch (error) {
      console.error("Erro ao processar novo proprietário:", error);
      alert("Erro ao processar. Tente novamente.");
    }
  };

  // Refs para inputs de arquivo
  const matriculaInputRef = React.useRef<HTMLInputElement>(null);
  const iptuInputRef = React.useRef<HTMLInputElement>(null);
  const certidaoInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    code: generateCode(), // Código de referência
    propertyClass: "RESIDENCIAL",
    type: "APARTAMENTO",
    subType: "",
    category: "VENDA",
    status: "DISPONIVEL",
    saleStatus: "ATIVO",
    rentalStatus: "ATIVO",
    condition: "USADO",
    expectedCompletionDate: "", // Data prevista de conclusão para imóveis em construção
    zipCode: "", address: "", number: "", complement: "",
    neighborhood: "", city: "", state: "",
    condominiumId: "", towerName: "", unitNumber: "",
    addressVisibility: "COMPLETO",
    area: "", totalArea: "", usefulArea: "", propertyAge: "",
    bedrooms: 0, suites: 0, bathrooms: 0, parkingSpaces: 0,
    floor: "", totalFloors: "",
    amenities: [] as string[], features: [] as string[], extras: [] as string[], specialFeatures: [] as string[], propertyCategories: [] as string[],
    price: "", rentPrice: "", condoFee: "", condoFeeExempt: false,
    iptu: "", iptuPeriod: "ANUAL",
    foro: "", foroExempt: false, // Imposto regional anual
    acceptsFinancing: true, acceptsFGTS: false, acceptsDirectPayment: false, directPaymentMonths: "", acceptsExchange: null as boolean | null, exchangeNotInformed: true, isNegotiable: true,
    exchangeType: "", exchangeTypes: [] as string[], exchangeLocations: [] as string[], exchangeMinValue: "", exchangeMaxValue: "", exchangeValue: "",
    // Características especiais
    isFurnished: null as boolean | null, hasElevator: false, hasGroundFloorSuite: false, hasFreeView: false,
    // Placa e Situação
    hasPlate: false, isOccupied: false, hasProfessionalPhotos: false,
    // Publicação
    showOnWebsite: true, websitePublishMode: null as string | null, isOffMarket: false, activePortals: [] as string[], websiteCategories: [] as string[],
    hasFinancingBalance: null as boolean | null, financingBalance: "", financingBank: "", // null = não informado
    hasIrregularDocs: false, irregularDocsNotes: "", // Documentação irregular
    isFeatured: false, isExclusive: false, isSuperFeatured: false,
    highlights: [] as string[], // Diferenciais do imóvel
    title: "", marketplaceTitle: "", description: "",
    condoDescription: "", exchangeDescription: "",
    brokerNotes: "", // Notas internas do corretor
    videoYoutube: "", virtualTour: "",
    images: [] as string[],
    thumbnail: "",
    hasWatermark: false,
    propertyOwnerId: null as string | null, // ID do PropertyOwner vinculado
    ownerType: "PROPRIETARIO", // PROPRIETARIO, GESTOR_EXCLUSIVIDADE ou AMBOS
    ownerName: "", ownerNickname: "", // Apelido/1º nome para mensagens em massa
    ownerPhones: [{ name: "", phone: "" }] as Array<{ name: string; phone: string }>, ownerEmail: "", ownerEmails: [""] as string[], ownerProfiles: [] as string[], // Pode ser CONSTRUTOR, INVESTIDOR ou ambos
    ownerCpf: "", ownerRg: "", ownerBirthDate: "", // Documentos do proprietário
    ownerAddress: "", ownerAddressNumber: "", ownerAddressComplement: "", // Endereço residencial
    ownerNeighborhood: "", ownerCity: "", ownerState: "", ownerZipCode: "",
    exclusivityManagerId: null as string | null, exclusivityManagerName: "", exclusivityManagerType: "" as string, // "CORRETOR" ou "IMOBILIARIA"
    sellerType: "", sellerCreci: "", // Classificação do vendedor
    constructorName: "", constructorCnpj: "", // Dados da construtora
    investorType: "", // Tipo de investidor
    matriculaNumber: "", iptuNumber: "", certidaoSPU: "",
    // Campos específicos de LOCAÇÃO
    acceptsPets: null as boolean | null, // Aceita pets (null = não informado)
    rentalWarranties: [] as string[], // Garantias locatícias aceitas
    // Campos específicos de TERRENO
    landTopography: "", // PLANO, ACLIVE, DECLIVE
    landFrontWidth: "", // Largura da frente em metros
    landDepth: "", // Profundidade em metros
    hasApprovedProject: null as boolean | null, // Projeto aprovado
    isGroundFloor: null as boolean | null, // Casa térrea (para desdobramento de aptos)
    isCornerHouse: null as boolean | null, // Casa de esquina
    hasNonBuildableArea: null as boolean | null, // Área não edificante
    hasWall: null as boolean | null, // Possui muro
    // Anexos de documentos
    matriculaFile: null as File | null,
    matriculaFileName: "",
    iptuFile: null as File | null,
    iptuFileName: "",
    certidaoFile: null as File | null,
    certidaoFileName: "",
  });

  // Manter ref sincronizado com formData para evitar stale closure no handleSubmit
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  // Carregar dados do imóvel se estiver em modo de edição
  useEffect(() => {
    if (!editId) return;
    
    const fetchProperty = async () => {
      // Função para converter texto com marcadores para HTML formatado
      const formatDescriptionToHtml = (text: string): string => {
        if (!text) return "";
        // Se já for HTML, retornar como está
        if (text.includes("<p>") || text.includes("<br>") || text.includes("<ul>")) {
          return text;
        }
        
        // Converter marcadores (•, -) em lista HTML
        const hasBullets = /[•\-]\s/.test(text);
        if (hasBullets) {
          const parts = text.split(/\s*[•]\s*/);
          const html = parts
            .filter(Boolean)
            .map(part => {
              // Remover "- " no início que ficaria duplicado com o bullet
              const cleaned = part.replace(/^[\-]\s*/, "").trim();
              return cleaned ? `<p>• ${cleaned}</p>` : "";
            })
            .filter(Boolean)
            .join("");
          return html || `<p>${text}</p>`;
        }
        
        // Sem marcadores, quebrar por frases longas
        const html = text
          .split(/(?<=[.!?])\s+(?=[A-Z])/)
          .filter(Boolean)
          .map(part => `<p>${part.trim()}</p>`)
          .join("");
        
        return html || `<p>${text}</p>`;
      };
      
      setIsLoadingProperty(true);
      try {
        const res = await fetch(`/api/properties/${editId}`);
        if (!res.ok) throw new Error("Imóvel não encontrado");
        
        const data = await res.json();
        const property = data.property;
        
        if (property) {
          // Extrair primeiro documento (PropertyDocument)
          const doc = Array.isArray(property.documents) ? property.documents[0] : property.documents;
          
          // Converter valores monetários para formato de máscara (R$ x.xxx,xx)
          const formatToMask = (value: number | null | undefined) => {
            if (!value) return "";
            return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
          };
          
          // Pegar dados do proprietário do propertyOwner se não tiver nos campos diretos
          const po = property.propertyOwner;
          const ownerName = property.ownerName || po?.name || "";
          const ownerEmail = property.ownerEmail || po?.email || "";
          const ownerCpf = property.ownerCpf || po?.cpf || "";
          // Converter telefones antigos (string) para novo formato (objeto)
          const convertPhones = (phones: any[]) => {
            if (!phones?.length) return [{ name: "", phone: "" }];
            return phones.map((p: any) => typeof p === 'string' ? { name: "", phone: p } : p);
          };
          // Prioridade: phoneContacts do PropertyOwner (tem nomes) > ownerPhones > phones flat
          const ownerPhones = po?.phoneContacts?.length
            ? (po.phoneContacts as Array<{ name: string; phone: string }>)
            : property.ownerPhones?.length 
              ? convertPhones(property.ownerPhones)
              : (po?.phones?.length ? convertPhones(po.phones) : [{ name: "", phone: "" }]);
          
          // Pular auto-CEP no load inicial para não sobrescrever endereço
          cepSkipRef.current = true;
          setFormData({
            ...formData,
            code: property.code || formData.code,
            metaDescription: property.metaDescription || "",
            propertyClass: property.propertyClass || "RESIDENCIAL",
            type: property.type || "APARTAMENTO",
            subType: property.subType || "",
            category: property.category || "VENDA",
            status: property.status || "DISPONIVEL",
            saleStatus: (() => {
              // Derivar saleStatus do status real para garantir sincronia
              const s = property.status;
              const saved = property.saleStatus;
              // Se o status principal diverge do saleStatus salvo, priorizar o status real
              if (s === "VENDIDO") return "VENDIDO";
              if (s === "SUSPENSO") return "SUSPENSO";
              if (s === "INDISPONIVEL" || s === "INATIVO") return "INATIVO";
              if (s === "DISPONIVEL" && saved && saved !== "ATIVO" && saved !== "VENDIDO") return "ATIVO";
              return saved || "ATIVO";
            })(),
            rentalStatus: (() => {
              const s = property.status;
              const saved = property.rentalStatus;
              if (s === "ALUGADO") return "ALUGADO";
              if (s === "SUSPENSO") return "SUSPENSO";
              if (s === "INDISPONIVEL" || s === "INATIVO") return "INATIVO";
              if (s === "DISPONIVEL" && saved && saved !== "ATIVO" && saved !== "ALUGADO") return "ATIVO";
              return saved || "ATIVO";
            })(),
            condition: property.condition || "USADO",
            expectedCompletionDate: property.expectedCompletionDate?.split("T")[0] || "",
            zipCode: property.zipCode || "",
            address: property.address || "",
            number: property.number || "",
            complement: property.complement || "",
            neighborhood: property.neighborhood || "",
            city: property.city || "",
            state: property.state || "",
            condominiumId: property.condominiumId || "",
            towerName: property.towerName || "",
            unitNumber: property.unitNumber || "",
            area: property.area?.toString() || "",
            totalArea: property.totalArea?.toString() || "",
            usefulArea: property.usefulArea?.toString() || "",
            propertyAge: property.propertyAge || "",
            bedrooms: property.bedrooms || 0,
            suites: property.suites || 0,
            bathrooms: property.bathrooms || 0,
            parkingSpaces: property.parkingSpaces || 0,
            floor: property.floor?.toString() || "",
            totalFloors: property.totalFloors?.toString() || "",
            amenities: property.amenities || [],
            features: property.features || [],
            extras: property.extras || [],
            specialFeatures: [],
            propertyCategories: [],
            price: formatToMask(property.price),
            rentPrice: formatToMask(property.rentPrice),
            condoFee: formatToMask(property.condoFee),
            condoFeeExempt: property.condoFeeExempt || false,
            iptu: formatToMask(property.iptu),
            iptuPeriod: property.iptuPeriod || "ANUAL",
            foro: formatToMask(property.foro),
            foroExempt: property.foroExempt || false,
            acceptsFinancing: property.acceptsFinancing ?? true,
            acceptsFGTS: property.acceptsFGTS ?? false,
            acceptsDirectPayment: property.acceptsDirectPayment ?? false,
            directPaymentMonths: property.directPaymentMonths?.toString() || "",
            acceptsExchange: property.acceptsExchange ?? null,
            exchangeNotInformed: property.acceptsExchange === null,
            isNegotiable: property.isNegotiable ?? true,
            exchangeType: property.exchangeType || "",
            exchangeMinValue: property.exchangeMinValue?.toString() || "",
            exchangeMaxValue: property.exchangeMaxValue?.toString() || "",
            hasFinancingBalance: property.hasFinancingBalance ?? null,
            financingBalance: property.financingBalance?.toString() || "",
            financingBank: property.financingBank || "",
            hasIrregularDocs: property.hasIrregularDocs || false,
            irregularDocsNotes: property.irregularDocsNotes || "",
            showOnWebsite: property.showOnWebsite !== false,
            websitePublishMode: property.websitePublishMode || null,
            isOffMarket: property.isOffMarket || false,
            activePortals: property.activePortals || [],
            websiteCategories: property.websiteCategories || [],
            isFurnished: property.isFurnished ?? null,
            hasElevator: property.hasElevator || false,
            hasGroundFloorSuite: property.hasGroundFloorSuite || false,
            hasFreeView: property.hasFreeView || false,
            hasPlate: property.hasPlate || false,
            isOccupied: property.isOccupied || false,
            hasProfessionalPhotos: property.hasProfessionalPhotos || false,
            isFeatured: property.isFeatured || false,
            isExclusive: property.isExclusive || false,
            isSuperFeatured: property.isSuperFeatured || false,
            highlights: property.highlights || [],
            title: property.title || "",
            marketplaceTitle: property.marketplaceTitle || "",
            description: formatDescriptionToHtml(property.description || ""),
            condoDescription: property.condoDescription || "",
            exchangeDescription: property.exchangeDescription || "",
            brokerNotes: property.brokerNotes || "",
            videoYoutube: property.videoYoutube || "",
            virtualTour: property.virtualTour || "",
            images: property.images || [],
            thumbnail: property.thumbnail || "",
            hasWatermark: property.hasWatermark || false,
            propertyOwnerId: property.propertyOwnerId || null,
            ownerType: property.isThirdPartyExclusive 
              ? (property.propertyOwnerId ? "AMBOS" : "GESTOR_EXCLUSIVIDADE")
              : "PROPRIETARIO",
            ownerName: po?.name || "",
            ownerNickname: property.ownerNickname || "",
            ownerPhones: ownerPhones,
            ownerEmail: po?.email || "",
            ownerEmails: po?.emails?.length ? po.emails : (po?.email ? [po.email] : [""]),
            ownerProfiles: [],
            ownerCpf: po?.cpf || "",
            ownerRg: po?.rg || "",
            ownerBirthDate: po?.birthDate ? po.birthDate.split("T")[0] : "",
            ownerAddress: po?.residentialAddress || "",
            ownerAddressNumber: po?.residentialNumber || "",
            ownerAddressComplement: po?.residentialComplement || "",
            ownerNeighborhood: po?.residentialNeighborhood || "",
            ownerCity: po?.residentialCity || "",
            ownerState: po?.residentialState || "",
            ownerZipCode: po?.residentialZipCode || "",
            exclusivityManagerId: property.exclusivityManagerId || null,
            exclusivityManagerType: property.exclusivityManagerType || "",
            exclusivityManagerName: "",  // Resolvido abaixo via lookup
            sellerType: property.sellerType || "",
            sellerCreci: property.sellerCreci || "",
            constructorName: property.constructorName || "",
            constructorCnpj: property.constructorCnpj || "",
            investorType: property.investorType || "",
            matriculaNumber: doc?.matriculaNumber || "",
            iptuNumber: doc?.iptuNumber || "",
            certidaoSPU: doc?.certidaoSPU || "",
            // Campos específicos de TERRENO/CASA
            landTopography: property.landTopography || "",
            landFrontWidth: property.landFrontWidth?.toString() || "",
            landDepth: property.landDepth?.toString() || "",
            hasApprovedProject: property.hasApprovedProject ?? null,
            isGroundFloor: property.isGroundFloor ?? null,
            isCornerHouse: property.isCornerHouse ?? null,
            hasNonBuildableArea: property.hasNonBuildableArea ?? null,
            hasWall: property.hasWall ?? null,
            // Campos de permuta
            exchangeTypes: property.exchangeTypes || [],
            exchangeLocations: property.exchangeLocations || [],
            // Visibilidade do endereço
            addressVisibility: property.addressVisibility || "COMPLETO",
            // Campos específicos de LOCAÇÃO
            acceptsPets: property.acceptsPets ?? null,
            rentalWarranties: property.rentalWarranties || [],
            matriculaFile: null,
            matriculaFileName: doc?.matriculaUrl ? doc.matriculaUrl.split("/").pop() || "Arquivo anexado" : "",
            iptuFile: null,
            iptuFileName: doc?.iptuUrl ? doc.iptuUrl.split("/").pop() || "Arquivo anexado" : "",
            certidaoFile: null,
            certidaoFileName: doc?.certidaoSPUUrl ? doc.certidaoSPUUrl.split("/").pop() || "Arquivo anexado" : "",
          });

          // Resolver nome do gestor de exclusividade via lookup
          if (property.exclusivityManagerId) {
            try {
              if (property.exclusivityManagerType === "IMOBILIARIA") {
                const agRes = await fetch("/api/admin/real-estate-agencies?limit=500");
                if (agRes.ok) {
                  const agData = await agRes.json();
                  const agency = (agData.agencies || []).find((a: any) => a.id === property.exclusivityManagerId);
                  if (agency) {
                    setFormData((prev: any) => ({ ...prev, exclusivityManagerName: agency.tradeName || agency.companyName }));
                  }
                }
              } else {
                const brRes = await fetch("/api/brokers");
                if (brRes.ok) {
                  const brData = await brRes.json();
                  const broker = (brData.brokers || []).find((b: any) => b.id === property.exclusivityManagerId);
                  if (broker) {
                    setFormData((prev: any) => ({ ...prev, exclusivityManagerName: broker.name }));
                  }
                }
              }
            } catch (err) {
              console.error("Erro ao resolver gestor:", err);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar imóvel:", error);
        alert("Erro ao carregar dados do imóvel");
        router.push("/admin/imoveis");
      }
      setIsLoadingProperty(false);
    };
    
    fetchProperty();
  }, [editId]);

  // Garantir que itens selecionados do imóvel apareçam nas opções disponíveis (roda uma vez ao carregar)
  const hasMergedOptions = useRef(false);
  useEffect(() => {
    if (!isEditMode || isLoadingProperty || hasMergedOptions.current) return;
    // Só mesclar quando o formData tem dados carregados do imóvel
    if (formData.features?.length === 0 && formData.extras?.length === 0 && formData.amenities?.length === 0) return;
    hasMergedOptions.current = true;
    setAmenitiesOptions(prev => {
      const mergeUnique = (existing: string[], selected: string[]) => {
        const set = new Set(existing);
        for (const item of selected) { if (item) set.add(item); }
        return Array.from(set);
      };
      return {
        ...prev,
        common: mergeUnique(prev.common, formData.amenities),
        private: mergeUnique(prev.private, formData.features),
        extras: mergeUnique(prev.extras, formData.extras),
        propertyCategories: mergeUnique(prev.propertyCategories, formData.websiteCategories),
      };
    });
  }, [isEditMode, isLoadingProperty, formData.amenities?.length, formData.features?.length, formData.extras?.length]);

  const handleCepSearch = async (cepOverride?: string) => {
    const rawCep = (cepOverride || formData.zipCode).replace(/\D/g, "");
    if (rawCep.length < 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`/api/cep?cep=${rawCep}`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({ ...prev, address: data.logradouro || prev.address, neighborhood: data.bairro || prev.neighborhood, city: data.localidade || prev.city, state: data.uf || prev.state }));
      }
    } catch (e) { console.error(e); }
    setCepLoading(false);
  };

  // Auto-buscar CEP quando digitar 8 dígitos (pula load inicial em edit mode)
  useEffect(() => {
    if (cepSkipRef.current) {
      cepSkipRef.current = false;
      return;
    }
    const digits = formData.zipCode.replace(/\D/g, "");
    if (digits.length === 8) {
      handleCepSearch(digits);
    }
  }, [formData.zipCode]);

  const formatCep = (v: string) => {
    const n = v.replace(/\D/g, "");
    return n.length <= 5 ? n : `${n.slice(0, 5)}-${n.slice(5, 8)}`;
  };

  // Máscara de telefone
  const formatPhone = (v: string, isInternational?: boolean) => {
    if (isInternational) {
      // Internacional: permitir + e números, formato livre
      return v.replace(/[^+\d\s\-()]/g, "").slice(0, 20);
    }
    const n = v.replace(/\D/g, "");
    if (n.length <= 2) return n;
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
  };

  // Máscara de moeda
  const formatCurrency = (v: string) => {
    const n = v.replace(/\D/g, "");
    if (!n) return "";
    const value = parseInt(n) / 100;
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Função para comprimir e converter imagem para WebP
  // Marca d'água é aplicada no servidor via /admin/configuracoes/marca-dagua
  const compressImage = async (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        // Calcular dimensões mantendo proporção
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, ".webp"),
                { type: "image/webp" }
              );
              resolve(compressedFile);
            } else {
              reject(new Error("Falha ao comprimir imagem"));
            }
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => reject(new Error("Falha ao carregar imagem"));
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload de imagens em paralelo com limite de concorrência
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const imageFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setIsUploadingImages(true);
    setUploadProgress({ current: 0, total: imageFiles.length });

    const validUrls: string[] = [];
    let completed = 0;

    // Processar uma imagem
    const processImage = async (file: File, index: number): Promise<string | null> => {
      try {
        const compressedFile = await compressImage(file, 1920, 0.8);
        console.log(`Imagem ${index + 1}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

        const formDataUpload = new FormData();
        formDataUpload.append("file", compressedFile);
        formDataUpload.append("folder", `fotos/imoveis/${formData.code || "sem-codigo"}`);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (res.ok) {
          const data = await res.json();
          return data.url || null;
        } else {
          console.error(`Erro no upload da imagem ${index + 1}:`, await res.text());
          return null;
        }
      } catch (error) {
        console.error("Erro no upload:", error);
        return null;
      } finally {
        completed++;
        setUploadProgress({ current: completed, total: imageFiles.length });
      }
    };

    // Processar em lotes de 4 imagens simultâneas
    const BATCH_SIZE = 4;
    for (let i = 0; i < imageFiles.length; i += BATCH_SIZE) {
      const batch = imageFiles.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map((file, idx) => processImage(file, i + idx))
      );
      validUrls.push(...results.filter((url): url is string => url !== null));
    }

    if (validUrls.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validUrls],
        thumbnail: prev.thumbnail || validUrls[0],
      }));
    }

    setIsUploadingImages(false);
    setUploadProgress({ current: 0, total: 0 });
  };

  // Remover imagem
  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const removedWasThumbnail = formData.images[index] === formData.thumbnail;
    setFormData({
      ...formData,
      images: newImages,
      thumbnail: removedWasThumbnail ? (newImages[0] || "") : formData.thumbnail,
    });
  };

  // Definir thumbnail
  const setThumbnail = (url: string) => {
    setFormData({ ...formData, thumbnail: url });
  };

  // Upload de documento
  const handleDocumentUpload = (type: "matricula" | "iptu" | "certidao", file: File | null) => {
    if (!file) return;
    if (type === "matricula") {
      setFormData({ ...formData, matriculaFile: file, matriculaFileName: file.name });
    } else if (type === "iptu") {
      setFormData({ ...formData, iptuFile: file, iptuFileName: file.name });
    } else {
      setFormData({ ...formData, certidaoFile: file, certidaoFileName: file.name });
    }
  };

  // Gerar descrição com DeepSeek
  const generateDescription = async () => {
    if (!formData.title && !formData.type) {
      alert("Preencha pelo menos o título ou tipo do imóvel");
      return;
    }

    setIsGeneratingDescription(true);
    try {
      // Formatar preço por extenso para evitar confusão da IA com separadores
      const formatPriceForAI = (priceStr: string) => {
        if (!priceStr) return "Não informado";
        // Converter string formatada para número
        let str = priceStr.toString().replace(/[^\d.,]/g, "");
        str = str.replace(/\./g, "").replace(",", ".");
        const numericValue = parseFloat(str);
        if (!numericValue || isNaN(numericValue)) return "Não informado";
        // Formatar como número inteiro sem pontos e adicionar por extenso
        const formatted = numericValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
        if (numericValue >= 1000000) {
          const milhoes = Math.floor(numericValue / 1000000);
          const resto = numericValue % 1000000;
          const milhares = Math.floor(resto / 1000);
          let extenso = `${milhoes} ${milhoes === 1 ? "milhão" : "milhões"}`;
          if (milhares > 0) extenso += ` e ${milhares} mil`;
          return `${formatted} (${extenso} de reais)`;
        } else if (numericValue >= 1000) {
          const milhares = Math.floor(numericValue / 1000);
          return `${formatted} (${milhares} mil reais)`;
        }
        return formatted;
      };

      const prompt = `Gere uma descrição profissional e atraente para um anúncio de imóvel com as seguintes características:
- Tipo: ${formData.type} ${formData.subType ? `(${formData.subType})` : ""}
- Categoria: ${formData.category}
- Título: ${formData.title || "Não informado"}
- Área: ${formData.area ? formData.area + " m²" : "Não informada"}
- Quartos: ${formData.bedrooms}
- Suítes: ${formData.suites}
- Banheiros: ${formData.bathrooms}
- Vagas: ${formData.parkingSpaces}
- Bairro: ${formData.neighborhood || "Não informado"}
- Cidade: ${formData.city || "Não informada"}
- Condição: ${formData.condition}
- Características: ${[...formData.amenities, ...formData.features, ...formData.extras].join(", ") || "Não informadas"}
- Preço: ${formatPriceForAI(formData.price)}

A descrição deve ter entre 150 e 300 palavras, ser persuasiva, destacar os pontos fortes e usar linguagem profissional do mercado imobiliário brasileiro.`;

      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Erro ao gerar descrição");
      
      const data = await response.json();
      setFormData({ ...formData, description: data.description });
    } catch (error) {
      console.error("Erro ao gerar descrição:", error);
      alert("Erro ao gerar descrição. Tente novamente.");
    }
    setIsGeneratingDescription(false);
  };

  // Gerar título com IA
  const generateTitle = async (field: "title" | "marketplaceTitle") => {
    setIsGeneratingTitle(true);
    try {
      const isMarketplace = field === "marketplaceTitle";
      const prompt = isMarketplace
        ? `Gere um título otimizado para portais imobiliários (OLX, ZAP, VivaReal) para um imóvel com as seguintes características:
- Tipo: ${formData.type}
- Quartos: ${formData.bedrooms}
- Bairro: ${formData.neighborhood || "Não informado"}
- Cidade: ${formData.city || "Não informada"}
- Área: ${formData.area ? formData.area + " m²" : ""}
- Preço: ${formData.price || ""}

O título deve ter no máximo 120 caracteres, ser objetivo, incluir palavras-chave relevantes e chamar atenção. Retorne APENAS o título, sem aspas.`
        : `Gere um título atraente para um anúncio de imóvel:
- Tipo: ${formData.type}
- Quartos: ${formData.bedrooms}
- Bairro: ${formData.neighborhood || "Não informado"}
- Cidade: ${formData.city || "Não informada"}

O título deve ter no máximo 100 caracteres e ser profissional. Retorne APENAS o título, sem aspas.`;

      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Erro ao gerar título");
      
      const data = await response.json();
      setFormData({ ...formData, [field]: data.description.trim().replace(/^["']|["']$/g, '') });
    } catch (error) {
      console.error("Erro ao gerar título:", error);
      alert("Erro ao gerar título. Tente novamente.");
    }
    setIsGeneratingTitle(false);
  };

  // Gerar descrição da permuta com IA
  const generateExchangeDescription = async () => {
    setIsGeneratingExchange(true);
    try {
      const prompt = `Gere uma descrição profissional sobre a permuta aceita para um imóvel:
- Tipo do imóvel: ${formData.type}
- Valor do imóvel: ${formData.price || "Não informado"}
- Tipo de permuta aceita: ${formData.exchangeType || "Não especificado"}
- Valor mínimo da permuta: ${formData.exchangeMinValue || "Não informado"}
- Valor máximo da permuta: ${formData.exchangeMaxValue || "Não informado"}

A descrição deve ter entre 50 e 100 palavras, ser clara sobre o que é aceito como permuta, condições e flexibilidade. Use linguagem profissional.`;

      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Erro ao gerar descrição");
      
      const data = await response.json();
      setFormData({ ...formData, exchangeDescription: data.description });
    } catch (error) {
      console.error("Erro ao gerar descrição da permuta:", error);
      alert("Erro ao gerar descrição. Tente novamente.");
    }
    setIsGeneratingExchange(false);
  };

  const toggleItem = (cat: string, item: string) => {
    setFormData((prev: any) => {
      const arr = prev[cat] || [];
      return { ...prev, [cat]: arr.includes(item) ? arr.filter((a: string) => a !== item) : [...arr, item] };
    });
  };

  const addPhone = () => setFormData({ ...formData, ownerPhones: [...formData.ownerPhones, { name: "", phone: "" }] });
  const removePhone = (i: number) => setFormData({ ...formData, ownerPhones: formData.ownerPhones.filter((_: any, idx: number) => idx !== i) || [{ name: "", phone: "" }] });

  const addEmail = () => setFormData({ ...formData, ownerEmails: [...(formData.ownerEmails || [""]), ""] });
  const removeEmail = (i: number) => {
    const filtered = (formData.ownerEmails || [""]).filter((_: any, idx: number) => idx !== i);
    setFormData({ ...formData, ownerEmails: filtered.length > 0 ? filtered : [""] });
  };

  const canGoNext = () => {
    if (currentStep === 1) return formData.type && formData.category;
    if (currentStep === 2) return formData.neighborhood && formData.city;
    if (currentStep === 3) return formData.type === "TERRENO" || formData.area;
    if (currentStep === 4) return formData.price || formData.rentPrice;
    if (currentStep === 5) return formData.title;
    return true;
  };

  // Atalho global Ctrl+S para salvar rascunho
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!isSubmitting) {
          handleSubmit();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleSubmit = async () => {
    // Prevenir double-submit via ref (mais confiável que state)
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    // Ler do ref para garantir dados mais recentes (evita stale closure)
    const formData = formDataRef.current;
    
    try {
      if (!formData) throw new Error("Dados do formulário não carregados");
      
      // Validações básicas antes de enviar
      if (!formData.title || formData.title.trim().length < 3) {
        throw new Error("O título deve ter pelo menos 3 caracteres");
      }
      if (!formData.description || formData.description.trim().length < 10) {
        throw new Error("A descrição deve ter pelo menos 10 caracteres");
      }
      if (!formData.address || formData.address.trim() === "") {
        throw new Error("O endereço é obrigatório");
      }
      if (!formData.neighborhood || formData.neighborhood.trim() === "") {
        throw new Error("O bairro é obrigatório");
      }
      if (!formData.city || formData.city.trim() === "") {
        throw new Error("A cidade é obrigatória");
      }
      if (!formData.state || formData.state.trim() === "") {
        throw new Error("O estado é obrigatório");
      }

      // Parsear valores numéricos com segurança
      const parsePrice = (value: string | number | undefined | null): number => {
        if (!value) return 0;
        const str = value.toString().replace(/\D/g, "");
        return str ? parseInt(str) / 100 : 0;
      };

      const parseNumber = (value: string | number | undefined | null): number => {
        if (!value) return 0;
        let str = value.toString();
        // Tratar formato brasileiro: 2.200,50 -> 2200.50
        // Se tem ponto E vírgula, ponto é milhar e vírgula é decimal
        if (str.includes('.') && str.includes(',')) {
          str = str.replace(/\./g, '').replace(',', '.');
        } 
        // Se só tem ponto e tem mais de 2 dígitos depois, é separador de milhar
        else if (str.includes('.') && !str.includes(',')) {
          const parts = str.split('.');
          // Se última parte tem 3 dígitos, é separador de milhar (ex: 2.200)
          if (parts.length > 1 && parts[parts.length - 1].length === 3) {
            str = str.replace(/\./g, '');
          }
        }
        // Se só tem vírgula, é decimal brasileiro
        else if (str.includes(',')) {
          str = str.replace(',', '.');
        }
        // Remover caracteres não numéricos exceto ponto decimal
        str = str.replace(/[^\d.]/g, '');
        return str ? parseFloat(str) : 0;
      };

      const price = parsePrice(formData.price);
      if (price <= 0 && formData.category !== "LOCACAO") {
        throw new Error("O preço de venda deve ser maior que zero");
      }

      const rentPrice = formData.rentPrice ? parsePrice(formData.rentPrice) : 0;
      // BUG 3: Validar valor de aluguel obrigatório quando LOCACAO ou VENDA_LOCACAO
      if ((formData.category === "LOCACAO" || formData.category === "VENDA_LOCACAO") && rentPrice <= 0) {
        throw new Error("O valor do aluguel é obrigatório para imóveis com locação");
      }

      const area = parseNumber(formData.area);
      if (area < 0) {
        throw new Error("A área não pode ser negativa");
      }

      // Criar/atualizar PropertyOwner se tiver QUALQUER dado do proprietário
      let propertyOwnerId: string | undefined = undefined;
      const phoneContacts = formData.ownerPhones
        ?.filter((p: any) => p.phone?.trim())
        .map((p: any) => ({ name: p.name?.trim() || "", phone: p.phone.trim() })) || [];
      const ownerPhones = phoneContacts.map((p: any) => p.phone);
      
      const ownerEmails = (formData.ownerEmails || []).filter((e: string) => e?.trim());
      
      const hasAnyOwnerData = formData.ownerName?.trim() || ownerPhones.length > 0 || 
        ownerEmails.length > 0 || formData.ownerCpf?.trim() || 
        formData.ownerAddress?.trim() || formData.propertyOwnerId;

      if (hasAnyOwnerData) {
        const ownerPayload = {
          name: formData.ownerName?.trim() || "Proprietário",
          email: ownerEmails[0] || formData.ownerEmail?.trim() || undefined,
          emails: ownerEmails,
          phones: ownerPhones,
          phoneContacts: phoneContacts,
          cpf: formData.ownerCpf?.trim() || undefined,
          rg: formData.ownerRg?.trim() || undefined,
          birthDate: formData.ownerBirthDate || undefined,
          profile: (["PROPRIETARIO", "CONSTRUTOR", "INVESTIDOR", "VENDEDOR"].includes(formData.ownerType) ? formData.ownerType : "PROPRIETARIO") as string,
          residentialAddress: formData.ownerAddress?.trim() || undefined,
          residentialNumber: formData.ownerAddressNumber?.trim() || undefined,
          residentialComplement: formData.ownerAddressComplement?.trim() || undefined,
          residentialNeighborhood: formData.ownerNeighborhood?.trim() || undefined,
          residentialCity: formData.ownerCity?.trim() || undefined,
          residentialState: formData.ownerState?.trim() || undefined,
          residentialZipCode: formData.ownerZipCode?.trim() || undefined,
        };

        try {
          const existingOwnerId = formData.propertyOwnerId;
          if (existingOwnerId) {
            // Atualizar proprietário existente via PUT
            const ownerRes = await fetch(`/api/admin/property-owners/${existingOwnerId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(ownerPayload),
            });
            if (ownerRes.ok) {
              propertyOwnerId = existingOwnerId;
            }
          } else {
            // Criar/upsert proprietário via POST (API faz upsert por telefone/CPF)
            const ownerRes = await fetch("/api/admin/property-owners", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(ownerPayload),
            });
            if (ownerRes.ok) {
              const ownerData = await ownerRes.json();
              propertyOwnerId = ownerData.id;
            }
          }
        } catch (err) {
          console.error("Erro ao salvar proprietário:", err);
        }
      }

      // Preparar dados para API
      const payload: Record<string, any> = {
        code: formData.code?.trim().toUpperCase() || undefined,
        title: formData.title.trim(),
        marketplaceTitle: formData.marketplaceTitle?.trim() || undefined,
        metaDescription: formData.metaDescription?.trim() || null,
        description: formData.description.trim(),
        condoDescription: formData.condoDescription?.trim() || undefined,
        exchangeDescription: formData.exchangeDescription?.trim() || null,
        brokerNotes: formData.brokerNotes?.trim() ? formData.brokerNotes.trim() : null,
        type: formData.type || "APARTAMENTO",
        subType: formData.subType || null,
        propertyClass: formData.propertyClass || "RESIDENCIAL",
        category: formData.category || "VENDA",
        status: formData.status || "DISPONIVEL",
        saleStatus: formData.saleStatus || "ATIVO",
        rentalStatus: formData.rentalStatus || "ATIVO",
        condition: formData.condition || "USADO",
        expectedCompletionDate: formData.expectedCompletionDate ? new Date(formData.expectedCompletionDate) : undefined,
        price: price,
        rentPrice: rentPrice > 0 ? rentPrice : undefined,
        condoFee: formData.condoFee ? parsePrice(formData.condoFee) : undefined,
        condoFeeExempt: Boolean(formData.condoFeeExempt),
        iptu: formData.iptu ? parsePrice(formData.iptu) : undefined,
        iptuPeriod: formData.iptuPeriod || "ANUAL",
        foro: formData.foro ? parsePrice(formData.foro) : undefined,
        foroExempt: Boolean(formData.foroExempt),
        isNegotiable: formData.isNegotiable !== false,
        area: area,
        totalArea: formData.totalArea ? parseNumber(formData.totalArea) : undefined,
        usefulArea: formData.usefulArea ? parseNumber(formData.usefulArea) : undefined,
        propertyAge: formData.propertyAge || undefined,
        bedrooms: Number(formData.bedrooms) || 0,
        suites: Number(formData.suites) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        parkingSpaces: Number(formData.parkingSpaces) || 0,
        floor: formData.floor ? parseInt(formData.floor) : undefined,
        totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : undefined,
        address: formData.address.trim(),
        number: formData.number?.trim() || null,
        complement: formData.complement?.trim() || null,
        neighborhood: formData.neighborhood.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode?.replace(/\D/g, "") || undefined,
        addressVisibility: formData.addressVisibility || "COMPLETO",
        condominiumId: formData.condominiumId || null,
        towerName: formData.towerName?.trim() || null,
        unitNumber: formData.unitNumber?.trim() || null,
        thumbnail: formData.thumbnail || undefined,
        images: Array.isArray(formData.images) ? formData.images.filter(Boolean) : [],
        hasWatermark: Boolean(formData.hasWatermark),
        videoYoutube: formData.videoYoutube?.trim() || undefined,
        virtualTour: formData.virtualTour?.trim() || undefined,
        amenities: Array.isArray(formData.amenities) ? formData.amenities.filter(Boolean) : [],
        features: Array.isArray(formData.features) ? formData.features.filter(Boolean) : [],
        extras: [
          ...(Array.isArray(formData.extras) ? formData.extras : []),
          ...(Array.isArray(formData.specialFeatures) ? formData.specialFeatures : []),
        ].filter(Boolean),
        highlights: Array.isArray(formData.highlights) ? formData.highlights.filter(Boolean) : [],
        websiteCategories: [...new Set([
          ...(Array.isArray(formData.websiteCategories) ? formData.websiteCategories : []),
          ...(Array.isArray(formData.propertyCategories) ? formData.propertyCategories : []),
        ].filter(Boolean))],
        isFeatured: Boolean(formData.isFeatured),
        isExclusive: Boolean(formData.isExclusive),
        isSuperFeatured: Boolean(formData.isSuperFeatured),
        acceptsExchange: formData.acceptsExchange === true,
        exchangeType: formData.exchangeType || undefined,
        exchangeTypes: formData.exchangeTypes || [],
        exchangeLocations: formData.exchangeLocations || [],
        exchangeMinValue: formData.exchangeMinValue ? parseNumber(formData.exchangeMinValue) : undefined,
        exchangeMaxValue: formData.exchangeMaxValue ? parseNumber(formData.exchangeMaxValue) : undefined,
        acceptsFinancing: formData.acceptsFinancing === true,
        acceptsFGTS: formData.acceptsFGTS === true,
        acceptsDirectPayment: formData.acceptsDirectPayment === true,
        directPaymentMonths: formData.directPaymentMonths ? parseInt(formData.directPaymentMonths) : undefined,
        // Placa e Situação
        isFurnished: formData.isFurnished === true ? true : formData.isFurnished === false ? false : false,
        hasElevator: Boolean(formData.hasElevator),
        hasGroundFloorSuite: Boolean(formData.hasGroundFloorSuite),
        hasFreeView: Boolean(formData.hasFreeView),
        hasPlate: Boolean(formData.hasPlate),
        isOccupied: Boolean(formData.isOccupied),
        hasProfessionalPhotos: Boolean(formData.hasProfessionalPhotos),
        // Publicação
        showOnWebsite: formData.showOnWebsite !== false,
        websitePublishMode: formData.websitePublishMode || null,
        isOffMarket: Boolean(formData.isOffMarket),
        activePortals: formData.activePortals || [],
        exclusivityManagerId: formData.exclusivityManagerId || undefined,
        exclusivityManagerType: formData.exclusivityManagerType || undefined,
        ownerNickname: formData.ownerNickname?.trim() || null,
        isThirdPartyExclusive: formData.ownerType === "GESTOR_EXCLUSIVIDADE" || formData.ownerType === "AMBOS",
        // Campos específicos de TERRENO
        landTopography: formData.landTopography || undefined,
        landFrontWidth: formData.landFrontWidth ? parseNumber(formData.landFrontWidth) : undefined,
        landDepth: formData.landDepth ? parseNumber(formData.landDepth) : undefined,
        hasApprovedProject: formData.hasApprovedProject,
        // Campos específicos de CASA
        isCornerHouse: formData.isCornerHouse,
        hasNonBuildableArea: formData.hasNonBuildableArea,
        hasWall: formData.hasWall,
        isGroundFloor: formData.isGroundFloor,
        // Financiamento
        hasFinancingBalance: formData.hasFinancingBalance,
        financingBalance: formData.financingBalance ? parseNumber(formData.financingBalance) : undefined,
        financingBank: formData.financingBank || undefined,
        // Documentação irregular
        hasIrregularDocs: Boolean(formData.hasIrregularDocs),
        irregularDocsNotes: formData.irregularDocsNotes || undefined,
        // Campos específicos de LOCAÇÃO
        acceptsPets: formData.acceptsPets,
        rentalWarranties: formData.rentalWarranties || [],
        // Documentos (números)
        matriculaNumber: formData.matriculaNumber?.trim() || undefined,
        iptuNumber: formData.iptuNumber?.trim() || undefined,
        certidaoSPU: formData.certidaoSPU?.trim() || undefined,
      };

      // Upload de arquivos de documentos (matrícula, IPTU, certidão SPU)
      const docFiles: Array<{ field: string; file: File | null }> = [
        { field: "matriculaUrl", file: formData.matriculaFile },
        { field: "iptuUrl", file: formData.iptuFile },
        { field: "certidaoSPUUrl", file: formData.certidaoFile },
      ];
      const docUrls: Record<string, string> = {};
      for (const { field, file } of docFiles) {
        if (file) {
          try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("folder", "documents");
            fd.append("skipWatermark", "true");
            const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              docUrls[field] = uploadData.url;
            }
          } catch (err) {
            console.error(`Erro ao fazer upload do documento ${field}:`, err);
          }
        }
      }
      if (Object.keys(docUrls).length > 0) {
        (payload as any)._documentUrls = docUrls;
      }

      // Vincular proprietário se criado/encontrado
      if (propertyOwnerId) {
        payload.propertyOwnerId = propertyOwnerId;
      }

      // Log para debug (remover em produção)
      console.log("Payload sendo enviado:", JSON.stringify(payload, null, 2));

      // Usar PUT se for edição, POST se for criação
      const url = isEditMode ? `/api/properties/${editId}` : "/api/properties";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Tentar parsear resposta
      let responseData;
      const responseText = await response.text();
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Erro ao parsear resposta:", responseText);
        throw new Error("Erro de comunicação com o servidor. Tente novamente.");
      }

      if (!response.ok) {
        // Mostrar detalhes do erro de validação
        if (responseData.issues && Array.isArray(responseData.issues)) {
          const errorMessages = responseData.issues.map((issue: any) => 
            `${issue.path?.join('.') || 'Campo'}: ${issue.message}`
          ).join('\n');
          throw new Error(`Dados inválidos:\n${errorMessages}`);
        }
        throw new Error(responseData.error || `Erro ao ${isEditMode ? "atualizar" : "criar"} imóvel`);
      }

      // Redirecionar: edição volta pra ficha, novo volta pra lista
      if (isEditMode && editId) {
        router.push(`/admin/imoveis/${editId}`);
      } else {
        router.push("/admin/imoveis");
      }
    } catch (error: any) {
      console.error(`Erro ao ${isEditMode ? "atualizar" : "criar"} imóvel:`, error);
      alert(error.message || `Erro ao ${isEditMode ? "atualizar" : "criar"} imóvel. Verifique os dados e tente novamente.`);
    }
    
    isSubmittingRef.current = false;
    setIsSubmitting(false);
  };

  // Loading state para modo de edição
  if (isEditMode && isLoadingProperty) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-[#0A1E3D]" />
      </div>
    );
  }

  // Tela de validação de duplicatas (Step 0)
  if (showDuplicateCheck) {
    const selectedCondo = condominiums.find((c: any) => c.id === duplicateCheckData.condominiumId);
    const towers = selectedCondo?.towers || [];
    
    return (
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/imoveis" className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white">
              Verificar Imóvel
            </h1>
            <p className="text-sm text-neutral-500">
              Antes de cadastrar, verifique se o imóvel já existe no sistema
            </p>
          </div>
        </div>

        {/* Formulário de Verificação */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <RiSearchLine className="w-5 h-5 text-[#0B2545]" />
            <h2 className="text-lg font-semibold">Dados para Verificação</h2>
          </div>
          
          <p className="text-sm text-neutral-500 mb-6">
            Preencha os dados do imóvel para verificar se já existe cadastro. 
            <span className="text-amber-600 font-medium"> Atenção especial às torres em condomínios verticais!</span>
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Condomínio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Condomínio</label>
              <select
                value={duplicateCheckData.condominiumId}
                onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, condominiumId: e.target.value, towerName: "" })}
                className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
              >
                <option value="">Selecione um condomínio (opcional)</option>
                {condominiums.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Torre - Aparece se tiver condomínio selecionado e for VERTICAL ou MISTO */}
            {duplicateCheckData.condominiumId && towers.length > 0 && (selectedCondo?.condoType === "VERTICAL" || selectedCondo?.condoType === "MISTO") && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Torre/Bloco
                  <span className="text-amber-500 ml-1">⚠️ Importante!</span>
                </label>
                <select
                  value={duplicateCheckData.towerName}
                  onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, towerName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-600 rounded-xl focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">Selecione a torre</option>
                  {towers.map((t: any) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
                <p className="text-xs text-amber-600 mt-1">
                  Mesmo condomínio pode ter unidades iguais em torres diferentes
                </p>
              </div>
            )}

            {/* Torre - Campo livre se não tiver torres cadastradas e for VERTICAL ou MISTO */}
            {duplicateCheckData.condominiumId && towers.length === 0 && (selectedCondo?.condoType === "VERTICAL" || selectedCondo?.condoType === "MISTO") && (
              <div>
                <label className="block text-sm font-medium mb-2">Torre/Bloco (opcional)</label>
                <input
                  type="text"
                  value={duplicateCheckData.towerName}
                  onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, towerName: e.target.value })}
                  placeholder="Ex: Torre A, Bloco 1"
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              </div>
            )}

            {/* Unidade - para condomínios VERTICAIS, MISTO e VILLAGIO */}
            {duplicateCheckData.condominiumId && selectedCondo?.condoType !== "HORIZONTAL" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {selectedCondo?.condoType === "VILLAGIO" ? "Unidade / Nº da Casa" : "Unidade/Apartamento"}
                </label>
                <input
                  type="text"
                  value={duplicateCheckData.unitNumber}
                  onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, unitNumber: e.target.value })}
                  placeholder="Ex: 101, 1201"
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              </div>
            )}

            {/* Andar removido da verificação de duplicatas */}

            {/* Campos para condomínios HORIZONTAIS */}
            {duplicateCheckData.condominiumId && selectedCondo?.condoType === "HORIZONTAL" && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">CEP</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={duplicateCheckData.zipCode}
                      onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, zipCode: formatCep(e.target.value) })}
                      placeholder="00000-000"
                      className="w-48 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const cep = duplicateCheckData.zipCode.replace(/\D/g, "");
                        if (cep.length !== 8) return;
                        setCepLoading(true);
                        try {
                          const res = await fetch(`/api/cep?cep=${cep}`);
                          const data = await res.json();
                          if (!data.erro) {
                            setDuplicateCheckData(prev => ({
                              ...prev,
                              address: data.logradouro || prev.address,
                              neighborhood: data.bairro || prev.neighborhood,
                              city: data.localidade || prev.city,
                              state: data.uf || prev.state
                            }));
                          }
                        } catch (error) {
                          console.error("Erro ao buscar CEP:", error);
                        } finally {
                          setCepLoading(false);
                        }
                      }}
                      disabled={cepLoading}
                      className="px-4 py-2.5 bg-[#0B2545] text-white rounded-xl hover:bg-[#0B2545]/90 disabled:opacity-50"
                    >
                      {cepLoading ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiSearchLine className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Logradouro (Rua/Alameda)</label>
                  <input
                    type="text"
                    value={duplicateCheckData.address}
                    onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, address: e.target.value })}
                    placeholder="Ex: Alameda das Flores"
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Número</label>
                  <input
                    type="text"
                    value={duplicateCheckData.number}
                    onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, number: e.target.value })}
                    placeholder="Ex: 33"
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quadra</label>
                  <input
                    type="text"
                    value={duplicateCheckData.complement}
                    onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, complement: e.target.value })}
                    placeholder="Ex: Quadra A"
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lote</label>
                  <input
                    type="text"
                    value={duplicateCheckData.unitNumber}
                    onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, unitNumber: e.target.value })}
                    placeholder="Ex: Lote 15"
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
              </>
            )}

            {/* Divisor */}
            {!duplicateCheckData.condominiumId && (
              <div className="md:col-span-2 text-center text-sm text-neutral-400 py-2">
                — ou busque por endereço —
              </div>
            )}

            {/* Endereço */}
            {!duplicateCheckData.condominiumId && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">CEP</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={duplicateCheckData.zipCode}
                      onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, zipCode: formatCep(e.target.value) })}
                      placeholder="00000-000"
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const cep = duplicateCheckData.zipCode.replace(/\D/g, "");
                        if (cep.length !== 8) return;
                        setCepLoading(true);
                        try {
                          const res = await fetch(`/api/cep?cep=${cep}`);
                          const data = await res.json();
                          if (!data.erro) {
                            setDuplicateCheckData(prev => ({
                              ...prev,
                              address: data.logradouro || "",
                              neighborhood: data.bairro || "",
                              city: data.localidade || "",
                              state: data.uf || ""
                            }));
                          }
                        } catch (error) {
                          console.error("Erro ao buscar CEP:", error);
                        } finally {
                          setCepLoading(false);
                        }
                      }}
                      disabled={cepLoading}
                      className="px-4 py-2.5 bg-[#0B2545] text-white rounded-xl hover:bg-[#0B2545]/90 disabled:opacity-50"
                    >
                      {cepLoading ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiSearchLine className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estado</label>
                  <input
                    type="text"
                    value={duplicateCheckData.state}
                    onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, state: e.target.value })}
                    placeholder="SP"
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bairro *</label>
                  <input
                    type="text"
                    value={duplicateCheckData.neighborhood}
                    onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, neighborhood: e.target.value })}
                    placeholder="Bairro"
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Endereço</label>
                  <input
                    type="text"
                    value={duplicateCheckData.address}
                    onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, address: e.target.value })}
                    placeholder="Rua, Avenida..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Número</label>
                  <input
                    type="text"
                    value={duplicateCheckData.number}
                    onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, number: e.target.value })}
                    placeholder="123"
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Complemento</label>
                  <input
                    type="text"
                    value={duplicateCheckData.complement}
                    onChange={(e) => setDuplicateCheckData({ ...duplicateCheckData, complement: e.target.value })}
                    placeholder="Apto, Bloco"
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
              </>
            )}
          </div>

          {/* Botão de Verificar */}
          <div className="flex gap-3">
            <button
              onClick={checkDuplicates}
              disabled={isCheckingDuplicate || (!duplicateCheckData.condominiumId && !duplicateCheckData.address && !duplicateCheckData.neighborhood && !duplicateCheckData.number)}
              className="flex-1 px-6 py-3 bg-[#0B2545] text-white rounded-xl font-medium hover:bg-[#0B2545]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCheckingDuplicate ? (
                <>
                  <RiLoader4Line className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RiSearchLine className="w-5 h-5" />
                  Verificar Duplicatas
                </>
              )}
            </button>
            <button
              onClick={() => setShowDuplicateCheck(false)}
              className="px-6 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              Pular Verificação
            </button>
          </div>
        </div>

        {/* Resultados da Verificação */}
        {duplicateMessage && (
          <div className={`rounded-2xl border p-6 mb-6 ${
            hasProbableDuplicate 
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
              : duplicateResults.length > 0
                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          }`}>
            <div className="flex items-center gap-2 mb-4">
              {hasProbableDuplicate ? (
                <span className="text-2xl">🚨</span>
              ) : duplicateResults.length > 0 ? (
                <span className="text-2xl">⚠️</span>
              ) : (
                <span className="text-2xl">✅</span>
              )}
              <h3 className={`text-lg font-semibold ${
                hasProbableDuplicate 
                  ? "text-red-800 dark:text-red-300" 
                  : duplicateResults.length > 0
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-green-800 dark:text-green-300"
              }`}>
                {duplicateMessage}
              </h3>
            </div>

            {/* Lista de imóveis similares */}
            {duplicateResults.length > 0 && (
              <div className="space-y-3">
                {duplicateResults.map((prop: any) => (
                  <div 
                    key={prop.id} 
                    className={`p-4 rounded-xl border-2 ${
                      prop.similarityScore >= 100
                        ? "bg-red-100 dark:bg-red-900/40 border-red-500 dark:border-red-600 ring-2 ring-red-500/50" 
                        : prop.isProbableDuplicate 
                          ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700" 
                          : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {prop.thumbnail && (
                        <Image
                          src={prop.thumbnail}
                          alt={prop.title}
                          width={80}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-neutral-500">{prop.code}</span>
                          {prop.similarityScore >= 100 ? (
                            <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full animate-pulse">
                              🚨 100% DUPLICATA
                            </span>
                          ) : prop.isProbableDuplicate && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                              Provável Duplicata
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            prop.status === "DISPONIVEL" ? "bg-green-100 text-green-700" :
                            prop.status === "VENDIDO" ? "bg-blue-100 text-blue-700" :
                            "bg-neutral-100 text-neutral-700"
                          }`}>
                            {prop.status}
                          </span>
                        </div>
                        <h4 className="font-medium text-neutral-900 dark:text-white truncate">
                          {prop.title}
                        </h4>
                        <p className="text-sm text-neutral-500">
                          {prop.condominium?.name && `${prop.condominium.name} • `}
                          {prop.towerName && `Torre ${prop.towerName} • `}
                          {prop.unitNumber && `Unidade ${prop.unitNumber} • `}
                          {prop.address}, {prop.number}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                          <span>{prop.bedrooms} quartos</span>
                          <span>{prop.area}m²</span>
                          <span>R$ {prop.price?.toLocaleString("pt-BR")}</span>
                        </div>
                        {prop.matchDetails?.length > 0 && (() => {
                          const hasAddress = prop.matchDetails.some((d: string) => d.startsWith("Endereço:"));
                          const hasNumber = prop.matchDetails.some((d: string) => d.startsWith("Número:"));
                          const isExactMatch = hasAddress && hasNumber;
                          return (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {prop.matchDetails.map((detail: string, i: number) => {
                              const isRedBadge = isExactMatch && (detail.startsWith("Endereço:") || detail.startsWith("Número:"));
                              return (
                              <span key={i} className={`px-2 py-0.5 text-xs rounded ${
                                isRedBadge
                                  ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-semibold ring-1 ring-red-300 dark:ring-red-600"
                                  : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                              }`}>
                                {detail}
                              </span>
                              );
                            })}
                          </div>
                          );
                        })()}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/admin/imoveis/${prop.id}`}
                          className="px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 text-center"
                        >
                          Ver Ficha
                        </Link>
                        <Link
                          href={`/admin/imoveis/novo?id=${prop.id}`}
                          className="px-3 py-1.5 text-xs bg-[#0B2545] text-white rounded-lg hover:bg-[#0B2545]/90 text-center"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleNewOwnerRegistration(prop)}
                          className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-center"
                        >
                          Novo Proprietário
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botão para prosseguir */}
            <div className="mt-6 flex gap-3">
              {!hasProbableDuplicate && (
                <button
                  onClick={proceedToRegister}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <RiAddLine className="w-5 h-5" />
                  {duplicateResults.length > 0 ? "Cadastrar Mesmo Assim" : "Prosseguir com Cadastro"}
                </button>
              )}
              {hasProbableDuplicate && (
                <button
                  onClick={proceedToRegister}
                  className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 flex items-center justify-center gap-2"
                >
                  <RiAddLine className="w-5 h-5" />
                  Cadastrar Mesmo Assim (Não Recomendado)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Botão para cadastrar sem verificar */}
        {!duplicateMessage && (
          <div className="text-center">
            <button
              onClick={proceedToRegister}
              className="text-sm text-neutral-500 hover:text-neutral-700 underline"
            >
              Pular verificação e cadastrar diretamente
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <Link href="/admin/imoveis" className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex-shrink-0">
          <RiArrowLeftLine className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white truncate">
            {isEditMode ? "Editar Imóvel" : "Novo Imóvel"}
          </h1>
          <p className="text-sm text-neutral-500 truncate">
            {isEditMode ? `Editando: ${formData.code}` : "Cadastre um novo imóvel"}
          </p>
        </div>
      </div>

      {/* Steps - Mobile: horizontal scroll, Desktop: flex */}
      <div className="mb-6 lg:mb-8 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
        <div className="flex items-center justify-between min-w-[600px] lg:min-w-0 relative">
          <div className="absolute top-4 lg:top-5 left-0 right-0 h-0.5 bg-neutral-200 dark:bg-neutral-700" />
          <div className="absolute top-4 lg:top-5 left-0 h-0.5 bg-[#0B2545] transition-all" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />
          {steps.map(s => (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <button
                onClick={() => setCurrentStep(s.id)}
                className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-105 ${
                  s.id <= currentStep ? "bg-[#0B2545] text-white" : "bg-neutral-300 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-400 dark:hover:bg-neutral-500"
                } ${s.id === currentStep ? "scale-110 ring-2 ring-[#0B2545]/30" : ""}`}
              >
                {s.id < currentStep ? <RiCheckLine className="w-4 h-4 lg:w-5 lg:h-5" /> : <s.icon className="w-4 h-4 lg:w-5 lg:h-5" />}
              </button>
              <span className={`mt-1.5 text-[10px] lg:text-xs font-medium text-center max-w-[60px] lg:max-w-none cursor-pointer ${s.id === currentStep ? "text-[#0B2545] dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
                onClick={() => setCurrentStep(s.id)}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl lg:rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4 lg:p-6 mb-4 lg:mb-6">
        <h2 className="text-lg font-semibold mb-6">{steps[currentStep - 1].title}</h2>
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {currentStep === 1 && <Step2 formData={formData} setFormData={setFormData} onCepSearch={handleCepSearch} cepLoading={cepLoading} formatCep={formatCep} condominiums={condominiums} addressLocked={addressLockedFromCheck} />}
            {currentStep === 2 && <Step1 formData={formData} setFormData={setFormData} lastCode={lastCode} />}
            {currentStep === 3 && <Step3 formData={formData} setFormData={setFormData} toggleItem={toggleItem} amenitiesOptions={amenitiesOptions} setAmenitiesOptions={setAmenitiesOptions} />}
            {currentStep === 4 && <Step4 formData={formData} setFormData={setFormData} formatCurrency={formatCurrency} />}
            {currentStep === 5 && <Step5 formData={formData} setFormData={setFormData} handleImageUpload={handleImageUpload} removeImage={removeImage} setThumbnail={setThumbnail} generateDescription={generateDescription} isGeneratingDescription={isGeneratingDescription} generateTitle={generateTitle} isGeneratingTitle={isGeneratingTitle} generateExchangeDescription={generateExchangeDescription} isGeneratingExchange={isGeneratingExchange} isUploadingImages={isUploadingImages} uploadProgress={uploadProgress} />}
            {currentStep === 6 && <Step6 formData={formData} setFormData={setFormData} addPhone={addPhone} removePhone={removePhone} addEmail={addEmail} removeEmail={removeEmail} formatPhone={formatPhone} brokers={brokers} agencies={agencies} />}
            {currentStep === 7 && <Step7 formData={formData} setFormData={setFormData} handleDocumentUpload={handleDocumentUpload} matriculaInputRef={matriculaInputRef} iptuInputRef={iptuInputRef} certidaoInputRef={certidaoInputRef} />}
            {currentStep === 8 && <Step8 formData={formData} setFormData={setFormData} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => setCurrentStep(c => c - 1)} disabled={currentStep === 1}
          className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl disabled:opacity-50">
          <RiArrowLeftLine className="w-4 h-4" /> <span className="hidden sm:inline">Anterior</span>
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-xs lg:text-sm text-neutral-500">Passo {currentStep} de 8</span>
          {/* Botão Salvar Rascunho - disponível em qualquer etapa */}
          {currentStep < 8 && (
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700">
              {isSubmitting ? <RiLoader4Line className="w-3 h-3 animate-spin" /> : <RiCheckLine className="w-3 h-3" />}
              <span className="hidden md:inline">Salvar Rascunho</span>
              <span className="md:hidden">Salvar</span>
            </button>
          )}
        </div>
        
        {currentStep < 8 ? (
          <button onClick={() => setCurrentStep(c => c + 1)} disabled={!canGoNext()}
            className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-[#0B2545] text-white rounded-xl disabled:opacity-50">
            <span className="hidden sm:inline">Próximo</span> <RiArrowRightLine className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="flex items-center gap-1.5 lg:gap-2 px-4 lg:px-6 py-2 lg:py-2.5 text-sm bg-green-600 text-white rounded-xl">
            {isSubmitting ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiCheckLine className="w-4 h-4" />} <span className="hidden sm:inline">{isEditMode ? "Salvar" : "Cadastrar"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Wrapper com Suspense para useSearchParams
export default function NovoImovelPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-[#0A1E3D]" />
      </div>
    }>
      <NovoImovelContent />
    </Suspense>
  );
}

// STEP 1 - TIPO
function Step1({ formData, setFormData, lastCode }: any) {
  const types = [
    { value: "APARTAMENTO", label: "Apto", icon: "🏢" },
    { value: "CASA", label: "Casa", icon: "🏠" },
    { value: "TERRENO", label: "Terreno", icon: "📐" },
    { value: "COMERCIAL", label: "Comercial", icon: "🏪" },
  ];
  const categories = ["VENDA", "LOCACAO", "VENDA_LOCACAO"];
  const conditions = ["NOVO", "USADO", "NA_PLANTA", "EM_CONSTRUCAO"];
  const subs = subTypesByType[formData.type] || [];

  return (
    <div className="space-y-4">
      {/* Código de Referência */}
      <div className="p-3 bg-[#0B2545]/5 dark:bg-[#0B2545]/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[10px] text-neutral-500">Código</p>
            <input 
              value={formData.code} 
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="text-sm font-bold text-[#0B2545] dark:text-white bg-transparent border-none outline-none w-full p-0"
              placeholder={lastCode ? `Ex: ${lastCode}` : ""}
            />
          </div>
          <button type="button" onClick={() => setFormData({ ...formData, code: `IMB-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}` })}
            className="text-[10px] text-[#0B2545] hover:underline flex-shrink-0">Gerar novo</button>
        </div>
        {lastCode && (
          <p className="text-[10px] text-neutral-400 mt-1">Último cadastrado: <span className="font-semibold text-[#0B2545]/70 dark:text-blue-400/70">{lastCode}</span></p>
        )}
      </div>

      {/* Classificação */}
      <div>
        <label className="block text-xs font-medium mb-2">Classificação</label>
        <div className="flex gap-2">
          {["RESIDENCIAL", "COMERCIAL"].map(c => (
            <button type="button" key={c} onClick={() => setFormData((prev: any) => ({ ...prev, propertyClass: c }))}
              className={`flex-1 py-2 text-xs rounded-lg border-2 font-medium ${formData.propertyClass === c ? "border-[#0B2545] bg-[#0B2545]/5" : "border-neutral-200 dark:border-neutral-700"}`}>
              {c === "RESIDENCIAL" ? "🏠 Resid." : "🏢 Comerc."}
            </button>
          ))}
        </div>
      </div>

      {/* Tipo */}
      <div>
        <label className="block text-xs font-medium mb-2">Tipo *</label>
        <div className="grid grid-cols-4 gap-2">
          {types.map(t => (
            <button type="button" key={t.value} onClick={() => setFormData((prev: any) => ({ ...prev, type: t.value, subType: "" }))}
              className={`p-2 rounded-lg border-2 text-center ${formData.type === t.value ? "border-[#0B2545] bg-[#0B2545]/5" : "border-neutral-200 dark:border-neutral-700"}`}>
              <span className="text-lg">{t.icon}</span>
              <p className="text-[10px] font-medium">{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Subtipo */}
      {subs.length > 0 && (
        <div>
          <label className="block text-xs font-medium mb-2">Subtipo</label>
          <div className="flex flex-wrap gap-1.5">
            {subs.map(s => (
              <button type="button" key={s.value} onClick={() => setFormData((prev: any) => ({ ...prev, subType: s.value }))}
                className={`px-3 py-1.5 text-xs rounded-lg border ${formData.subType === s.value ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-neutral-200 dark:border-neutral-700"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Finalidade - Permite selecionar múltiplos */}
      <div>
        <label className="block text-xs font-medium mb-2">Finalidade *</label>
        <p className="text-[10px] text-neutral-500 mb-2">Selecione uma ou ambas as opções</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "VENDA", label: "Venda" },
            { value: "LOCACAO", label: "Locação" },
          ].map(opt => {
            const isVenda = formData.category === "VENDA" || formData.category === "VENDA_LOCACAO";
            const isLocacao = formData.category === "LOCACAO" || formData.category === "VENDA_LOCACAO";
            const isSelected = opt.value === "VENDA" ? isVenda : isLocacao;
            
            const handleClick = () => {
              if (opt.value === "VENDA") {
                if (isVenda && isLocacao) {
                  setFormData((prev: any) => ({ ...prev, category: "LOCACAO" }));
                } else if (isVenda) {
                  // Não pode desmarcar se for o único
                } else {
                  setFormData((prev: any) => ({ ...prev, category: isLocacao ? "VENDA_LOCACAO" : "VENDA" }));
                }
              } else {
                if (isVenda && isLocacao) {
                  setFormData((prev: any) => ({ ...prev, category: "VENDA" }));
                } else if (isLocacao) {
                  // Não pode desmarcar se for o único
                } else {
                  setFormData((prev: any) => ({ ...prev, category: isVenda ? "VENDA_LOCACAO" : "LOCACAO" }));
                }
              }
            };
            
            return (
              <button type="button" key={opt.value} onClick={handleClick}
                className={`px-4 py-2 text-xs rounded-lg border transition-all ${isSelected ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
                {isSelected && "✓ "}{opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Condição */}
      <div>
        <label className="block text-xs font-medium mb-2">Condição</label>
        <div className="flex flex-wrap gap-1.5">
          {conditions.map(c => (
            <button type="button" key={c} onClick={() => setFormData((prev: any) => ({ ...prev, condition: c }))}
              className={`px-3 py-1.5 text-xs rounded-lg border ${formData.condition === c ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-neutral-200 dark:border-neutral-700"}`}>
              {c.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Data Prevista de Conclusão - Só aparece para imóveis Em Construção ou Na Planta */}
      {(formData.condition === "EM_CONSTRUCAO" || formData.condition === "NA_PLANTA") && (
        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30">
          <label className="block text-xs font-medium mb-2 text-amber-700 dark:text-amber-400">
            🏗️ Data Prevista de Conclusão
          </label>
          <input
            type="date"
            value={formData.expectedCompletionDate || ""}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, expectedCompletionDate: e.target.value }))}
            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-500/30 rounded-xl text-sm"
          />
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Informe a previsão de entrega do imóvel
          </p>
        </div>
      )}

      {/* Status por Finalidade */}
      {(formData.category === "VENDA" || formData.category === "VENDA_LOCACAO") && (
        <div>
          <label className="block text-xs font-medium mb-2">
            {formData.category === "VENDA_LOCACAO" ? "Status de Venda" : "Status do Imóvel"}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: "ATIVO", label: "Disponível", color: "green" },
              { value: "SUSPENSO", label: "Suspenso", color: "amber" },
              { value: "VENDIDO", label: "Vendido", color: "blue" },
              { value: "INATIVO", label: "Indisponível", color: "neutral" },
            ].map(s => {
              const isSelected = formData.saleStatus === s.value;
              const colorMap: Record<string, string> = {
                green: "border-green-500 bg-green-500 text-white",
                amber: "border-amber-500 bg-amber-500 text-white",
                blue: "border-blue-500 bg-blue-500 text-white",
                neutral: "border-neutral-500 bg-neutral-500 text-white",
              };
              return (
                <button type="button" key={s.value}
                  onClick={() => {
                    const newSaleStatus = s.value;
                    const cat = formData.category;
                    const rental = formData.rentalStatus;
                    let computedStatus = "DISPONIVEL";
                    if (cat === "VENDA") {
                      if (newSaleStatus === "VENDIDO") computedStatus = "VENDIDO";
                      else if (newSaleStatus === "SUSPENSO") computedStatus = "SUSPENSO";
                      else if (newSaleStatus === "INATIVO") computedStatus = "INDISPONIVEL";
                    } else {
                      if (newSaleStatus === "INATIVO" && rental === "INATIVO") computedStatus = "INDISPONIVEL";
                      else if (newSaleStatus === "VENDIDO" && rental === "ALUGADO") computedStatus = "INDISPONIVEL";
                      else if (newSaleStatus === "VENDIDO") computedStatus = "VENDIDO";
                      else if (rental === "ALUGADO") computedStatus = "ALUGADO";
                      else if (newSaleStatus === "SUSPENSO" && rental === "SUSPENSO") computedStatus = "SUSPENSO";
                      else if (newSaleStatus === "ATIVO" || rental === "ATIVO") computedStatus = "DISPONIVEL";
                      else computedStatus = "INDISPONIVEL";
                    }
                    setFormData((prev: any) => ({ ...prev, saleStatus: newSaleStatus, status: computedStatus }));
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    isSelected ? colorMap[s.color] : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                  }`}>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(formData.category === "LOCACAO" || formData.category === "VENDA_LOCACAO") && (
        <div>
          <label className="block text-xs font-medium mb-2">
            {formData.category === "VENDA_LOCACAO" ? "Status de Locação" : "Status do Imóvel"}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: "ATIVO", label: "Disponível", color: "green" },
              { value: "SUSPENSO", label: "Suspenso", color: "amber" },
              { value: "ALUGADO", label: "Alugado", color: "purple" },
              { value: "INATIVO", label: "Indisponível", color: "neutral" },
            ].map(s => {
              const isSelected = formData.rentalStatus === s.value;
              const colorMap: Record<string, string> = {
                green: "border-green-500 bg-green-500 text-white",
                amber: "border-amber-500 bg-amber-500 text-white",
                purple: "border-purple-500 bg-purple-500 text-white",
                neutral: "border-neutral-500 bg-neutral-500 text-white",
              };
              return (
                <button type="button" key={s.value}
                  onClick={() => {
                    const newRentalStatus = s.value;
                    const cat = formData.category;
                    const sale = formData.saleStatus;
                    let computedStatus = "DISPONIVEL";
                    if (cat === "LOCACAO") {
                      if (newRentalStatus === "ALUGADO") computedStatus = "ALUGADO";
                      else if (newRentalStatus === "SUSPENSO") computedStatus = "SUSPENSO";
                      else if (newRentalStatus === "INATIVO") computedStatus = "INDISPONIVEL";
                    } else {
                      if (sale === "INATIVO" && newRentalStatus === "INATIVO") computedStatus = "INDISPONIVEL";
                      else if (sale === "VENDIDO" && newRentalStatus === "ALUGADO") computedStatus = "INDISPONIVEL";
                      else if (sale === "VENDIDO") computedStatus = "VENDIDO";
                      else if (newRentalStatus === "ALUGADO") computedStatus = "ALUGADO";
                      else if (sale === "SUSPENSO" && newRentalStatus === "SUSPENSO") computedStatus = "SUSPENSO";
                      else if (sale === "ATIVO" || newRentalStatus === "ATIVO") computedStatus = "DISPONIVEL";
                      else computedStatus = "INDISPONIVEL";
                    }
                    setFormData((prev: any) => ({ ...prev, rentalStatus: newRentalStatus, status: computedStatus }));
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    isSelected ? colorMap[s.color] : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                  }`}>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Campos específicos para TERRENO */}
      {/* Campos específicos para CASA */}
      {formData.type === "CASA" && (
        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/30 space-y-3">
          <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-400">🏠 Características da Casa</h4>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Casa de Esquina */}
            <div>
              <label className="block text-[10px] font-medium mb-1.5">Casa de Esquina?</label>
              <div className="flex gap-1.5">
                {[{ value: true, label: "Sim" }, { value: false, label: "Não" }].map(opt => (
                  <button type="button" key={String(opt.value)} onClick={() => setFormData((prev: any) => ({ ...prev, isCornerHouse: opt.value }))}
                    className={`flex-1 px-2 py-1.5 text-[10px] rounded border ${formData.isCornerHouse === opt.value ? "border-blue-500 bg-blue-500 text-white" : "border-neutral-200 dark:border-neutral-700"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Área não Edificante */}
            <div>
              <label className="block text-[10px] font-medium mb-1.5">Área não Edificante?</label>
              <div className="flex gap-1.5">
                {[{ value: true, label: "Sim" }, { value: false, label: "Não" }].map(opt => (
                  <button type="button" key={String(opt.value)} onClick={() => setFormData((prev: any) => ({ ...prev, hasNonBuildableArea: opt.value }))}
                    className={`flex-1 px-2 py-1.5 text-[10px] rounded border ${formData.hasNonBuildableArea === opt.value ? "border-blue-500 bg-blue-500 text-white" : "border-neutral-200 dark:border-neutral-700"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Muro */}
            <div>
              <label className="block text-[10px] font-medium mb-1.5">Muro?</label>
              <div className="flex gap-1.5">
                {[{ value: true, label: "Sim" }, { value: false, label: "Não" }].map(opt => (
                  <button type="button" key={String(opt.value)} onClick={() => setFormData((prev: any) => ({ ...prev, hasWall: opt.value }))}
                    className={`flex-1 px-2 py-1.5 text-[10px] rounded border ${formData.hasWall === opt.value ? "border-blue-500 bg-blue-500 text-white" : "border-neutral-200 dark:border-neutral-700"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-blue-600 dark:text-blue-400">💡 Estas características são usadas em filtros internos.</p>
        </div>
      )}

      {formData.type === "TERRENO" && (
        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/30 space-y-3">
          <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-400">📐 Info do Terreno</h4>
          
          {/* Topografia */}
          <div>
            <label className="block text-[10px] font-medium mb-1.5">Topografia</label>
            <div className="flex gap-1.5">
              {[{ value: "PLANO", label: "Plano" }, { value: "ACLIVE", label: "Aclive" }, { value: "DECLIVE", label: "Declive" }].map(t => (
                <button type="button" key={t.value} onClick={() => setFormData((prev: any) => ({ ...prev, landTopography: t.value }))}
                  className={`flex-1 px-2 py-1.5 text-[10px] rounded border ${formData.landTopography === t.value ? "border-amber-500 bg-amber-500 text-white" : "border-neutral-200 dark:border-neutral-700"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensões */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium mb-1">Frente (m)</label>
              <input type="text" value={formData.landFrontWidth} onChange={e => setFormData((prev: any) => ({ ...prev, landFrontWidth: e.target.value }))}
                placeholder="12" className="w-full px-2 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded" />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-1">Fundo (m)</label>
              <input type="text" value={formData.landDepth} onChange={e => setFormData({ ...formData, landDepth: e.target.value })}
                placeholder="25" className="w-full px-2 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded" />
            </div>
          </div>

          {/* Projeto Aprovado e Muro */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium mb-1.5">Projeto Aprovado?</label>
              <div className="flex gap-1.5">
                {[{ value: true, label: "Sim" }, { value: false, label: "Não" }, { value: null, label: "N/I" }].map(opt => (
                  <button type="button" key={String(opt.value)} onClick={() => setFormData((prev: any) => ({ ...prev, hasApprovedProject: opt.value }))}
                    className={`flex-1 px-2 py-1.5 text-[10px] rounded border ${formData.hasApprovedProject === opt.value ? "border-amber-500 bg-amber-500 text-white" : "border-neutral-200 dark:border-neutral-700"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-1.5">Muro?</label>
              <div className="flex gap-1.5">
                {[{ value: true, label: "Sim" }, { value: false, label: "Não" }].map(opt => (
                  <button type="button" key={String(opt.value)} onClick={() => setFormData((prev: any) => ({ ...prev, hasWall: opt.value }))}
                    className={`flex-1 px-2 py-1.5 text-[10px] rounded border ${formData.hasWall === opt.value ? "border-amber-500 bg-amber-500 text-white" : "border-neutral-200 dark:border-neutral-700"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// STEP 2 - LOCALIZAÇÃO
function Step2({ formData, setFormData, onCepSearch, cepLoading, formatCep, condominiums, addressLocked }: any) {
  const [condoSearch, setCondoSearch] = useState("");
  const [showCondoDropdown, setShowCondoDropdown] = useState(false);
  const condoRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (condoRef.current && !condoRef.current.contains(e.target as Node)) {
        setShowCondoDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar condomínios por nome, endereço ou bairro
  const filteredCondos = condoSearch.trim()
    ? condominiums.filter((c: any) => {
        const q = condoSearch.toLowerCase();
        return (
          (c.name || "").toLowerCase().includes(q) ||
          (c.address || "").toLowerCase().includes(q) ||
          (c.neighborhood || "").toLowerCase().includes(q)
        );
      })
    : condominiums;

  // Função para auto-preencher dados do condomínio
  const handleCondominiumChange = (condoId: string) => {
    if (!condoId) {
      setFormData({ ...formData, condominiumId: "" });
      setCondoSearch("");
      return;
    }
    
    const condo = condominiums.find((c: any) => c.id === condoId);
    if (condo) {
      setFormData({
        ...formData,
        condominiumId: condoId,
        // Auto-preencher endereço do condomínio
        neighborhood: condo.neighborhood || formData.neighborhood,
        city: condo.city || formData.city,
        state: condo.state || formData.state,
        zipCode: condo.zipCode || formData.zipCode,
        address: condo.address || formData.address,
      });
      setCondoSearch(condo.name);
      setShowCondoDropdown(false);
    }
  };

  const selectedCondo = condominiums.find((c: any) => c.id === formData.condominiumId);

  // Sincronizar campo de busca com condomínio selecionado
  useEffect(() => {
    if (selectedCondo && !condoSearch) {
      setCondoSearch(selectedCondo.name);
    }
  }, [selectedCondo]);

  return (
    <div className="space-y-4">
      {/* Aviso de endereço travado */}
      {addressLocked && (formData.address || formData.neighborhood || formData.condominiumId) && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-2">
          <span className="text-blue-600">🔒</span>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Endereço preenchido a partir da verificação de duplicatas. Você pode ajustar os campos se necessário.
          </p>
        </div>
      )}

      {/* Condomínio */}
      <div ref={condoRef} className="relative">
        <label className="block text-sm font-medium mb-2">Condomínio</label>
        <div className="relative">
          <input
            type="text"
            value={condoSearch}
            onChange={(e) => {
              setCondoSearch(e.target.value);
              setShowCondoDropdown(true);
              if (!e.target.value) {
                setFormData({ ...formData, condominiumId: "" });
              }
            }}
            onFocus={() => setShowCondoDropdown(true)}
            placeholder="Buscar por nome, endereço ou bairro..."
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl pr-10"
          />
          {formData.condominiumId && (
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, condominiumId: "" });
                setCondoSearch("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              ✕
            </button>
          )}
        </div>
        {showCondoDropdown && (
          <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg">
            <button
              type="button"
              onClick={() => { handleCondominiumChange(""); setShowCondoDropdown(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              Nenhum (remover condomínio)
            </button>
            {filteredCondos.length === 0 ? (
              <div className="px-4 py-3 text-sm text-neutral-400">Nenhum condomínio encontrado</div>
            ) : (
              filteredCondos.map((condo: any) => (
                <button
                  type="button"
                  key={condo.id}
                  onClick={() => handleCondominiumChange(condo.id)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                    formData.condominiumId === condo.id ? "bg-blue-50 dark:bg-blue-900/30" : ""
                  }`}
                >
                  <span className="text-sm font-medium">{condo.name}</span>
                  {(condo.address || condo.neighborhood) && (
                    <span className="block text-xs text-neutral-500">
                      {[condo.address, condo.neighborhood, condo.city].filter(Boolean).join(", ")}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
        <p className="text-xs text-neutral-500 mt-1">Digite para buscar por nome, endereço ou bairro do condomínio.</p>
        
        {/* Info do condomínio selecionado */}
        {selectedCondo && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              📍 {selectedCondo.name}
            </p>
            {selectedCondo.neighborhood && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {selectedCondo.neighborhood}, {selectedCondo.city}/{selectedCondo.state}
              </p>
            )}
            <p className="text-xs text-blue-500 mt-1">
              ✓ Endereço preenchido automaticamente. Preencha apenas complemento, bloco e unidade.
            </p>
          </div>
        )}

        {/* Torre e Unidade - condomínio vertical/misto */}
        {selectedCondo && (selectedCondo.condoType === "VERTICAL" || selectedCondo.condoType === "MISTO") && (
          <div className="mt-3 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Torre/Bloco</label>
              {selectedCondo.towers?.length > 0 ? (
                <select
                  value={formData.towerName}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, towerName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                >
                  <option value="">Selecione a torre</option>
                  {selectedCondo.towers.map((t: any) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.towerName}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, towerName: e.target.value }))}
                  placeholder="Ex: Torre A, Bloco 1"
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Unidade/Apartamento</label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, unitNumber: e.target.value }))}
                placeholder="Ex: 101, 1201"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Unidade/Casa - condomínio villagio */}
        {selectedCondo && selectedCondo.condoType === "VILLAGIO" && (
          <div className="mt-3">
            <div>
              <label className="block text-sm font-medium mb-2">Unidade / Nº da Casa</label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, unitNumber: e.target.value }))}
                placeholder="Ex: Casa 12, Unidade 5"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
              <p className="text-xs text-neutral-500 mt-1">Número da casa dentro do condomínio (campo filtrável)</p>
            </div>
          </div>
        )}

        {/* Quadra e Lote - condomínio horizontal */}
        {selectedCondo && selectedCondo.condoType === "HORIZONTAL" && (
          <div className="mt-3 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quadra</label>
              <input
                type="text"
                value={formData.towerName}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, towerName: e.target.value }))}
                placeholder="Ex: Quadra A"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Lote</label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, unitNumber: e.target.value }))}
                placeholder="Ex: Lote 15"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">CEP</label>
          <div className="flex gap-2">
            <input value={formData.zipCode} onChange={e => setFormData({ ...formData, zipCode: formatCep(e.target.value) })}
              onBlur={onCepSearch} maxLength={9} placeholder="00000-000"
              className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
            <button type="button" onClick={onCepSearch} disabled={cepLoading} className="px-4 py-2.5 bg-[#0B2545] text-white rounded-xl hover:bg-[#081733] disabled:opacity-50">
              {cepLoading ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiSearchLine className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div><label className="block text-sm font-medium mb-2">Estado</label>
          <input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
        <div><label className="block text-sm font-medium mb-2">Cidade *</label>
          <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-2">Bairro *</label>
          <input value={formData.neighborhood} onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
        <div><label className="block text-sm font-medium mb-2">Endereço</label>
          <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
      </div>
      {/* Número (Portaria) sempre visível + Complemento oculto para verticais/mistos (já tem Torre/Bloco + Unidade) */}
      <div className="grid md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium mb-2">{selectedCondo && (selectedCondo.condoType === "VERTICAL" || selectedCondo.condoType === "MISTO") ? "Nº da Portaria" : "Número"}</label>
          <input value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })}
            placeholder={selectedCondo && (selectedCondo.condoType === "VERTICAL" || selectedCondo.condoType === "MISTO") ? "Nº do prédio" : ""}
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
        {!(selectedCondo && (selectedCondo.condoType === "VERTICAL" || selectedCondo.condoType === "MISTO")) && (
          <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Complemento</label>
            <input value={formData.complement} onChange={e => setFormData({ ...formData, complement: e.target.value })} placeholder="Apto, Bloco"
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-3">Exibição do endereço</label>
        <div className="flex flex-wrap gap-2">
          {["COMPLETO", "SOMENTE_RUA", "SOMENTE_BAIRRO", "OCULTO"].map(v => (
            <button type="button" key={v} onClick={() => setFormData({ ...formData, addressVisibility: v })}
              className={`px-4 py-2 rounded-lg border transition-colors ${formData.addressVisibility === v ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
              {v.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// STEP 3 - CARACTERÍSTICAS
function Step3({ formData, setFormData, toggleItem, amenitiesOptions, setAmenitiesOptions }: any) {
  const [editingCategory, setEditingCategory] = useState<"common" | "private" | "extras" | "special" | "propertyCategories" | null>(null);
  const [newItemInput, setNewItemInput] = useState("");
  const [editingItem, setEditingItem] = useState<{ category: string; index: number; value: string } | null>(null);

  // Mapear categoria do frontend para categoria da API
  const apiCategoryMap: Record<string, string> = { common: "common", private: "private", extras: "extras", special: "extras", propertyCategories: "propertyCategories" };

  // Adicionar nova opção e persistir no banco imediatamente
  const addOption = (category: "common" | "private" | "extras" | "special" | "propertyCategories") => {
    if (!newItemInput.trim()) return;
    const value = newItemInput.trim();
    if (amenitiesOptions[category].includes(value)) {
      alert("Esta opção já existe!");
      return;
    }
    setAmenitiesOptions({
      ...amenitiesOptions,
      [category]: [...amenitiesOptions[category], value]
    });
    // Auto-selecionar a nova opção no formData para que seja salva com o imóvel
    const fieldMap: Record<string, string> = { common: "amenities", private: "features", extras: "extras", special: "specialFeatures", propertyCategories: "propertyCategories" };
    const field = fieldMap[category];
    if (field) {
      setFormData((prev: any) => ({
        ...prev,
        [field]: [...(prev[field] || []), value]
      }));
    }
    // Persistir no banco para que apareça em futuros formulários mesmo sem seleção
    fetch("/api/admin/properties/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: apiCategoryMap[category] || category, value }),
    }).catch(() => {});
    setNewItemInput("");
  };

  // Remover opção
  const removeOption = (category: "common" | "private" | "extras" | "special" | "propertyCategories", item: string) => {
    setAmenitiesOptions((prev: any) => ({
      ...prev,
      [category]: prev[category].filter((i: string) => i !== item)
    }));
    // Também remover do formData se estava selecionado
    const fieldMap: Record<string, string> = { common: "amenities", private: "features", extras: "extras", special: "specialFeatures", propertyCategories: "propertyCategories" };
    const field = fieldMap[category];
    setFormData((prev: any) => {
      if (prev[field]?.includes(item)) {
        return { ...prev, [field]: prev[field].filter((i: string) => i !== item) };
      }
      return prev;
    });
    // Remover do banco também
    fetch("/api/admin/properties/options", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: apiCategoryMap[category] || category, value: item }),
    }).catch(() => {});
  };

  // Editar opção
  const saveEditOption = () => {
    if (!editingItem || !editingItem.value.trim()) return;
    const { category, index, value } = editingItem;
    setAmenitiesOptions((prev: any) => {
      const oldValue = prev[category][index];
      const newOptions = [...prev[category]];
      newOptions[index] = value.trim();
      // Também atualizar no formData se estava selecionado
      const fieldMap: Record<string, string> = { common: "amenities", private: "features", extras: "extras", special: "specialFeatures", propertyCategories: "propertyCategories" };
      const field = fieldMap[category];
      setFormData((prevFD: any) => {
        if (prevFD[field]?.includes(oldValue)) {
          return { ...prevFD, [field]: prevFD[field].map((i: string) => i === oldValue ? value.trim() : i) };
        }
        return prevFD;
      });
      return { ...prev, [category]: newOptions };
    });
    setEditingItem(null);
  };

  // Função de renderização de seção editável (não é componente para evitar re-render)
  const renderEditableSection = (title: string, category: "common" | "private" | "extras" | "special" | "propertyCategories", field: string) => (
    <div key={category}>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium">{title}</label>
        <button
          type="button"
          onClick={() => setEditingCategory(editingCategory === category ? null : category)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${
            editingCategory === category 
              ? "bg-[#0B2545] text-white" 
              : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
        >
          <RiEditLine className="w-3.5 h-3.5" />
          {editingCategory === category ? "Fechar" : "Editar"}
        </button>
      </div>
      
      {/* Modo edição */}
      {editingCategory === category && (
        <div className="mb-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newItemInput}
              onChange={e => setNewItemInput(e.target.value)}
              onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); addOption(category); } }}
              placeholder="Nova opção..."
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg"
            />
            <button
              type="button"
              onClick={() => addOption(category)}
              className="px-3 py-2 bg-[#0B2545] text-white text-sm rounded-lg hover:bg-[#081733]"
            >
              <RiAddLine className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {amenitiesOptions[category].map((item: string, idx: number) => (
              <div key={`${category}-${idx}-${item}`} className="flex items-center gap-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg overflow-hidden">
                {editingItem?.category === category && editingItem?.index === idx ? (
                  <>
                    <input
                      type="text"
                      value={editingItem.value}
                      onChange={e => setEditingItem({ ...editingItem, value: e.target.value })}
                      onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); saveEditOption(); } }}
                      className="px-2 py-1 text-sm bg-transparent border-none outline-none w-32"
                      autoFocus
                    />
                    <button type="button" onClick={saveEditOption} className="p-1 text-green-500 hover:bg-green-50">
                      <RiCheckLine className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setEditingItem(null)} className="p-1 text-neutral-400 hover:bg-neutral-100">
                      <RiCloseLine className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-1 text-sm">{item}</span>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ category, index: idx, value: item })}
                      className="p-1 text-neutral-400 hover:text-[#0B2545] hover:bg-neutral-100"
                    >
                      <RiPencilLine className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeOption(category, item)}
                      className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <RiDeleteBinLine className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Seleção normal */}
      <div className="flex flex-wrap gap-2">
        {amenitiesOptions[category].map((a: string) => (
          <button 
            type="button" 
            key={`select-${category}-${a}`} 
            onClick={() => toggleItem(field, a)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              formData[field]?.includes(a) 
                ? "border-[#0B2545] bg-[#0B2545] text-white" 
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <div><label className="block text-sm font-medium mb-2">Área Construída (m²) *</label>
          <input type="text" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} placeholder="Ex: 250"
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
        <div><label className="block text-sm font-medium mb-2">Área de Terreno (m²)</label>
          <input type="text" value={formData.totalArea} onChange={e => setFormData({ ...formData, totalArea: e.target.value })} placeholder="Ex: 2.200"
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
        <div><label className="block text-sm font-medium mb-2">Área Útil (m²)</label>
          <input type="text" value={formData.usefulArea} onChange={e => setFormData({ ...formData, usefulArea: e.target.value })} placeholder="Ex: 220"
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
        <div><label className="block text-sm font-medium mb-2">Idade do Imóvel</label>
          <input value={formData.propertyAge} onChange={e => setFormData({ ...formData, propertyAge: e.target.value })} placeholder="Ex: 5 anos"
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-3">Cômodos</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ k: "bedrooms", l: "Quartos" }, { k: "suites", l: "Suítes" }, { k: "bathrooms", l: "Banheiros" }, { k: "parkingSpaces", l: "Vagas" }].map(i => (
            <div key={i.k} className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4">
              <p className="text-sm text-neutral-500 mb-2">{i.l}</p>
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setFormData({ ...formData, [i.k]: Math.max(0, formData[i.k] - 1) })}
                  className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-600">-</button>
                <span className="text-xl font-semibold">{formData[i.k]}</span>
                <button type="button" onClick={() => setFormData({ ...formData, [i.k]: formData[i.k] + 1 })}
                  className="w-8 h-8 rounded-lg bg-[#0B2545] text-white flex items-center justify-center hover:bg-[#081733]">+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobiliário - Sim ou Não apenas */}
      <div>
        <label className="block text-sm font-medium mb-3">Mobiliário</label>
        <div className="flex gap-3">
          <button type="button" onClick={() => setFormData({ ...formData, isFurnished: formData.isFurnished === true ? null : true })}
            className={`flex-1 px-4 py-3 rounded-xl border-2 text-center text-lg font-semibold transition-all ${formData.isFurnished === true ? "border-[#0B2545] bg-[#0B2545] text-white shadow-lg" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
            Sim
          </button>
          <button type="button" onClick={() => setFormData({ ...formData, isFurnished: formData.isFurnished === false ? null : false })}
            className={`flex-1 px-4 py-3 rounded-xl border-2 text-center text-lg font-semibold transition-all ${formData.isFurnished === false ? "border-neutral-500 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 shadow-lg" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
            Não
          </button>
        </div>
        {formData.isFurnished === null && (
          <p className="text-xs text-neutral-400 mt-1">Não selecionado — não será usado nos filtros</p>
        )}
      </div>

      {/* Características Especiais */}
      <div>
        <label className="block text-sm font-medium mb-3">Características Especiais</label>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setFormData({ ...formData, hasElevator: !formData.hasElevator })}
            className={`px-4 py-2 rounded-lg border transition-all ${formData.hasElevator ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
            🛗 Elevador
          </button>
          <button type="button" onClick={() => setFormData({ ...formData, hasGroundFloorSuite: !formData.hasGroundFloorSuite })}
            className={`px-4 py-2 rounded-lg border transition-all ${formData.hasGroundFloorSuite ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
            🏠 Suíte Térrea
          </button>
          <button type="button" onClick={() => setFormData({ ...formData, hasFreeView: !formData.hasFreeView })}
            className={`px-4 py-2 rounded-lg border transition-all ${formData.hasFreeView ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
            🌅 Vista Livre
          </button>
        </div>
      </div>

      {renderEditableSection("Área Privativa", "private", "features")}
      
      {/* Diferenciais e Características - Lista única */}
      {renderEditableSection("Diferenciais e Características", "extras", "extras")}
      
      {/* Placa e Situação */}
      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div>
          <label className="block text-sm font-medium mb-3">Possui Placa?</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setFormData({ ...formData, hasPlate: true })}
              className={`flex-1 px-4 py-2.5 rounded-xl border transition-all ${formData.hasPlate ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
              ✓ Sim
            </button>
            <button type="button" onClick={() => setFormData({ ...formData, hasPlate: false })}
              className={`flex-1 px-4 py-2.5 rounded-xl border transition-all ${!formData.hasPlate ? "border-neutral-500 bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
              ✗ Não
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-3">Está Habitado?</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setFormData({ ...formData, isOccupied: true })}
              className={`flex-1 px-4 py-2.5 rounded-xl border transition-all ${formData.isOccupied ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
              🏠 Sim
            </button>
            <button type="button" onClick={() => setFormData({ ...formData, isOccupied: false })}
              className={`flex-1 px-4 py-2.5 rounded-xl border transition-all ${!formData.isOccupied ? "border-neutral-500 bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
              🔑 Não
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-3">Fotos Profissionais?</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setFormData({ ...formData, hasProfessionalPhotos: true })}
              className={`flex-1 px-4 py-2.5 rounded-xl border transition-all ${formData.hasProfessionalPhotos ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
              📸 Sim
            </button>
            <button type="button" onClick={() => setFormData({ ...formData, hasProfessionalPhotos: false })}
              className={`flex-1 px-4 py-2.5 rounded-xl border transition-all ${!formData.hasProfessionalPhotos ? "border-neutral-500 bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
              ✗ Não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// STEP 4 - VALORES
function Step4({ formData, setFormData, formatCurrency }: any) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-2">Valor de Venda *</label>
          <input value={formData.price} onChange={e => setFormData({ ...formData, price: formatCurrency(e.target.value) })} placeholder="R$ 0,00"
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
        <div><label className="block text-sm font-medium mb-2">Valor de Locação</label>
          <input value={formData.rentPrice} onChange={e => setFormData({ ...formData, rentPrice: formatCurrency(e.target.value) })} placeholder="R$ 0,00"
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-2">Condomínio</label>
          <div className="flex gap-2">
            <input value={formData.condoFee} onChange={e => setFormData({ ...formData, condoFee: formatCurrency(e.target.value) })} placeholder="R$ 0,00"
              disabled={formData.condoFeeExempt} className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl disabled:opacity-50" />
            <button type="button" onClick={() => setFormData({ ...formData, condoFeeExempt: !formData.condoFeeExempt })}
              className={`px-4 py-2.5 rounded-xl border ${formData.condoFeeExempt ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-neutral-200 dark:border-neutral-700"}`}>Isento</button>
          </div>
        </div>
        <div><label className="block text-sm font-medium mb-2">IPTU</label>
          <div className="flex gap-2">
            <input value={formData.iptu} onChange={e => setFormData({ ...formData, iptu: formatCurrency(e.target.value) })} placeholder="R$ 0,00"
              className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
            <select value={formData.iptuPeriod} onChange={e => setFormData({ ...formData, iptuPeriod: e.target.value })}
              className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl">
              <option value="ANUAL">Anual</option><option value="MENSAL">Mensal</option>
            </select>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-2">FORO (Anual)</label>
          <div className="flex gap-2">
            <input value={formData.foro} onChange={e => setFormData({ ...formData, foro: formatCurrency(e.target.value) })} placeholder="R$ 0,00"
              disabled={formData.foroExempt} className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl disabled:opacity-50" />
            <button type="button" onClick={() => setFormData({ ...formData, foro: "", foroExempt: !formData.foroExempt })}
              className={`px-4 py-2.5 rounded-xl border ${formData.foroExempt ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-neutral-200 dark:border-neutral-700"}`}>Isento</button>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Imposto regional anual (terrenos de marinha)</p>
        </div>
      </div>
      {/* Parcelamento Direto */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
        <div>
          <label className="block text-sm font-medium">Parcelamento direto</label>
          <p className="text-xs text-neutral-500 mt-0.5">Proprietário parcela sem financiamento bancário</p>
        </div>
        <button type="button" onClick={() => setFormData({ ...formData, acceptsDirectPayment: !formData.acceptsDirectPayment, ...(!formData.acceptsDirectPayment ? {} : { directPaymentMonths: "" }) })}
          className={`relative w-12 h-6 rounded-full transition-colors ${formData.acceptsDirectPayment ? "bg-blue-500" : "bg-neutral-300 dark:bg-neutral-600"}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.acceptsDirectPayment ? "translate-x-6" : "translate-x-0.5"}`} />
        </button>
      </div>

      {/* Detalhes do Parcelamento Direto - só aparece se SIM */}
      {formData.acceptsDirectPayment && (
        <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/30">
          <label className="block text-xs font-medium mb-2 text-green-700 dark:text-green-400">
            💰 Quantidade de Parcelas (meses)
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="1"
              max="360"
              value={formData.directPaymentMonths || ""}
              onChange={(e) => setFormData({ ...formData, directPaymentMonths: e.target.value })}
              placeholder="Ex: 24"
              className="w-32 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-green-200 dark:border-green-500/30 rounded-xl text-sm"
            />
            <span className="text-sm text-green-600 dark:text-green-400">meses</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            Informe em quantas parcelas o proprietário aceita dividir o pagamento (sem financiamento bancário).
          </p>
        </div>
      )}

      {/* Aceita Permuta */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
        <div>
          <label className="block text-sm font-medium flex items-center gap-2">
            <RiExchangeLine className="w-4 h-4 text-pink-500" />
            Permuta
          </label>
          <p className="text-xs text-neutral-500 mt-0.5">Aceita imóvel, veículo ou outro bem como parte do pagamento</p>
        </div>
        <button type="button" onClick={() => {
          const newVal = formData.acceptsExchange === true ? false : true;
          setFormData({ ...formData, acceptsExchange: newVal, exchangeNotInformed: false });
        }}
          className={`relative w-12 h-6 rounded-full transition-colors ${formData.acceptsExchange === true ? "bg-pink-500" : "bg-neutral-300 dark:bg-neutral-600"}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.acceptsExchange === true ? "translate-x-6" : "translate-x-0.5"}`} />
        </button>
      </div>

      {/* Campos condicionais de Permuta - só aparece se SIM */}
      {formData.acceptsExchange === true && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 space-y-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-300">Detalhes da Permuta</h4>
          
          {/* Tipos aceitos - Múltipla seleção */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipos aceitos na permuta</label>
            <div className="flex flex-wrap gap-2">
              {["CASA", "APARTAMENTO", "VEICULO", "TERRENO", "COMERCIAL"].map(type => {
                const labels: Record<string, string> = { CASA: "Casa", APARTAMENTO: "Apartamento", VEICULO: "Veículo", TERRENO: "Terreno", COMERCIAL: "Comercial" };
                const isSelected = formData.exchangeTypes?.includes(type);
                return (
                  <button key={type} type="button"
                    onClick={() => {
                      const current = formData.exchangeTypes || [];
                      const updated = isSelected ? current.filter((t: string) => t !== type) : [...current, type];
                      setFormData({ ...formData, exchangeTypes: updated });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${isSelected ? "bg-blue-600 text-white" : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-blue-400"}`}>
                    {labels[type]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Localizações aceitas - Múltipla seleção */}
          <div>
            <label className="block text-sm font-medium mb-2">Localizações aceitas</label>
            <div className="flex flex-wrap gap-2">
              {["SUA_CIDADE", "SAO_PAULO", "INTERIOR", "LITORAL", "GRANDE_SP"].map(loc => {
                const labels: Record<string, string> = { SUA_CIDADE: "Sua Cidade", SAO_PAULO: "São Paulo", INTERIOR: "Interior", LITORAL: "Litoral", GRANDE_SP: "Grande SP" };
                const isSelected = formData.exchangeLocations?.includes(loc);
                return (
                  <button key={loc} type="button"
                    onClick={() => {
                      const current = formData.exchangeLocations || [];
                      const updated = isSelected ? current.filter((l: string) => l !== loc) : [...current, loc];
                      setFormData({ ...formData, exchangeLocations: updated });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${isSelected ? "bg-blue-600 text-white" : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-blue-400"}`}>
                    {labels[loc]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Observação sobre permuta</label>
            <input value={formData.exchangeType} onChange={e => setFormData({ ...formData, exchangeType: e.target.value })}
              placeholder="Ex: Aceita carro de até 100k como parte..."
              className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Valor da permuta</label>
            <input value={formData.exchangeValue || formData.exchangeMinValue} onChange={e => setFormData({ ...formData, exchangeValue: formatCurrency(e.target.value), exchangeMinValue: formatCurrency(e.target.value), exchangeMaxValue: formatCurrency(e.target.value) })}
              placeholder="R$ 0,00"
              className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">💡 Esses dados serão usados para cruzar permutas compatíveis automaticamente.</p>
        </div>
      )}

      
      {/* Possui Saldo de Financiamento */}
      <div>
        <label className="block text-sm font-medium mb-3">Possui Saldo de Financiamento?</label>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setFormData({ ...formData, hasFinancingBalance: false, financingBalance: "", financingBank: "" })}
            className={`px-4 py-2 rounded-lg border ${!formData.hasFinancingBalance ? "border-green-500 bg-green-50 text-green-600" : "border-neutral-200 dark:border-neutral-700"}`}>
            ✓ Não
          </button>
          <button type="button" onClick={() => setFormData({ ...formData, hasFinancingBalance: true })}
            className={`px-4 py-2 rounded-lg border ${formData.hasFinancingBalance ? "border-yellow-500 bg-yellow-50 text-yellow-600" : "border-neutral-200 dark:border-neutral-700"}`}>
            ⚠ Sim
          </button>
        </div>
      </div>

      {/* Campos condicionais de Saldo - só aparece se SIM */}
      {formData.hasFinancingBalance && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 space-y-4">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Detalhes do Saldo Devedor</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Valor do Saldo</label>
              <input value={formData.financingBalance} onChange={e => setFormData({ ...formData, financingBalance: formatCurrency(e.target.value) })}
                placeholder="R$ 0,00"
                className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Banco</label>
              <select value={formData.financingBank} onChange={e => setFormData({ ...formData, financingBank: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                <option value="">Selecione o banco...</option>
                <option value="CAIXA">Caixa Econômica Federal</option>
                <option value="BB">Banco do Brasil</option>
                <option value="ITAU">Itaú</option>
                <option value="BRADESCO">Bradesco</option>
                <option value="SANTANDER">Santander</option>
                <option value="INTER">Banco Inter</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">💡 Informe o valor atualizado do saldo devedor e o banco financiador.</p>
        </div>
      )}

      {/* Documentação Irregular */}
      <div>
        <label className="block text-sm font-medium mb-3">Documentação do Imóvel</label>
        <div className="flex gap-3">
          <button type="button" onClick={() => setFormData({ ...formData, hasIrregularDocs: false, irregularDocsNotes: "" })}
            className={`px-4 py-2 rounded-lg border transition-all ${!formData.hasIrregularDocs ? "border-green-500 bg-green-50 text-green-600" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
            ✅ Regular
          </button>
          <button type="button" onClick={() => setFormData({ ...formData, hasIrregularDocs: true })}
            className={`px-4 py-2 rounded-lg border transition-all ${formData.hasIrregularDocs ? "border-amber-500 bg-amber-50 text-amber-600" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
            ⚠️ Irregular
          </button>
        </div>
      </div>

      {formData.hasIrregularDocs && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <label className="block text-sm font-medium mb-2 text-amber-800 dark:text-amber-300">Observações sobre a documentação</label>
          <textarea 
            value={formData.irregularDocsNotes} 
            onChange={e => setFormData({ ...formData, irregularDocsNotes: e.target.value })}
            placeholder="Descreva os problemas de documentação (ex: sem escritura, dívidas de IPTU, inventário pendente...)"
            rows={3}
            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none" />
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">⚠️ Esta informação é visível apenas para corretores, não aparece no site.</p>
        </div>
      )}

      {/* Campos específicos de LOCAÇÃO */}
      {(formData.category === "LOCACAO" || formData.category === "VENDA_LOCACAO") && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 space-y-4">
          <h4 className="font-medium text-purple-800 dark:text-purple-300 flex items-center gap-2">
            🏠 Informações para Locação
          </h4>
          
          {/* Aceita Pet */}
          <div>
            <label className="block text-sm font-medium mb-3">Aceita Pet?</label>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setFormData({ ...formData, acceptsPets: true })}
                className={`px-4 py-2 rounded-lg border transition-all ${formData.acceptsPets === true ? "border-green-500 bg-green-50 text-green-600" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
                🐾 Sim
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, acceptsPets: false })}
                className={`px-4 py-2 rounded-lg border transition-all ${formData.acceptsPets === false ? "border-red-500 bg-red-50 text-red-600" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
                🚫 Não
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, acceptsPets: null })}
                className={`px-4 py-2 rounded-lg border transition-all ${formData.acceptsPets === null ? "border-yellow-500 bg-yellow-50 text-yellow-600" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
                ⚠ Não informado
              </button>
            </div>
          </div>

          {/* Garantias Locatícias */}
          <div>
            <label className="block text-sm font-medium mb-2">Garantias Locatícias Aceitas</label>
            <p className="text-xs text-neutral-500 mb-3">Selecione todas as garantias aceitas pelo proprietário</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "FIADOR", label: "Fiador", icon: "👤" },
                { value: "CAUCAO", label: "Caução (3 meses)", icon: "💰" },
                { value: "SEGURO_FIANCA", label: "Seguro Fiança", icon: "🛡️" },
                { value: "TITULO_CAPITALIZACAO", label: "Título de Capitalização", icon: "📜" },
                { value: "CARTA_FIANCA", label: "Carta Fiança", icon: "📄" },
                { value: "DEPOSITO_CAUCAO", label: "Depósito Caução", icon: "🏦" },
              ].map(warranty => {
                const isSelected = formData.rentalWarranties?.includes(warranty.value);
                return (
                  <button key={warranty.value} type="button"
                    onClick={() => {
                      const current = formData.rentalWarranties || [];
                      const updated = isSelected 
                        ? current.filter((w: string) => w !== warranty.value) 
                        : [...current, warranty.value];
                      setFormData({ ...formData, rentalWarranties: updated });
                    }}
                    className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
                      isSelected 
                        ? "bg-purple-600 text-white" 
                        : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-purple-400"
                    }`}>
                    <span>{warranty.icon}</span>
                    <span>{warranty.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <p className="text-xs text-purple-600 dark:text-purple-400">💡 Essas informações serão exibidas para interessados em alugar o imóvel.</p>
        </div>
      )}
    </div>
  );
}

// STEP 5 - MÍDIA
function Step5({ formData, setFormData, handleImageUpload, removeImage, setThumbnail, generateDescription, isGeneratingDescription, generateTitle, isGeneratingTitle, generateExchangeDescription, isGeneratingExchange, isUploadingImages, uploadProgress }: any) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  // Funções de drag-and-drop para reordenar imagens
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...formData.images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    setFormData({ ...formData, images: newImages });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Título do Anúncio */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Título do Anúncio *</label>
          <button
            type="button"
            onClick={() => generateTitle?.("title")}
            disabled={isGeneratingTitle}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
          >
            {isGeneratingTitle ? (
              <>
                <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                ✨ Gerar com IA
              </>
            )}
          </button>
        </div>
        <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} maxLength={100}
          placeholder="Ex: Apartamento 3 quartos no Tamboré" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
        <p className="text-xs text-neutral-400 mt-1">{formData.title.length}/100</p>
      </div>

      {/* Título do Marketplace/Portal */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Título do Marketplace/Portal</label>
          <button
            type="button"
            onClick={() => generateTitle?.("marketplaceTitle")}
            disabled={isGeneratingTitle}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
          >
            {isGeneratingTitle ? (
              <>
                <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                ✨ Gerar com IA
              </>
            )}
          </button>
        </div>
        <input value={formData.marketplaceTitle || ""} onChange={e => setFormData({ ...formData, marketplaceTitle: e.target.value })} maxLength={120}
          placeholder="Título otimizado para portais imobiliários..." className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
        <p className="text-xs text-neutral-400 mt-1">{(formData.marketplaceTitle || "").length}/120 - Título otimizado para OLX, ZAP, VivaReal, etc.</p>
      </div>

      {/* Descrição */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Descrição *</label>
          <button
            type="button"
            onClick={generateDescription}
            disabled={isGeneratingDescription}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
          >
            {isGeneratingDescription ? (
              <>
                <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                ✨ Gerar com IA
              </>
            )}
          </button>
        </div>
        <RichTextEditor
          value={formData.description}
          onChange={(value) => setFormData((prev: any) => ({ ...prev, description: value }))}
          placeholder="Descreva o imóvel ou clique em 'Gerar com IA' para criar automaticamente..."
          maxLength={2500}
        />
      </div>
      
      {/* Descrição da Permuta */}
      {formData.acceptsExchange === true && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <RiExchangeLine className="w-4 h-4 text-green-500" />
              Descrição da Permuta
            </label>
            <button
              type="button"
              onClick={generateExchangeDescription}
              disabled={isGeneratingExchange}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all"
            >
              {isGeneratingExchange ? (
                <>
                  <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  ✨ Gerar com IA
                </>
              )}
            </button>
          </div>
          <textarea rows={3} value={formData.exchangeDescription || ""} onChange={e => setFormData({ ...formData, exchangeDescription: e.target.value })} maxLength={1000}
            placeholder="Descreva o que aceita como permuta (tipos de imóveis, veículos, etc.)..." className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none" />
          <p className="text-xs text-neutral-400 mt-1">{(formData.exchangeDescription || "").length}/1000</p>
        </div>
      )}
      
      {/* Upload de fotos */}
      <div>
        <label className="block text-sm font-medium mb-2">Fotos (mínimo 3) - {formData.images.length} foto(s)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleImageUpload(e.target.files)}
          className="hidden"
        />
        
        {/* Grid de imagens com drag-and-drop */}
        {formData.images.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-neutral-500 flex items-center gap-1">
                <RiDragMoveLine className="w-3.5 h-3.5" />
                Arraste para reordenar as fotos
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Apagar todas as ${formData.images.length} fotos?`)) {
                    setFormData({ ...formData, images: [], thumbnail: "" });
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
              >
                <RiDeleteBinLine className="w-3.5 h-3.5" />
                Apagar todas
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {formData.images.map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`relative group aspect-square rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all ${
                    draggedIndex === idx 
                      ? "opacity-50 scale-95 border-[#0B2545]" 
                      : dragOverIndex === idx 
                        ? "border-[#0B2545] ring-2 ring-[#0B2545]/30 scale-105" 
                        : "border-neutral-200 dark:border-neutral-700"
                  }`}
                >
                  <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" />
                  {/* Número da ordem */}
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setThumbnail(img)}
                      className={`p-2 rounded-lg ${formData.thumbnail === img ? "bg-yellow-500 text-white" : "bg-white text-neutral-700"}`}
                      title="Definir como capa"
                    >
                      {formData.thumbnail === img ? <RiStarFill className="w-4 h-4" /> : <RiStarLine className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-2 rounded-lg bg-red-500 text-white"
                      title="Remover"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Badge de capa */}
                  {formData.thumbnail === img && (
                    <div className="absolute top-1 left-1 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded font-medium">
                      Capa
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Área de upload */}
        {isUploadingImages ? (
          <div className="border-2 border-dashed border-[#0B2545] rounded-xl p-8 text-center bg-[#0B2545]/5">
            <RiLoader4Line className="w-12 h-12 text-[#0B2545] mx-auto mb-3 animate-spin" />
            <p className="text-[#0B2545] font-medium">Enviando fotos...</p>
            <p className="text-sm text-[#0B2545]/70 mt-1">
              {uploadProgress.current} de {uploadProgress.total} fotos
            </p>
            <div className="w-full bg-neutral-200 rounded-full h-2 mt-3 max-w-xs mx-auto">
              <div 
                className="bg-[#0B2545] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-8 text-center cursor-pointer hover:border-[#0B2545] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            <RiCameraLine className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">Clique para selecionar fotos</p>
            <p className="text-sm text-neutral-400 mt-1">JPG, PNG ou WEBP até 10MB cada</p>
          </div>
        )}

        {/* Toggle Marca d'água */}
        <div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, hasWatermark: !formData.hasWatermark })}
            className={`relative w-11 h-6 rounded-full transition-colors ${formData.hasWatermark ? "bg-[#0B2545]" : "bg-neutral-300 dark:bg-neutral-600"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.hasWatermark ? "translate-x-5" : "translate-x-0"}`} />
          </button>
          <div>
            <p className="text-sm font-medium">Marca d'água</p>
            <p className="text-xs text-neutral-500">Aplicar marca d'água nas fotos deste imóvel</p>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">📹 Vídeo YouTube</label>
          <input value={formData.videoYoutube} onChange={e => setFormData({ ...formData, videoYoutube: e.target.value })}
            placeholder="https://youtube.com/..." className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
      </div>
    </div>
  );
}

// STEP 6 - PROPRIETÁRIO
function Step6({ formData, setFormData, addPhone, removePhone, addEmail, removeEmail, formatPhone, brokers, agencies }: any) {
  const [managerSearch, setManagerSearch] = React.useState("");
  const [constructors, setConstructors] = React.useState<any[]>([]);
  const [constructorSearch, setConstructorSearch] = React.useState("");
  const [showConstructorDropdown, setShowConstructorDropdown] = React.useState(false);

  React.useEffect(() => {
    const fetchConstructors = async () => {
      try {
        const res = await fetch("/api/admin/business-partners?type=CONSTRUTORA&limit=100");
        if (res.ok) {
          const data = await res.json();
          setConstructors(data.partners || []);
        }
      } catch (e) {
        console.error("Erro ao buscar construtoras:", e);
      }
    };
    fetchConstructors();
  }, []);

  const filteredConstructors = constructors.filter(c =>
    c.name?.toLowerCase().includes(constructorSearch.toLowerCase())
  ).slice(0, 8);

  const q = managerSearch.toLowerCase();
  const filteredBrokers = brokers?.filter((b: any) => 
    b.name?.toLowerCase().includes(q) ||
    b.email?.toLowerCase().includes(q) ||
    b.creci?.toLowerCase().includes(q) ||
    b.phone?.toLowerCase().includes(q)
  ) || [];

  const filteredAgencies = agencies?.filter((a: any) => 
    a.companyName?.toLowerCase().includes(q) ||
    a.tradeName?.toLowerCase().includes(q) ||
    a.email?.toLowerCase().includes(q) ||
    a.phone?.toLowerCase().includes(q) ||
    a.cnpj?.toLowerCase().includes(q)
  ) || [];

  const searchResults = formData.exclusivityManagerType === "IMOBILIARIA" ? filteredAgencies : filteredBrokers;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl"><p className="text-sm text-blue-600 dark:text-blue-400">💡 Dados para qualificação e contratos</p></div>
      
      {/* Escolha: Proprietário, Gestor de Exclusividade ou Ambos */}
      <div>
        <label className="block text-sm font-medium mb-3">Quem está cadastrando este imóvel?</label>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, ownerType: "PROPRIETARIO", exclusivityManagerId: null, exclusivityManagerName: "", exclusivityManagerType: "" })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              formData.ownerType === "PROPRIETARIO" || !formData.ownerType
                ? "border-[#0B2545] bg-[#0B2545]/5"
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
            }`}
          >
            <span className="block font-medium text-lg">🏠 Proprietário</span>
            <span className="text-sm text-neutral-500">Dados do dono do imóvel</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, ownerType: "GESTOR_EXCLUSIVIDADE" })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              formData.ownerType === "GESTOR_EXCLUSIVIDADE"
                ? "border-[#0B2545] bg-[#0B2545]/5"
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
            }`}
          >
            <span className="block font-medium text-lg">👔 Gestor de Exclusividade</span>
            <span className="text-sm text-neutral-500">Corretor ou imobiliária responsável</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, ownerType: "AMBOS" })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              formData.ownerType === "AMBOS"
                ? "border-[#0B2545] bg-[#0B2545]/5"
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
            }`}
          >
            <span className="block font-medium text-lg">🤝 Ambos</span>
            <span className="text-sm text-neutral-500">Proprietário + Gestor de Exclusividade</span>
          </button>
        </div>
      </div>

      {/* Seção Gestor de Exclusividade - visível em GESTOR_EXCLUSIVIDADE e AMBOS */}
      {(formData.ownerType === "GESTOR_EXCLUSIVIDADE" || formData.ownerType === "AMBOS") && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 space-y-4">
          <h4 className="font-medium text-purple-800 dark:text-purple-300 flex items-center gap-2">
            <RiSearchLine className="w-4 h-4" />
            Gestor de Exclusividade
          </h4>

          {/* Tipo: Corretor ou Imobiliária */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipo do Gestor</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, exclusivityManagerType: "CORRETOR", exclusivityManagerId: null, exclusivityManagerName: "" });
                  setManagerSearch("");
                }}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  formData.exclusivityManagerType === "CORRETOR"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                }`}
              >
                <span className="block font-medium">👤 Corretor</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, exclusivityManagerType: "IMOBILIARIA", exclusivityManagerId: null, exclusivityManagerName: "" });
                  setManagerSearch("");
                }}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  formData.exclusivityManagerType === "IMOBILIARIA"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                }`}
              >
                <span className="block font-medium">🏢 Imobiliária</span>
              </button>
            </div>
          </div>

          {/* Busca - só aparece após escolher o tipo */}
          {formData.exclusivityManagerType && (
            <>
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input 
                  type="text"
                  value={managerSearch}
                  onChange={e => setManagerSearch(e.target.value)}
                  placeholder={formData.exclusivityManagerType === "IMOBILIARIA" ? "Buscar imobiliária..." : "Buscar corretor..."}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              </div>
              
              {/* Lista de resultados */}
              {managerSearch && (
                <div className="max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900">
                  {searchResults.length > 0 ? (
                    searchResults.map((item: any) => {
                      const displayName = item.tradeName || item.companyName || item.name;
                      const subtitle = formData.exclusivityManagerType === "IMOBILIARIA"
                        ? [item.cnpj, item.email].filter(Boolean).join(" · ")
                        : [item.creci ? `CRECI ${item.creci}` : null, item.phone, item.email].filter(Boolean).join(" · ");
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, exclusivityManagerId: item.id, exclusivityManagerName: displayName });
                            setManagerSearch("");
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800 last:border-0 flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#0B2545] flex items-center justify-center text-white font-medium">
                            {displayName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{displayName}</p>
                            <p className="text-xs text-neutral-500 truncate">{subtitle}</p>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <p className="px-4 py-3 text-neutral-500 text-sm">
                      {formData.exclusivityManagerType === "IMOBILIARIA" ? "Nenhuma imobiliária encontrada" : "Nenhum corretor encontrado"}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Gestor selecionado */}
          {formData.exclusivityManagerId && (
            <div className="flex items-center gap-3 p-3 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#0B2545] flex items-center justify-center text-white font-medium">
                {formData.exclusivityManagerName?.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{formData.exclusivityManagerName}</p>
                <p className="text-xs text-purple-600">
                  {formData.exclusivityManagerType === "IMOBILIARIA" ? "Imobiliária - Gestora de Exclusividade" : "Corretor - Gestor de Exclusividade"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, exclusivityManagerId: null, exclusivityManagerName: "" })}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Se for PROPRIETÁRIO ou AMBOS - Todos os campos */}
      {(formData.ownerType === "PROPRIETARIO" || formData.ownerType === "AMBOS" || !formData.ownerType) && (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-2">Nome Completo</label>
              <input value={formData.ownerName} onChange={e => {
                const fullName = e.target.value;
                const firstName = fullName.trim().split(/\s+/)[0] || "";
                const updates: any = { ...formData, ownerName: fullName };
                // Auto-preencher apelido com primeiro nome
                if (!formData.ownerNickname || formData.ownerNickname === formData.ownerName?.trim().split(/\s+/)[0]) {
                  updates.ownerNickname = firstName;
                }
                // Auto-preencher nome do primeiro telefone
                if (formData.ownerPhones?.length > 0 && (!formData.ownerPhones[0].name || formData.ownerPhones[0].name === formData.ownerName?.trim().split(/\s+/)[0])) {
                  updates.ownerPhones = [...formData.ownerPhones];
                  updates.ownerPhones[0] = { ...updates.ownerPhones[0], name: firstName };
                }
                setFormData(updates);
              }}
                placeholder="Nome do proprietário"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
            <div><label className="block text-sm font-medium mb-2">Apelido / 1º Nome</label>
              <input value={formData.ownerNickname || ""} onChange={e => setFormData({ ...formData, ownerNickname: e.target.value })}
                placeholder="Ex: João"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
              <p className="text-xs text-neutral-500 mt-1">Usado em mensagens em massa</p></div>
          </div>
          
          {/* CPF, RG e Data de Nascimento */}
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-2">CPF</label>
              <input 
                value={formData.ownerCpf || ""} 
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, "");
                  let formatted = v;
                  if (v.length > 3) formatted = v.slice(0,3) + "." + v.slice(3);
                  if (v.length > 6) formatted = v.slice(0,3) + "." + v.slice(3,6) + "." + v.slice(6);
                  if (v.length > 9) formatted = v.slice(0,3) + "." + v.slice(3,6) + "." + v.slice(6,9) + "-" + v.slice(9,11);
                  setFormData({ ...formData, ownerCpf: formatted });
                }}
                maxLength={14}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
            <div><label className="block text-sm font-medium mb-2">RG</label>
              <input 
                value={formData.ownerRg || ""} 
                onChange={e => setFormData({ ...formData, ownerRg: e.target.value })}
                placeholder="Número do RG"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
            <div><label className="block text-sm font-medium mb-2">Data de Nascimento</label>
              <input 
                type="text"
                value={formData.ownerBirthDate ? (() => {
                  const d = formData.ownerBirthDate;
                  if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
                  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${d.slice(8,10)}/${d.slice(5,7)}/${d.slice(0,4)}`;
                  return d;
                })() : ""}
                onChange={e => {
                  let v = e.target.value.replace(/[^\d\/]/g, "");
                  const digits = v.replace(/\D/g, "");
                  if (digits.length <= 8) {
                    let formatted = digits;
                    if (digits.length > 2) formatted = digits.slice(0,2) + "/" + digits.slice(2);
                    if (digits.length > 4) formatted = digits.slice(0,2) + "/" + digits.slice(2,4) + "/" + digits.slice(4,8);
                    v = formatted;
                  }
                  if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
                    const [dd, mm, yyyy] = v.split("/");
                    setFormData({ ...formData, ownerBirthDate: `${yyyy}-${mm}-${dd}` });
                  } else {
                    setFormData({ ...formData, ownerBirthDate: v });
                  }
                }}
                onPaste={e => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData("text").trim();
                  const digits = pasted.replace(/\D/g, "");
                  let iso = "";
                  if (/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(pasted)) {
                    const parts = pasted.split(/[\/-]/);
                    iso = `${parts[2]}-${parts[1]}-${parts[0]}`;
                  } else if (/^\d{4}[\/-]\d{2}[\/-]\d{2}$/.test(pasted)) {
                    const parts = pasted.split(/[\/-]/);
                    iso = `${parts[0]}-${parts[1]}-${parts[2]}`;
                  } else if (digits.length === 8) {
                    iso = `${digits.slice(4,8)}-${digits.slice(2,4)}-${digits.slice(0,2)}`;
                  }
                  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
                    setFormData({ ...formData, ownerBirthDate: iso });
                  } else {
                    setFormData({ ...formData, ownerBirthDate: pasted });
                  }
                }}
                maxLength={10}
                placeholder="dd/mm/aaaa"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" /></div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Telefone(s)</label>
            <p className="text-xs text-neutral-500 mb-3">Adicione o nome ao lado para identificar (ex: Marido, Esposa)</p>
            {formData.ownerPhones.map((p: string | { name?: string; phone: string; international?: boolean }, i: number) => {
              // Compatibilidade: se for string antiga, converter para objeto
              const phoneObj = typeof p === 'string' ? { name: '', phone: p, international: false } : p;
              const isIntl = phoneObj.international || false;
              return (
                <div key={i} className="flex gap-2 mb-2">
                  <input 
                    value={phoneObj.name || ''} 
                    onChange={e => { 
                      const ph = [...formData.ownerPhones]; 
                      ph[i] = { ...phoneObj, name: e.target.value };
                      setFormData({ ...formData, ownerPhones: ph }); 
                    }}
                    placeholder="Nome (ex: Marido)" 
                    className="w-32 px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm" 
                  />
                  <button
                    type="button"
                    title={isIntl ? "Formato internacional ativo" : "Clique para formato internacional"}
                    onClick={() => {
                      const ph = [...formData.ownerPhones];
                      ph[i] = { ...phoneObj, international: !isIntl };
                      setFormData({ ...formData, ownerPhones: ph });
                    }}
                    className={`px-2.5 py-2.5 rounded-xl border text-sm flex items-center gap-1 transition-colors ${isIntl ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400" : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-neutral-600"}`}
                  >
                    <RiGlobalLine className="w-4 h-4" />
                  </button>
                  <input 
                    value={phoneObj.phone || ''} 
                    onChange={e => { 
                      const ph = [...formData.ownerPhones]; 
                      ph[i] = { ...phoneObj, phone: formatPhone(e.target.value, isIntl) };
                      setFormData({ ...formData, ownerPhones: ph }); 
                    }}
                    maxLength={isIntl ? 20 : 15}
                    placeholder={isIntl ? "+1 (555) 123-4567" : "(00) 00000-0000"}
                    className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" 
                  />
                  {formData.ownerPhones.length > 1 && (
                    <button type="button" onClick={() => removePhone(i)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
                      <RiCloseLine className="w-5 h-5" />
                    </button>
                  )}
                </div>
              );
            })}
            <button type="button" onClick={addPhone} className="flex items-center gap-2 text-sm text-[#0B2545] hover:underline mt-2">
              <RiAddLine className="w-4 h-4" /> Adicionar telefone
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email(s)</label>
            {(formData.ownerEmails || [""]).map((email: string, i: number) => (
              <div key={i} className="flex gap-2 mb-2">
                <input 
                  type="email"
                  value={email || ''} 
                  onChange={e => { 
                    const emails = [...(formData.ownerEmails || [""])]; 
                    emails[i] = e.target.value;
                    setFormData({ ...formData, ownerEmails: emails, ownerEmail: emails[0] || "" }); 
                  }}
                  placeholder="email@exemplo.com"
                  className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" 
                />
                {(formData.ownerEmails || [""]).length > 1 && (
                  <button type="button" onClick={() => removeEmail(i)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addEmail} className="flex items-center gap-2 text-sm text-[#0B2545] hover:underline mt-2">
              <RiAddLine className="w-4 h-4" /> Adicionar email
            </button>
          </div>

          {/* Endereço Residencial */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <RiMapPinLine className="w-4 h-4" />
                Endereço Residencial do Proprietário
              </h4>
              <button
                type="button"
                onClick={() => setFormData((prev: any) => ({
                  ...prev,
                  ownerAddress: prev.address || prev.ownerAddress,
                  ownerAddressNumber: prev.number || prev.ownerAddressNumber,
                  ownerAddressComplement: prev.complement || prev.ownerAddressComplement,
                  ownerNeighborhood: prev.neighborhood || prev.ownerNeighborhood,
                  ownerCity: prev.city || prev.ownerCity,
                  ownerState: prev.state || prev.ownerState,
                  ownerZipCode: prev.zipCode ? (prev.zipCode.length === 8 ? `${prev.zipCode.slice(0,5)}-${prev.zipCode.slice(5)}` : prev.zipCode) : prev.ownerZipCode,
                }))}
                className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium transition-colors flex items-center gap-1.5"
              >
                <RiMapPinLine className="w-3.5 h-3.5" />
                Mesmo endereço do imóvel
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Endereço</label>
                <input 
                  value={formData.ownerAddress || ""} 
                  onChange={e => setFormData({ ...formData, ownerAddress: e.target.value })}
                  placeholder="Rua, Avenida..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Número</label>
                <input 
                  value={formData.ownerAddressNumber || ""} 
                  onChange={e => setFormData({ ...formData, ownerAddressNumber: e.target.value })}
                  placeholder="Nº"
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Complemento</label>
                <input 
                  value={formData.ownerAddressComplement || ""} 
                  onChange={e => setFormData({ ...formData, ownerAddressComplement: e.target.value })}
                  placeholder="Apto, Bloco..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bairro</label>
                <input 
                  value={formData.ownerNeighborhood || ""} 
                  onChange={e => setFormData({ ...formData, ownerNeighborhood: e.target.value })}
                  placeholder="Bairro"
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CEP</label>
                <input 
                  value={formData.ownerZipCode || ""} 
                  onChange={e => {
                    const n = e.target.value.replace(/\D/g, "");
                    const formatted = n.length <= 5 ? n : `${n.slice(0, 5)}-${n.slice(5, 8)}`;
                    setFormData({ ...formData, ownerZipCode: formatted });
                  }}
                  maxLength={9}
                  placeholder="00000-000"
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cidade</label>
                <input 
                  value={formData.ownerCity || ""} 
                  onChange={e => setFormData({ ...formData, ownerCity: e.target.value })}
                  placeholder="Cidade"
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select 
                  value={formData.ownerState || ""} 
                  onChange={e => setFormData({ ...formData, ownerState: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                >
                  <option value="">Selecione...</option>
                  {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Perfil do Proprietário - Construtor e/ou Investidor */}
          <div>
            <label className="block text-sm font-medium mb-3">Perfil do Proprietário</label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: "CONSTRUTOR", label: "🏗️ Construtor", desc: "Construtora ou incorporadora" },
                { value: "INVESTIDOR", label: "💰 Investidor", desc: "Investidor imobiliário" },
              ].map((profile) => {
                const isSelected = formData.ownerProfiles?.includes(profile.value);
                return (
                  <button
                    key={profile.value}
                    type="button"
                    onClick={() => {
                      const profiles = formData.ownerProfiles || [];
                      if (isSelected) {
                        setFormData({ ...formData, ownerProfiles: profiles.filter((p: string) => p !== profile.value) });
                      } else {
                        setFormData({ ...formData, ownerProfiles: [...profiles, profile.value] });
                      }
                    }}
                    className={`flex-1 min-w-[180px] p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-[#0B2545] bg-[#0B2545]/5"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <span className="block font-medium">{profile.label}</span>
                    <span className="text-xs text-neutral-500">{profile.desc}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-neutral-500 mt-2">Opcional: selecione se o proprietário se encaixa em algum perfil específico</p>
          </div>

          {/* Classificação do Construtor */}
          {formData.ownerProfiles?.includes("CONSTRUTOR") && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 space-y-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300">Dados da Construtora</h4>
              
              {/* Buscar construtora cadastrada */}
              {constructors.length > 0 && (
                <div className="relative">
                  <label className="block text-sm font-medium mb-2">Selecionar Construtora Cadastrada</label>
                  <input
                    type="text"
                    value={constructorSearch || formData.constructorName || ""}
                    onChange={(e) => {
                      setConstructorSearch(e.target.value);
                      setFormData((prev: any) => ({ ...prev, constructorName: e.target.value }));
                      setShowConstructorDropdown(true);
                    }}
                    onFocus={() => setShowConstructorDropdown(true)}
                    placeholder="Buscar construtora cadastrada..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                  {showConstructorDropdown && filteredConstructors.length > 0 && constructorSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredConstructors.map((c: any) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev: any) => ({ ...prev, constructorName: c.name, constructorCnpj: c.cpf || "" }));
                            setConstructorSearch(c.name);
                            setShowConstructorDropdown(false);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 flex flex-col border-b last:border-b-0 border-neutral-100 dark:border-neutral-700"
                        >
                          <span className="font-medium text-sm">{c.name}</span>
                          {c.cpf && <span className="text-xs text-neutral-500">CNPJ: {c.cpf}</span>}
                          {c.phone && <span className="text-xs text-neutral-500">{c.phone}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {constructors.length === 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome da Construtora</label>
                    <input 
                      value={formData.constructorName || ""} 
                      onChange={e => setFormData({ ...formData, constructorName: e.target.value })}
                      placeholder="Nome da empresa"
                      className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" 
                    />
                  </div>
                )}
                <div className={constructors.length === 0 ? "" : "md:col-span-2"}>
                  <label className="block text-sm font-medium mb-2">CNPJ</label>
                  <input 
                    value={formData.constructorCnpj || ""} 
                    onChange={e => setFormData({ ...formData, constructorCnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Classificação do Investidor */}
          {formData.ownerProfiles?.includes("INVESTIDOR") && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 space-y-4">
              <h4 className="font-medium text-green-800 dark:text-green-300">Perfil do Investidor</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "PESSOA_FISICA", label: "Pessoa Física" },
                  { value: "PESSOA_JURIDICA", label: "Pessoa Jurídica" },
                  { value: "FUNDO", label: "Fundo de Investimento" },
                  { value: "HOLDING", label: "Holding Familiar" },
                ].map((type) => (
                  <label key={type.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    <input
                      type="radio"
                      name="investorType"
                      value={type.value}
                      checked={formData.investorType === type.value}
                      onChange={(e) => setFormData({ ...formData, investorType: e.target.value })}
                      className="w-4 h-4 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Observações - Sempre visível */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 space-y-3">
        <h4 className="font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
          📝 Observações
          <span className="text-xs font-normal text-amber-600 dark:text-amber-400">(uso interno - não aparece no site)</span>
        </h4>
        <textarea
          value={formData.brokerNotes || ""}
          onChange={(e) => setFormData({ ...formData, brokerNotes: e.target.value })}
          placeholder="Observações internas sobre o imóvel, negociação, proprietário, etc..."
          rows={4}
          className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-700 rounded-xl resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        <p className="text-xs text-amber-600 dark:text-amber-400">
          💡 Use este campo para anotar informações importantes que só a equipe deve ver. Também aparece na aba Observações da ficha do imóvel.
        </p>
      </div>
    </div>
  );
}

// STEP 7 - DOCUMENTOS
function Step7({ formData, setFormData, handleDocumentUpload, matriculaInputRef, iptuInputRef, certidaoInputRef }: any) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl">
        <p className="text-sm text-yellow-700 dark:text-yellow-400">📄 Documentação pode ser adicionada depois</p>
      </div>
      
      {/* Matrícula */}
      <div>
        <label className="block text-sm font-medium mb-2">Nº Matrícula</label>
        <input
          ref={matriculaInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleDocumentUpload("matricula", e.target.files?.[0] || null)}
          className="hidden"
        />
        <div className="flex gap-2">
          <input value={formData.matriculaNumber} onChange={e => setFormData((prev: any) => ({ ...prev, matriculaNumber: e.target.value }))}
            placeholder="Número da matrícula"
            className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
          <button 
            type="button" 
            onClick={() => matriculaInputRef.current?.click()}
            className={`px-4 py-2.5 border rounded-xl transition-colors ${formData.matriculaFileName ? "border-green-500 bg-green-50 dark:bg-green-500/10 text-green-600" : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
          >
            {formData.matriculaFileName ? `✓ ${formData.matriculaFileName.slice(0, 15)}...` : "📎 Anexar"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* IPTU */}
        <div>
          <label className="block text-sm font-medium mb-2">IPTU (Inscrição)</label>
          <input
            ref={iptuInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleDocumentUpload("iptu", e.target.files?.[0] || null)}
            className="hidden"
          />
          <div className="flex gap-2">
            <input value={formData.iptuNumber} onChange={e => setFormData((prev: any) => ({ ...prev, iptuNumber: e.target.value }))}
              placeholder="Inscrição IPTU"
              className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
            <button 
              type="button" 
              onClick={() => iptuInputRef.current?.click()}
              className={`px-4 py-2.5 border rounded-xl transition-colors ${formData.iptuFileName ? "border-green-500 bg-green-50 dark:bg-green-500/10 text-green-600" : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
            >
              {formData.iptuFileName ? `✓ ${formData.iptuFileName.slice(0, 10)}...` : "📎 Anexar"}
            </button>
          </div>
        </div>

        {/* Certidão SPU */}
        <div>
          <label className="block text-sm font-medium mb-2">Certidão SPU</label>
          <input
            ref={certidaoInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleDocumentUpload("certidao", e.target.files?.[0] || null)}
            className="hidden"
          />
          <div className="flex gap-2">
            <input value={formData.certidaoSPU} onChange={e => setFormData({ ...formData, certidaoSPU: e.target.value })}
              placeholder="Número certidão"
              className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" />
            <button 
              type="button" 
              onClick={() => certidaoInputRef.current?.click()}
              className={`px-4 py-2.5 border rounded-xl transition-colors ${formData.certidaoFileName ? "border-green-500 bg-green-50 dark:bg-green-500/10 text-green-600" : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
            >
              {formData.certidaoFileName ? `✓ ${formData.certidaoFileName.slice(0, 10)}...` : "📎 Anexar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// STEP 8 - PUBLICAÇÃO
function Step8({ formData, setFormData }: any) {
  const [siteCategories, setSiteCategories] = React.useState<Array<{ type: string; title: string; isActive: boolean }>>([]);
  
  // Buscar categorias do site dinamicamente
  React.useEffect(() => {
    fetch("/api/site/property-types?active=true")
      .then(res => res.json())
      .then(data => {
        if (data.types) {
          setSiteCategories(data.types);
        }
      })
      .catch(console.error);
  }, []);

  const portais = [
    { id: "zap", name: "Grupo ZAP+", desc: "ZAP, Viva Real, OLX", color: "from-orange-500 to-red-500" },
    { id: "imovelweb", name: "Imóvel Web", desc: "Portal", color: "from-blue-500 to-blue-600" },
    { id: "olx", name: "OLX", desc: "Classificados", color: "from-purple-500 to-purple-600" },
    { id: "trovit", name: "Trovit", desc: "Agregador", color: "from-green-500 to-green-600" },
    { id: "123i", name: "123i", desc: "Portal", color: "from-cyan-500 to-cyan-600" },
    { id: "chavesnamao", name: "Chaves na Mão", desc: "Portal", color: "from-emerald-500 to-emerald-600" },
    { id: "casaminheira", name: "Casa Mineira", desc: "Portal", color: "from-red-500 to-red-600" },
    { id: "lugarcerto", name: "Lugar Certo", desc: "Portal", color: "from-indigo-500 to-indigo-600" },
  ];

  const togglePortal = (portalId: string) => {
    const current = formData.activePortals || [];
    if (current.includes(portalId)) {
      setFormData({ ...formData, activePortals: current.filter((p: string) => p !== portalId) });
    } else {
      setFormData({ ...formData, activePortals: [...current, portalId] });
    }
  };

  return (
    <div className="space-y-6">
      {/* SEO — Meta description */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <p className="font-semibold mb-1">SEO — Descrição para o Google</p>
        <p className="text-xs text-neutral-500 mb-3">Texto que aparece nos resultados de busca. Se vazio, é gerado automaticamente a partir dos dados do imóvel.</p>
        <textarea
          value={formData.metaDescription || ""}
          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value.slice(0, 160) })}
          rows={2}
          maxLength={160}
          placeholder="Ex.: Casa 4 suítes no Sua Cidade Golf Club, 450m², piscina e vista para o campo. Agende sua visita com a Tappy Imob."
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
        />
        <p className="text-[10px] text-neutral-400 mt-1 text-right">{(formData.metaDescription || "").length}/160 — ideal entre 120 e 158 caracteres</p>
      </div>

      {/* Off Market */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RiEyeOffLine className="w-5 h-5 text-purple-500" />
            <div>
              <p className="font-semibold">Off Market</p>
              <p className="text-xs text-neutral-500">Imóvel exclusivo, fotos protegidas no site</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isOffMarket: !formData.isOffMarket })}
            className={`relative w-12 h-6 rounded-full transition-colors ${formData.isOffMarket ? "bg-purple-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isOffMarket ? "left-7" : "left-1"}`} />
          </button>
        </div>
      </div>

      {/* Portais Imobiliários */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <RiGlobalLine className="w-5 h-5 text-[#0B2545]" />
          Portais Imobiliários
        </h4>
        <p className="text-sm text-neutral-500 mb-4">Selecione onde o imóvel será publicado e o tipo de anúncio</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {portais.map((portal) => {
            const isActive = formData.activePortals?.includes(portal.id);
            const portalPosition = (formData as any).portalPositions?.[portal.id] || "simples";
            return (
              <div
                key={portal.id}
                className={`p-3 rounded-xl border-2 transition-all ${
                  isActive 
                    ? "border-green-500 bg-green-50 dark:bg-green-500/10" 
                    : "border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${portal.color}`} />
                    <span className="font-medium text-sm">{portal.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePortal(portal.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isActive ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
                {isActive && (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, portalPositions: { ...(formData as any).portalPositions, [portal.id]: "simples" } })}
                      className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        portalPosition === "simples" 
                          ? "bg-neutral-700 text-white" 
                          : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                      }`}
                    >
                      Simples
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, portalPositions: { ...(formData as any).portalPositions, [portal.id]: "destaque" } })}
                      className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        portalPosition === "destaque" 
                          ? "bg-amber-500 text-white" 
                          : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                      }`}
                    >
                      Destaque
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Categorias do Site */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <RiGlobalLine className="w-5 h-5 text-[#0B2545]" />
          Categorias do Site
        </h4>
        <p className="text-sm text-neutral-500 mb-4">Selecione em quais categorias o imóvel aparecerá no site</p>
        
        <div className="flex flex-wrap gap-2">
          {siteCategories.length > 0 ? (
            siteCategories.map((cat) => {
              const isSelected = formData.websiteCategories?.includes(cat.type);
              return (
                <button
                  key={cat.type}
                  type="button"
                  onClick={() => {
                    const current = formData.websiteCategories || [];
                    if (isSelected) {
                      setFormData({ ...formData, websiteCategories: current.filter((c: string) => c !== cat.type) });
                    } else {
                      setFormData({ ...formData, websiteCategories: [...current, cat.type] });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isSelected 
                      ? "bg-orange-500 text-white" 
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {cat.title}
                </button>
              );
            })
          ) : (
            <p className="text-sm text-neutral-400">Carregando categorias...</p>
          )}
        </div>
      </div>

      {/* Exibição no Site */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <RiGlobalLine className="w-5 h-5 text-[#0B2545]" />
          Exibição no Site
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div>
              <p className="font-medium">Exibir no Site</p>
              <p className="text-xs text-neutral-500">O imóvel aparece nas buscas do site</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, showOnWebsite: !formData.showOnWebsite })}
              className={`relative w-12 h-6 rounded-full transition-colors ${formData.showOnWebsite ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.showOnWebsite ? "left-7" : "left-1"}`} />
            </button>
          </div>

          {/* Seletor de modo de publicação - só aparece para VENDA_LOCACAO com site ativo */}
          {formData.showOnWebsite && formData.category === "VENDA_LOCACAO" && (
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/30">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">Publicar no site como:</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, websitePublishMode: null })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !formData.websitePublishMode
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                  }`}
                >
                  Venda + Locação
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, websitePublishMode: "VENDA" })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.websitePublishMode === "VENDA"
                      ? "bg-green-600 text-white"
                      : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                  }`}
                >
                  Só Venda
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, websitePublishMode: "LOCACAO" })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.websitePublishMode === "LOCACAO"
                      ? "bg-orange-600 text-white"
                      : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                  }`}
                >
                  Só Locação
                </button>
              </div>
              <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-1.5">A outra categoria ficará apenas para uso interno</p>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div>
              <p className="font-medium">Destaque</p>
              <p className="text-xs text-neutral-500">Aparece em destaque na home</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
              className={`relative w-12 h-6 rounded-full transition-colors ${formData.isFeatured ? "bg-amber-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isFeatured ? "left-7" : "left-1"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div>
              <p className="font-medium">Exclusividade</p>
              <p className="text-xs text-neutral-500">Badge "EXCLUSIVIDADE" no card do imóvel</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isExclusive: !formData.isExclusive })}
              className={`relative w-12 h-6 rounded-full transition-colors ${formData.isExclusive ? "bg-amber-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isExclusive ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
