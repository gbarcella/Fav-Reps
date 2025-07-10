import {useState, useEffect} from 'react';
import api from '../../services/api';
import { useParams } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';
import { Container, Owner, Loading, BackButton, IssuesList, PageActions } from './styles';

export default function Repositorio(){

    const [repositorio, setRepositorio] = useState({});
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const { nomeRepositorio } = useParams();
    const nomeRepo = decodeURIComponent(nomeRepositorio);

    useEffect(() => {
        async function load() {

            const [repositorioData, issuesData] = await Promise.all([
                api.get(`/repos/${nomeRepo}`),
                api.get(`/repos/${nomeRepo}/issues`, {
                    params:{
                        state: 'open',
                        per_page: 5
                    }
                })
            ]);

            setRepositorio(repositorioData.data)
            setIssues(issuesData.data)
            setLoading(false);
        }
        load();

    }, [nomeRepo]);

    useEffect(() => {

        async function loadIssue() {

            const response = await api.get(`/repos/${nomeRepo}/issues`, {
                params:{
                    state: 'open',
                    page: page,
                    per_page: 5
                }
            })

            setIssues(response.data);
        }

        loadIssue();

    }, [nomeRepo, page]);

    function handlePage(action) {
        setPage(action === 'back' ? page -1 : page + 1);

    }

    if(loading) {
        return(
            <Loading>
                <h1>Carregando..</h1> 
            </Loading>
        )
    }

    return(
        <Container>
            <BackButton to={'/'}>
                <FaArrowLeft color="#000" size={30}></FaArrowLeft>
            </BackButton>
            <Owner>
                <img src={repositorio.owner?.avatar_url} alt={repositorio.owner?.login}></img>
                <h1>{repositorio.name}</h1>
                <p>{repositorio.description}</p>
            </Owner>

            <IssuesList>
                {issues.map(issue => (
                    <li key={String(issue.id)}>
                        <img src={issue.user.avatar_url} alt={issue.user.login}/>
                        <div>
                            <strong>
                                <a href={issue.html_url}>{issue.title}</a>

                                {issue.labels.map(label => (
                                    <span key={String(label.id)}>{label.name}</span>
                                ))}
                            </strong>
                            <p>{issue.user.login}</p>
                        </div>

                    </li>
                ))}
            </IssuesList>
            
            <PageActions>
                <button 
                type='button' 
                onClick={() => handlePage('back')}
                disabled={page < 2}
                >Voltar

                </button>

                <button type='button' onClick={() => handlePage('next')}>Próximo
                    
                </button>
            </PageActions>


        </Container>
    );
}