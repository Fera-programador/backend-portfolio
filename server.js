/* eslint-disable no-undef */
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config(); // Para carregar variáveis de ambiente de um .env

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 🔐 Conexão com o Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;


const supabase = createClient(supabaseUrl, supabaseKey);

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
