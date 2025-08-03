import React, { useState, useCallback, useEffect } from 'react';
import { Container, Form, SubmitButton, List, DeleteButton } from './styles';
import { FaGithub, FaPlus, FaSpinner, FaBars, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';

// Componente principal
export default function Main() {
  const [newRepo, setNewRepo] = useState(''); // controla o valor de um input
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [alert, setAlert] = useState(null); // mensagem de alerta

  // É um useState com função como argumento. Isso se chama lazy initialization, e só roda uma vez quando o componente é renderizado.
  const [repositorios, setRepositorios] = useState(() => {
    try {
      const repoStorage = localStorage.getItem('repos'); // Pega a string salva na chave 'repos' do localStorage
      // Tenta converter a string para um objeto JSON, se houver
      return repoStorage ? JSON.parse(repoStorage) : [];
    } catch (e) {
      console.error('Erro ao ler localStorage:', e);
      return []; // Retorna um array vazio em caso de erro
    }
  });

  // DidMount - buscar
  // useEffect executado apenas uma vez ao montar (DidMount) para carregar os dados do localStorage
  useEffect(() => {
    try {
      const repoStorage = localStorage.getItem('repos');
      // Tenta ler o localStorage e converte para JSON, se houver
      if (repoStorage) {
        const parsed = JSON.parse(repoStorage);
        if (Array.isArray(parsed)) {
          setRepositorios(parsed);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar localStorage:', e);
    }
  }, []);

  // DidUpdate - salvar alterações
  // useEffect que escuta mudanças no estado `repositorios` e atualiza o localStorage (DidUpdate)
  useEffect(() => {
    localStorage.setItem('repos', JSON.stringify(repositorios));
  }, [repositorios]);

  // Função chamada ao submeter o formulário
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault(); // Evita recarregar a página

      async function submit() {
        setLoading(true); // Ativa o estado de carregamento
        const start = Date.now(); // Marca tempo para garantir tempo mínimo de loading
        setAlert(null); // Limpa qualquer alerta anterior

        try {
          if (newRepo.trim() === '') {
            // Validação básica: input não pode estar vazio
            throw new Error('Você precisa indicar um repositorio válido.');
          }

          // Requisição à API do GitHub (ou o endpoint que estiver usando)
          const response = await api.get(`repos/${newRepo}`);
          const repoFullName = response.data.full_name.toLowerCase();

          // Verifica se o repositório já existe na lista (evita duplicatas)
          const hasRepo = repositorios.some(
            (repo) => repo.name.toLowerCase === repoFullName
          );

          if (hasRepo) {
            throw new Error('Repositorio duplicado');
          }

          const data = {
            name: response.data.full_name,
          };
          setRepositorios([...repositorios, data]);
          setNewRepo('');
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setAlert(
              'repositorio nao encontrado. Verifique o nome e tente novamente.'
            );
          } else if (error.message) {
            setAlert(error.message);
          } else {
            setAlert('Erro inesperado. Tente novamente mais tarde');
          }
          console.error('Erro ao adicionar repositorio:', error);
        } finally {
          const elapsed = Date.now() - start;
          const minLoading = 500;

          if (elapsed < minLoading) {
            setTimeout(() => setLoading(false), minLoading - elapsed);
          } else {
            setLoading(false);
          }
        }
      }
      submit();
    },
    [newRepo, repositorios] 
  );

  function handleinputChange(e) {
    setNewRepo(e.target.value);
    setAlert(null); 
  }

  const handleDelete = useCallback(
    (repo) => {
      const find = repositorios.filter((r) => r.name !== repo);
      setRepositorios(find);
    },
    [repositorios]
  );

  // JSX retornado pela função (a interface em si)
  return (
    <Container>
      <h1>
        <FaGithub size={25} />
        Meus Repositórios
      </h1>

      {/* Formulário para adicionar novo repositório */}
      <Form onSubmit={handleSubmit} $error={alert}>
        <input
          type="text"
          placeholder="Adicionar Repositórios"
          value={newRepo}
          onChange={handleinputChange}
        />

        {/* Botão de submit muda ícone conforme o estado de loading */}
        <SubmitButton loading={loading ? 1 : 0}>
          {loading ? (
            <FaSpinner color="#FFF" size={14} />
          ) : (
            <FaPlus color="#FFF" size={14} />
          )}
        </SubmitButton>
      </Form>

      {/* Exibe mensagem de alerta, se houver */}
      {alert && <p style={{ color: 'red', marginTop: '10px' }}>{alert}</p>}

      {/* Lista de repositórios adicionados */}
      <List>
        {repositorios.map((repo) => (
          <li key={repo.name}>
            <span>
              {/* Botão de deletar */}
              <DeleteButton onClick={() => handleDelete(repo.name)}>
                <FaTrash size={14} />
              </DeleteButton>
              {repo.name}
            </span>
            <Link to={ `/repositorio/${ encodeURIComponent(repo.name) }` }>
              <FaBars size={20} />
            </Link>
          </li>
        ))}
      </List>
    </Container>
  );
}
