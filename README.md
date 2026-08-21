# Sistema de Gestão de Faturamento e Estoque

### Introdução
O sistema é uma solução distribuída para gestão de inventário e vendas, desenvolvida como avaliação técnica. A arquitetura baseia-se em microsserviços, isolando os domínios de negócio para garantir escalabilidade e baixo acoplamento. O backend é construído com C# .NET 8 (Minimal APIs) e orquestra a comunicação entre os serviços de Faturamento e Estoque, incluindo tratamento nativo de concorrência e resiliência a falhas de rede. O frontend é desenvolvido em Angular, proporcionando uma interface reativa, assíncrona e altamente responsiva ao usuário.

### Tecnologias
* **C# 12 / .NET 8** (Minimal APIs)
* **Entity Framework Core** (ORM)
* **LINQ** (Manipulação e projeção de dados)
* **PostgreSQL** (Banco de dados relacional)
* **Docker** (Conteinerização do ambiente de dados)
* **Angular** (Standalone Components)
* **RxJS** (Reatividade e barramento de eventos)
* **Angular Material** (UI/UX e design system)

### Documentação de Rotas da API

#### Rotas de Estoque (`EstoqueApi`)
Responsável pelo catálogo e integridade física dos produtos.

* **POST /produtos**: Cria um novo produto no estoque. Exemplo de uso: Envio de payload JSON com a descrição e o saldo inicial da mercadoria.
* **GET /produtos**: Lista todos os produtos cadastrados e seus respectivos saldos atualizados.
* **PUT /produtos/{id}**: Realiza o abatimento do saldo de um produto. 

#### Rotas de Faturamento (`FaturamentoApi`)
Responsável pela orquestração das vendas e geração de recibos.

* **POST /notas**: Abre uma nova nota fiscal no sistema. Gera um número sequencial (ID) e define o status inicial como "Aberta".
* **POST /notas/itens**: Adiciona um produto a uma nota existente. Exemplo de uso: Ao ser chamada, esta rota se comunica sincronicamente com a `EstoqueApi` para baixar o saldo. Possui tratamento de exceção embutido caso o serviço de estoque esteja indisponível.
* **GET /notas/{id}/imprimir**: Retorna o payload consolidado (DTO) com os dados da nota e todos os seus itens, alterando o status da venda para "Fechada".

### Tutorial de Implantação 

Certifique-se de ter o **Docker**, o **.NET 8 SDK** e o **Node.js / Angular CLI** instalados na sua máquina. O sistema é dividido em três diretórios principais: `/frontend`, `/EstoqueApi` e `/FaturamentoApi`.

**1. Banco de Dados**
O sistema utiliza o PostgreSQL. Use os comandos abaixo para subir as instâncias:
```bash
docker run --name estoque-db -e POSTGRES_PASSWORD=suasenha -p 5432:5432 -d postgres

docker run --name faturamento-db -e POSTGRES_PASSWORD=suasenha -p 5433:5432 -d postgres
```

*Atenção: Verifique os arquivos `appsettings.json` nas pastas `EstoqueApi` e `FaturamentoApi` para garantir que a Connection String aponta para a senha configurada no seu Docker.*

**2. Executando os Microsserviços (Backend)**
Abra dois terminais separados.
* No primeiro terminal, acesse a pasta `/EstoqueApi` e execute: `dotnet run`
* No segundo terminal, acesse a pasta `/FaturamentoApi` e execute: `dotnet run`

*As APIs iniciarão em portas diferentes. As rotas base do Swagger estarão disponíveis no navegador para testes manuais.*

**3. Executando a Interface (Frontend)**
Abra um terceiro terminal, acesse a pasta `/frontend` e instale as dependências:
```bash
npm install
```

Em seguida, inicie o servidor do Angular:

```bash
ng serve
```

Por fim, basta acessar a URL exibida no terminal para ter acesso à plataforma!
