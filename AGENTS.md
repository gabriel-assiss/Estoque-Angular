
# AGENTS.md

## Projeto
Frontend de um sistema de gerenciamento de estoque.
- Angular e TypeScript.
- Backend em Java com Spring Boot.
- API REST com MySQL gerenciado pelo backend.

## Regras gerais
- Analise o projeto antes de fazer alterações.
- Respeite a estrutura e os padrões existentes.
- Não invente endpoints, DTOs ou regras de negócio.
- Consulte o backend quando precisar conhecer os contratos da API.
- Evite código duplicado e abstrações desnecessárias.
- Priorize soluções simples e fáceis de manter.

## Angular
- Utilize componentes standalone.
- Organize o código por funcionalidades.
- Separe componentes, serviços e interfaces.
- Utilize serviços para requisições HTTP.
- Utilize tipagem adequada e evite `any`.
- Prefira Reactive Forms para formulários.
- Não concentre regras de negócio nos componentes.

## Interface
- Utilize uma identidade visual consistente.
- Cores principais: branco, preto e amarelo.
- Desenvolva interfaces responsivas e acessíveis.
- Disponibilize modos claro e escuro.
- Trate estados de carregamento, erro e ausência de dados.

## API
- Utilize HttpClient.
- Centralize a URL da API.
- Respeite os DTOs e contratos do backend.
- Implemente tratamento adequado de erros.
- Respeite a paginação do Spring Data.

## Testes
- Teste componentes e serviços relevantes.
- Execute os testes e o build após alterações.
- Não considere uma funcionalidade concluída apenas porque compila.

## Restrições
- Não modifique o backend.
- Não instale dependências sem necessidade.
- Não remova funcionalidades sem autorização.
- Não faça commits ou pushes sem solicitação.
- Não execute comandos destrutivos sem autorização.

## Fluxo de trabalho
1. Analise antes de implementar.
2. Planeje alterações complexas.
3. Implemente seguindo os padrões do projeto.
4. Execute testes e build.
5. Informe o que foi alterado e eventuais problemas.
6. sempre que fizer alguma alteração, Altere a versão da aplicação no footer; ex: de 1.1 para 1.2.

## Documentação
- Consulte `docs/backend.md` antes de integrar funcionalidades com a API.
- Não invente endpoints, DTOs ou propriedades.
- Caso a documentação não contenha alguma informação, sinalize antes de assumir.

## Documentação
- Consulte `docs/backend.md` antes de integrar funcionalidades com a API.
- Não invente endpoints, DTOs ou propriedades.
- Caso a documentação não contenha alguma informação, sinalize antes de assumir.