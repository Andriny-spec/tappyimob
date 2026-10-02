"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Lead, LeadStatus, KanbanColumn, leadStatusColors, leadStatusLabels } from "@/types/lead";

const API_BASE = "/api/admin/leads";

// Fetch leads
async function fetchLeads(params?: {
  status?: LeadStatus;
  search?: string;
  corretorId?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.corretorId) searchParams.set("corretorId", params.corretorId);

  const res = await fetch(`${API_BASE}?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Erro ao buscar leads");
  return res.json();
}

// Fetch single lead
async function fetchLead(id: string) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Erro ao buscar lead");
  return res.json();
}

// Create lead
async function createLead(data: Partial<Lead>) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar lead");
  return res.json();
}

// Update lead
async function updateLead({ id, ...data }: Partial<Lead> & { id: string }) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar lead");
  return res.json();
}

// Delete lead
async function deleteLead(id: string) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao excluir lead");
  return res.json();
}

// Notes
async function addNote(leadId: string, content: string) {
  const res = await fetch(`${API_BASE}/${leadId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Erro ao adicionar nota");
  return res.json();
}

async function deleteNote(leadId: string, noteId: string) {
  const res = await fetch(`${API_BASE}/${leadId}/notes?noteId=${noteId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao excluir nota");
  return res.json();
}

// Schedules
async function addSchedule(leadId: string, data: {
  type: string;
  date: string;
  time: string;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE}/${leadId}/schedules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao adicionar agendamento");
  return res.json();
}

async function deleteSchedule(leadId: string, scheduleId: string) {
  const res = await fetch(`${API_BASE}/${leadId}/schedules?scheduleId=${scheduleId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao excluir agendamento");
  return res.json();
}

// Hook principal
export function useLeads(params?: {
  status?: LeadStatus;
  search?: string;
  corretorId?: string;
}) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: () => fetchLeads(params),
  });
}

// Hook para lead individual
export function useLead(id: string) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => fetchLead(id),
    enabled: !!id,
  });
}

// Hook para mutations
export function useLeadMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const update = useMutation({
    mutationFn: updateLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ leadId, content }: { leadId: string; content: string }) =>
      addNote(leadId, content),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: ({ leadId, noteId }: { leadId: string; noteId: string }) =>
      deleteNote(leadId, noteId),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const addScheduleMutation = useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: any }) =>
      addSchedule(leadId, data),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: ({ leadId, scheduleId }: { leadId: string; scheduleId: string }) =>
      deleteSchedule(leadId, scheduleId),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  return {
    create,
    update,
    remove,
    addNote: addNoteMutation,
    deleteNote: deleteNoteMutation,
    addSchedule: addScheduleMutation,
    deleteSchedule: deleteScheduleMutation,
  };
}

// Hook para Kanban com colunas
export function useKanbanLeads() {
  const { data, isLoading, error } = useLeads();

  const columns: KanbanColumn[] = [
    { id: "col-1", title: "Novos", status: "NOVO", color: leadStatusColors.NOVO, icon: "inbox", order: 1, automationEnabled: false, automationRules: [], leads: [] },
    { id: "col-2", title: "Contatados", status: "CONTATADO", color: leadStatusColors.CONTATADO, icon: "phone", order: 2, automationEnabled: false, automationRules: [], leads: [] },
    { id: "col-3", title: "Qualificados", status: "QUALIFICADO", color: leadStatusColors.QUALIFICADO, icon: "star", order: 3, automationEnabled: false, automationRules: [], leads: [] },
    { id: "col-4", title: "Em Negociação", status: "NEGOCIANDO", color: leadStatusColors.NEGOCIANDO, icon: "handshake", order: 4, automationEnabled: false, automationRules: [], leads: [] },
    { id: "col-5", title: "Fechados", status: "FECHADO", color: leadStatusColors.FECHADO, icon: "check", order: 5, automationEnabled: false, automationRules: [], leads: [] },
  ];

  if (data?.grouped) {
    columns.forEach((col) => {
      col.leads = data.grouped[col.status] || [];
    });
  }

  return { columns, isLoading, error, leads: data?.leads || [] };
}
