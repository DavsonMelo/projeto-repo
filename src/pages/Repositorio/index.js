import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

import { Container, Owner, Loading, BackButton, IssuesList, PageActions } from './styles';
import api from '../../services/api';

export default function Repositorio() {
  const { repositorio: repoParam } = useParams();

  const [repository, setRepository] = useState({});
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Carrega os dados do repositório
  useEffect(() => {
    async function loadRepository() {
      try {
        const response = await api.get(`/repos/${repoParam}`);
        setRepository(response.data);
      } catch (error) {
        console.error('Erro ao buscar repositório:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRepository();
  }, [repoParam]);

  // Carrega issues paginadas
  useEffect(() => {
    async function loadIssues() {
      try {
        const response = await api.get(`/repos/${repoParam}/issues`, {
          params: {
            state: 'open',
            page,
            per_page: 5,
          },
        });
        setIssues(response.data);
      } catch (error) {
        console.error('Erro ao buscar issues:', error);
      }
    }

    loadIssues();
  }, [repoParam, page]);

  function goToPreviousPage() {
    setPage((prev) => Math.max(prev - 1, 1));
  }

  function goToNextPage() {
    setPage((prev) => prev + 1);
  }

  if (loading) {
    return (
      <Loading>
        <h1>Carregando...</h1>
      </Loading>
    );
  }

  const { owner = {}, name, description } = repository;

  return (
    <Container>
      <BackButton to='/'>
        <FaArrowLeft color='#000' size={30} />
      </BackButton>

      <Owner>
        <img src={owner.avatar_url} alt={owner.login} />
        <h1>{name}</h1>
        <p>{description}</p>
      </Owner>

      <IssuesList>
        {issues.map((issue) => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />
            <div>
              <strong>
                <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                  {issue.title}
                </a>
                {issue.labels.map((label) => (
                  <span key={String(label.id)}>{label.name}</span>
                ))}
              </strong>
              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </IssuesList>

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
