"use server";

import { createServerAdmin } from "@/lib/supabase/server";

export interface Client {
  id: number;
  name: string;
  cin: string;
  phone: string;
  email: string | null;
  address: string | null;
  birth_date: string | null;
  created_at: string;
}

// Criar cliente
export async function createClient(data: {
  name: string;
  cin: string;
  phone: string;
  email?: string;
  address?: string;
  birth_date?: string;
}) {
  const supabase = await createServerAdmin();

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      name: data.name,
      cin: data.cin,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
      birth_date: data.birth_date || null,
    })
    .select()
    .single();

  if (error || !client) {
    return { success: false, message: "Error al crear cliente: " + error?.message };
  }

  return { success: true, client };
}

// Listar clientes
export async function getClients() {
  const supabase = await createServerAdmin();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }

  return clients || [];
}

// Buscar cliente por ID
export async function getClientById(id: number) {
  const supabase = await createServerAdmin();

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !client) {
    return null;
  }

  return client;
}

// Atualizar cliente
export async function updateClient(
  id: number,
  data: {
    name: string;
    cin: string;
    phone: string;
    email?: string;
    address?: string;
    birth_date?: string;
  }
) {
  const supabase = await createServerAdmin();

  const { data: client, error } = await supabase
    .from("clients")
    .update({
      name: data.name,
      cin: data.cin,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
      birth_date: data.birth_date || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !client) {
    return { success: false, message: "Error al actualizar cliente: " + error?.message };
  }

  return { success: true, client };
}

// Contar clientes
export async function getClientsCount() {
  const supabase = await createServerAdmin();

  const { count, error } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error counting clients:", error);
    return 0;
  }

  return count || 0;
}

// Excluir cliente
export async function deleteClient(id: number) {
  const supabase = await createServerAdmin();

  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) {
    return { success: false, message: "Error al eliminar cliente: " + error.message };
  }

  return { success: true };
}



