import React, { useState, useEffect } from 'react'; // Importa hooks do React
import { useParams } from 'react-router-dom'; // Hook para acessar parâmetros da URL
import { FaArrowLeft } from 'react-icons/fa'; // Ícone de seta para voltar

import {
  Container,      // Componente estilizado para o layout principal
  Owner,          // Componente estilizado para informações do dono do repositório
  Loading,        // Componente estilizado para tela de carregamento
  BackButton,     // Componente estilizado para botão de voltar
  IssuesList,     // Componente estilizado para lista de issues
  PageActions,    // Componente estilizado para paginação
  FilterList,     // Componente estilizado para filtros de issues
} from './styles';
import api from '../../services/api'; // Importa configuração da API

// Array de filtros para issues (todas, abertas, fechadas)
const filters = [
  { state: 'all', label: 'todas', active: true },
  { state: 'open', label: 'abertas', active: false },
  { state: 'closed', label: 'fechadas', active: false },
];

export default function Repositorio() {
  const { repositorio: repoParam } = useParams(); // Obtém o parâmetro da URL

  // Estado para armazenar dados do repositório
  const [repository, setRepository] = useState({});
  // Estado para armazenar as issues do repositório
  const [issues, setIssues] = useState([]);
  // Estado para controlar o carregamento da página
  const [loading, setLoading] = useState(true);
  // Estado para controlar a página atual da paginação
  const [page, setPage] = useState(1);
  // Estado para controlar o filtro selecionado
  const [filterIndex, setFilterIndex] = useState(0); 

  // Efeito para carregar os dados do repositório ao montar ou quando repoParam mudar
  useEffect(() => {
    async function loadRepository() {
      try {
        const response = await api.get(`/repos/${repoParam}`); // Busca dados do repositório na API
        setRepository(response.data); // Salva dados no estado
      } catch (error) {
        console.error('Erro ao buscar repositório:', error); // Loga erro se houver
      } finally {
        setLoading(false); // Finaliza carregamento
      }
    }

    loadRepository(); // Chama função de carregamento
  }, [repoParam]); // Executa quando repoParam mudar

  // Efeito para carregar as issues do repositório quando repoParam, page ou filterIndex mudar
  useEffect(() => {
    async function loadIssues() {
      try {
        const response = await api.get(`/repos/${repoParam}/issues`, {
          params: {
            state: filters[filterIndex].state, // Filtro de estado da issue
            page,                             // Página atual
            per_page: 5,                      // Quantidade por página
          },
        });
        setIssues(response.data); // Salva issues no estado
      } catch (error) {
        console.error('Erro ao buscar issues:', error); // Loga erro se houver
      }
    }

    loadIssues(); // Chama função de carregamento
  }, [repoParam, page, filterIndex]); // Executa quando algum desses mudar

  // Função para ir para a página anterior (não permite menor que 1)
  function goToPreviousPage() {
    setPage((prev) => Math.max(prev - 1, 1));
  }

  // Função para ir para a próxima página
  function goToNextPage() {
    setPage((prev) => prev + 1);
  }

  // Função para trocar o filtro de issues
  function handleFilter(index) {
    setFilterIndex(index);
  }

  // Se estiver carregando, exibe tela de loading
  if (loading) {
    return (
      <Loading>
        <h1>Carregando...</h1>
      </Loading>
    );
  }

  // Desestrutura dados do repositório para exibir
  const { owner = {}, name, description } = repository;

  return (
    <Container>
      {/* Botão para voltar para a página inicial */}
      <BackButton to="/">
        <FaArrowLeft color="#000" size={30} />
      </BackButton>

      {/* Exibe informações do dono do repositório */}
      <Owner>
        <img src={owner.avatar_url} alt={owner.login} />
        <h1>{name}</h1>
        <p>{description}</p>
      </Owner>

      {/* Lista de filtros para as issues */}
      <FilterList active={filterIndex}>
        {filters.map((filter, index) => (
          <button
            type="button"
            key={filter.label}
            onClick={() => handleFilter(index)}
          >
            {filter.label}
          </button>
        ))}
      </FilterList>

      {/* Lista de issues do repositório */}
      <IssuesList>
        {issues.map((issue) => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />
            <div>
              <strong>
                <a
                  href={issue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {issue.title}
                </a>
                {/* Exibe labels da issue */}
                {issue.labels.map((label) => (
                  <span key={String(label.id)}>{label.name}</span>
                ))}
              </strong>
              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </IssuesList>

      {/* Botões de paginação */}
      <PageActions>
        <button type="button" onClick={goToPreviousPage} disabled={page === 1}>
          Voltar
        </button>
        <h4>Página {page}</h4>
        <button type="button" onClick={goToNextPage}>
          Próxima
        </button>
      </PageActions>
    </Container>
  );
}