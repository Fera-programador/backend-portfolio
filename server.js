import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o banco SQLite
let db;
const initDB = async () => {
  db = await open({
    filename: "./contatos.db",
    driver: sqlite3.Database,
  });

  // Cria a tabela se não existir
  await db.run(`
    CREATE TABLE IF NOT EXISTS contatos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      mensagem TEXT NOT NULL
    )
  `);
};

initDB();

// Rota GET para listar os contatos
app.get("/", async (req, res) => {
  const contatos = await db.all("SELECT * FROM contatos");
  let html = `
    <h2>✅ Contatos Recebidos</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="font-family: sans-serif;">
      <tr><th>ID</th><th>Nome</th><th>Email</th><th>Mensagem</th></tr>
  `;
  contatos.forEach((c) => {
    html += `<tr><td>${c.id}</td><td>${c.nome}</td><td>${c.email}</td><td>${c.mensagem}</td></tr>`;
  });
  html += "</table>";
  res.send(html);
});

// Rota GET para retornar os contatos em JSON
app.get("/api/contato", async (req, res) => {
  try {
    const contatos = await db.all("SELECT * FROM contatos");
    console.log("✅📋 Contatos recebidos:", contatos); // Exibe no console
    res.json(contatos); // Retorna como JSON
  } catch (err) {
    console.error("Erro ao buscar contatos:", err);
    res.status(500).json({ error: "Erro ao buscar contatos" });
  }
});

// Rota POST para salvar novo contato
app.post("/api/contato", async (req, res) => {
  const { Nome, Email, Mensagem } = req.body;

  if (!Nome || !Email || !Mensagem) {
    return res.status(400).json({ success: false, message: "Campos obrigatórios ausentes." });
  }

  try {
    await db.run(
      "INSERT INTO contatos (nome, email, mensagem) VALUES (?, ?, ?)",
      Nome,
      Email,
      Mensagem
    );

    res.status(200).json({ success: true, message: "✅ Mensagem salva com sucesso!" });
  } catch (err) {
    console.error("Erro ao inserir no banco:", err);
    res.status(500).json({ success: false, message: "Erro no servidor." });
  }
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
