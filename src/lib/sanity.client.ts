import { createClient, type ClientConfig } from "@sanity/client";

// 1. Variáveis de ambiente
const projectId  = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset    = import.meta.env.PUBLIC_SANITY_DATASET;
const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION ?? "2026-04-18";
const token      = import.meta.env.SANITY_READ_TOKEN;

// 2. Flag pra saber se o Sanity está configurado
export const isSanityConfigured = Boolean(projectId && dataset);

// 3. Config do cliente (só monta se tiver as variáveis necessárias)
const config: ClientConfig | null = isSanityConfigured
  ? { projectId, dataset, apiVersion, token, useCdn: !token, perspective: "published" }
  : null;

// 4. Cliente exportado
export const sanityClient = config ? createClient(config) : null;