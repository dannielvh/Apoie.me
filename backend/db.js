const centros = [
  { id: 1, nome: "Centro de Apoio Rio Grande do Sul", cidade: "Porto Alegre" },
  { id: 2, nome: "Centro de Apoio Santa Catarina", cidade: "Florianópolis" }
];

const usuarios = [
  { id: 1, nome: "Maria", email: "maria@email.com", cidade: "Belo Horizonte" }
];

const doacoes = [
  { id: 1, usuarioId: 1, centroId: 1, item: "Água mineral", categoria: "Alimentação", quantidade: 10, status: "confirmada" },
  { id: 2, usuarioId: 1, centroId: 1, item: "Cobertor", categoria: "Vestuário", quantidade: 5, status: "pendente" }
];

const necessidades = [
  {
    id: 1,
    centroId: 1,
    item: "Água mineral",
    categoria: "Alimentação",
    quantidadeNecessaria: 100,
    quantidadeAtendida: 65,
    urgencia: "crítica"
  },
  {
    id: 2,
    centroId: 1,
    item: "Cobertor",
    categoria: "Vestuário",
    quantidadeNecessaria: 50,
    quantidadeAtendida: 20,
    urgencia: "alta"
  },
  {
    id: 3,
    centroId: 2,
    item: "Arroz",
    categoria: "Alimentação",
    quantidadeNecessaria: 200,
    quantidadeAtendida: 80,
    urgencia: "crítica"
  },
  {
    id: 4,
    centroId: 2,
    item: "Kit de higiene",
    categoria: "Higiene",
    quantidadeNecessaria: 100,
    quantidadeAtendida: 100,
    urgencia: "media"
  },
  {
    id: 5,
    centroId: 1,
    item: "Colchonete",
    categoria: "Abrigo",
    quantidadeNecessaria: 30,
    quantidadeAtendida: 10,
    urgencia: "alta"
  }
];

module.exports = { centros, usuarios, doacoes, necessidades };
