/* eslint-disable no-undef */
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import cron from "node-cron";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 🔐 Conexão com o Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// =============================
// 🚀 WORKFLOW AUTOMÁTICO
// =============================

const BACKEND_URL = "https://backend-portfolio-gudw.onrender.com/api/mensagem";

async function enviarMensagemAutomatica() {
  try {
    const response = await axios.post(BACKEND_URL, {
      Nome: process.env.AUTO_NOME || "Mensagem Automática",
      Email: process.env.AUTO_EMAIL || "auto@bot.com",
      Mensagem:
        process.env.AUTO_MSG ||
        "Mensagem enviada automaticamente a cada 5 dias",
    });

    console.log("✅ Envio automático realizado:", response.data);
  } catch (error) {
    console.error("❌ Erro no envio automático:", error.message);
  }
}

// Executa a cada 5 dias às 09:00
cron.schedule("0 9 */5 * *", () => {
  console.log("⏱ Executando tarefa automática...");
  enviarMensagemAutomatica();
});

// =============================
// 📩 ROTAS
// =============================

// POST para inserir uma nova mensagem
app.post("/api/mensagem", async (req, res) => {
  console.log("🔍 Método:", req.method);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Corpo da requisição:", req.body);

  if (!req.body) {
    return res.status(400).json({ erro: "Corpo da requisição vazio" });
  }

  const { Nome, Email, Mensagem } = req.body;

  if (!Nome || !Email || !Mensagem) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  const { error } = await supabase.from("mensagens").insert([
    {
      Nome,
      Email,
      Mensagem,
      Data: new Date().toISOString(),
    },
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: "Mensagem enviada com sucesso" });
});

// GET para listar as mensagens
app.get("/api/mensagem", async (req, res) => {
  console.log("🔍 Método:", req.method);
  console.log("📨 Contatos Recebidos:");

  res.setHeader("Cache-Control", "no-store");

  const { data, error } = await supabase
    .from("mensagens")
    .select("iD, Nome, Email, Mensagem, Data")
    .order("iD", { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  console.log(data);
  return res.status(200).json(data);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});