# 🧠 Pair Programming Survival Guide

# Guia de apoio — Pair Programming Node.js e React

## REGRA PRINCIPAL

Eu não preciso saber tudo de memória.

Eu preciso:

1. entender o problema;
2. explicar o que estou pensando;
3. construir uma solução simples;
4. validar se funciona;
5. melhorar se houver tempo.

---

# 1. PRIMEIROS MINUTOS

Antes de escrever código, dizer:

> Antes de começar, vou confirmar se entendi corretamente o problema.

Depois explicar com minhas palavras:

> Pelo que entendi, precisamos receber ou exibir X, aplicar a regra Y e produzir o resultado Z. É isso?

## Perguntas para destravar o problema

Escolher apenas as perguntas relevantes:

- Qual é a entrada?
- Qual é a saída esperada?
- Existe um exemplo?
- Como devemos tratar entradas inválidas?
- Precisamos persistir dados?
- Posso usar TypeScript?
- Posso instalar bibliotecas?
- Existe alguma restrição de arquitetura?
- Precisamos escrever testes?
- Devemos considerar performance ou alto volume?
- Posso alterar a estrutura do código existente?

## Se o requisito estiver confuso

Dizer:

> Vou usar um exemplo concreto para confirmar meu entendimento.

Exemplo:

```text
Entrada: ...
Resultado esperado: ...
```

---

# 2. ANTES DE CODAR

Fazer esta análise:

```text
O que entra?
O que precisa acontecer?
O que deve sair?
O que pode dar errado?
```

Depois dizer:

> Vou começar pela solução mais simples que atende ao cenário principal. Depois adicionamos validações e melhorias.

## Ordem segura

```text
1. Caminho principal
2. Validação
3. Tratamento de erro
4. Testes
5. Refatoração
6. Melhorias de produção
```

---

# 3. QUANDO FOR UM PROBLEMA DE LÓGICA

Perguntar:

- Preciso percorrer uma coleção?
- Preciso encontrar algo?
- Preciso contar ocorrências?
- Preciso evitar duplicados?
- Preciso agrupar dados?
- Preciso ordenar?
- Preciso transformar uma entrada?

## Atalhos mentais

### Preciso procurar algo rapidamente

Usar:

```ts
Map;
Set;
```

### Preciso remover duplicados

```ts
const uniqueValues = [...new Set(values)];
```

### Preciso transformar uma lista

```ts
items.map(...)
```

### Preciso filtrar uma lista

```ts
items.filter(...)
```

### Preciso encontrar um item

```ts
items.find(...)
```

### Preciso verificar se existe

```ts
items.some(...)
```

### Preciso verificar se todos atendem

```ts
items.every(...)
```

### Preciso acumular ou agrupar

```ts
items.reduce(...)
```

### Preciso ordenar

```ts
const sorted = [...items].sort((a, b) => a - b);
```

Evitar alterar a entrada original sem necessidade.

---

# 4. QUANDO FOR NODE.JS

Pensar neste fluxo:

```text
Entrada
↓
Validação
↓
Regra de negócio
↓
Acesso a dados ou integração
↓
Resposta
```

## Estrutura básica

```text
Controller ou Handler
↓
Service ou Use Case
↓
Repository ou Client
```

## Perguntas mentais

- A regra está misturada com HTTP?
- Preciso validar a entrada?
- Essa função pode falhar?
- O erro está sendo tratado?
- As operações podem rodar em paralelo?
- Preciso preservar consistência?
- Existe risco de executar duas vezes?
- O código está fácil de testar?

---

# 5. MODELO NODE PARA COMEÇAR

```ts
type Input = {
  value: string;
};

type Output = {
  result: string;
};

export class ProcessDataService {
  async execute(input: Input): Promise<Output> {
    this.validate(input);

    const result = await this.process(input.value);

    return { result };
  }

  private validate(input: Input): void {
    if (!input.value?.trim()) {
      throw new Error("Value is required");
    }
  }

  private async process(value: string): Promise<string> {
    return value.trim();
  }
}
```

Explicar:

> Estou mantendo a validação e a regra separadas para facilitar leitura e testes.

---

# 6. ASYNC E PROMISES

## Uma operação depende da anterior

```ts
const user = await findUser();
const orders = await findOrders(user.id);
```

## Operações independentes

```ts
const [user, products] = await Promise.all([findUser(), findProducts()]);
```

Dizer:

> Como essas operações são independentes, vou executá-las em paralelo.

## Uma falha não pode cancelar as outras

```ts
const results = await Promise.allSettled([taskOne(), taskTwo()]);
```

## Regra rápida

```text
Promise.all
Todas precisam funcionar.

Promise.allSettled
Quero saber o resultado de todas.

Promise.race
Quero a primeira que finalizar.

Promise.any
Quero a primeira que funcionar.
```

---

# 7. TRATAMENTO DE ERRO NO NODE

Evitar:

```ts
throw "erro";
```

Preferir:

```ts
throw new Error("Something went wrong");
```

Ou:

```ts
class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}
```

## Códigos HTTP

```text
200 — sucesso
201 — criado
204 — sucesso sem conteúdo
400 — requisição inválida
401 — não autenticado
403 — sem permissão
404 — não encontrado
409 — conflito
422 — regra ou validação semântica
500 — erro inesperado
```

---

# 8. QUANDO FOR REACT

Pensar primeiro nos estados:

```text
Loading
Error
Empty
Success
```

## Perguntas mentais

- De onde vêm os dados?
- Esse estado é local ou remoto?
- Quem é responsável pela chamada?
- O componente está fazendo coisas demais?
- Existe efeito colateral?
- O usuário recebe feedback?
- A tela funciona com lista vazia?
- Existe acessibilidade básica?
- Existe risco de requisição duplicada?

---

# 9. MODELO REACT PARA COMEÇAR

```tsx
type User = {
  id: string;
  name: string;
};

type UserListProps = {
  users: User[];
  isLoading: boolean;
  error?: string;
};

export function UserList({ users, isLoading, error }: UserListProps) {
  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (users.length === 0) {
    return <p>Nenhum usuário encontrado.</p>;
  }

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

Explicar:

> Estou tratando explicitamente os estados de carregamento, erro, lista vazia e sucesso.

---

# 10. USEEFFECT

Usar quando existe sincronização com algo externo:

- API;
- evento do navegador;
- timer;
- subscription;
- armazenamento externo.

Não usar apenas para calcular valor.

Evitar:

```tsx
const [fullName, setFullName] = useState("");

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

Preferir:

```tsx
const fullName = `${firstName} ${lastName}`;
```

## Exemplo de busca

```tsx
useEffect(() => {
  const controller = new AbortController();

  async function loadUsers() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/users", {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  loadUsers();

  return () => controller.abort();
}, []);
```

---

# 11. ESTADO NO REACT

## Estado local

Usar quando apenas um componente ou poucos filhos precisam.

```tsx
useState;
```

## Context

Usar para dados compartilhados e relativamente estáveis:

- tema;
- autenticação;
- idioma;
- configurações.

## Redux ou Zustand

Usar para estado global complexo, com várias interações.

## TanStack Query

Usar para estado remoto:

- cache;
- loading;
- error;
- retry;
- invalidação;
- refetch.

Frase segura:

> Estado do servidor e estado da interface têm necessidades diferentes. Para dados remotos, eu avaliaria uma biblioteca como TanStack Query.

---

# 12. PERFORMANCE NO REACT

Não otimizar automaticamente.

Primeiro dizer:

> Eu evitaria memoização prematura. Só adicionaria se existisse um problema real de renderização.

## Ferramentas

```text
React.memo
Evita renderização quando props não mudam.

useMemo
Memoriza um valor calculado.

useCallback
Memoriza a referência de uma função.

lazy
Carrega um módulo sob demanda.
```

## Antes de usar, verificar

- A operação é realmente cara?
- A referência está causando renderizações?
- O componente renderiza muitas vezes?
- Existe evidência no profiler?

---

# 13. TYPESCRIPT

## Evitar `any`

Preferir:

```ts
unknown;
```

Exemplo:

```ts
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}
```

## `type` ou `interface`

Regra prática:

```text
interface
Bom para contratos de objetos e extensões.

type
Bom para unions, intersections e composições.
```

Não transformar isso em discussão dogmática.

## Utility Types

```ts
Partial<User>;
Pick<User, "id" | "name">;
Omit<User, "password">;
Record<string, User>;
Readonly<User>;
```

---

# 14. TESTES

Não preciso testar tudo.

Priorizar:

```text
1. Caminho feliz
2. Erro principal
3. Caso de borda importante
```

## Estrutura mental

```text
Arrange
Act
Assert
```

## Exemplo Node

```ts
describe("ProcessDataService", () => {
  it("processes a valid value", async () => {
    const service = new ProcessDataService();

    const result = await service.execute({
      value: " test ",
    });

    expect(result).toEqual({
      result: "test",
    });
  });

  it("rejects an empty value", async () => {
    const service = new ProcessDataService();

    await expect(
      service.execute({
        value: "",
      }),
    ).rejects.toThrow("Value is required");
  });
});
```

## Exemplo React

```tsx
render(<UserList users={[]} isLoading={false} />);

expect(screen.getByText("Nenhum usuário encontrado.")).toBeInTheDocument();
```

## Frase segura

> Vou testar o comportamento mais importante, evitando acoplamento excessivo à implementação.

---

# 15. SE HOUVER BANCO DE DADOS

Perguntar:

- Precisa de transação?
- Pode haver concorrência?
- Existe restrição de unicidade?
- Qual será o volume?
- Existe paginação?
- A consulta precisa de índice?
- Existe risco de N+1?

## Paginação

```text
Offset
Mais simples, mas pode piorar em grandes volumes.

Cursor
Mais estável e eficiente para grandes conjuntos.
```

## Concorrência

Não confiar apenas em:

```text
Consultar se existe
↓
Criar
```

Também usar restrição de unicidade no banco.

Frase:

> A validação na aplicação melhora a experiência, mas a integridade deve ser garantida no banco.

---

# 16. SE HOUVER API EXTERNA

Pensar em:

- timeout;
- retry;
- erro;
- autenticação;
- rate limit;
- idempotência;
- circuit breaker;
- observabilidade.

Não implementar tudo automaticamente.

Dizer:

> Para o exercício vou tratar sucesso e falha. Em produção, eu avaliaria timeout, retry com backoff e métricas.

---

# 17. SE PERGUNTAREM SOBRE ARQUITETURA

Não começar falando de microserviços.

Perguntar:

- Qual é o problema atual?
- Qual é o volume?
- Quantos times trabalham nisso?
- Quais partes mudam juntas?
- Existe necessidade de escala independente?
- Qual é o custo operacional aceitável?

Frase segura:

> Eu começaria com a solução mais simples que preserve separação de responsabilidades. Só adicionaria distribuição quando existisse uma necessidade concreta.

---

# 18. SE EU NÃO LEMBRAR UMA SINTAXE

Dizer:

> Eu conheço o comportamento, mas não lembro a assinatura exata. Vou confirmar rapidamente na documentação.

Ou:

> Não lembro o nome exato dessa função agora. Posso implementar de uma forma equivalente e depois ajustar.

Não fingir.

Não entrar em pânico.

Não pedir desculpas várias vezes.

---

# 19. SE EU TRAVAR

Usar esta sequência:

```text
1. Voltar ao exemplo.
2. Reduzir o problema.
3. Escrever o resultado esperado.
4. Resolver manualmente.
5. Transformar os passos em código.
```

Dizer:

> Vou reduzir para um exemplo menor e transformar o raciocínio manual em etapas.

Ou:

> Estou considerando duas abordagens. Vou listar os trade-offs antes de escolher.

---

# 20. SE O CÓDIGO DER ERRADO

Dizer:

> O teste mostrou que uma premissa minha estava errada. Vou verificar onde o comportamento divergiu.

Depois:

```text
1. Ler a mensagem de erro.
2. Confirmar a entrada.
3. Verificar o ponto da falha.
4. Corrigir uma coisa por vez.
5. Rodar novamente.
```

Não apagar tudo imediatamente.

---

# 21. COMO RECEBER SUGESTÕES

## Quando concordar

> Faz sentido. Sua sugestão reduz a complexidade dessa parte. Vou ajustar.

## Quando houver trade-off

> Essa alternativa melhora X, mas aumenta Y. Para este cenário, acho que vale seguir com ela porque...

## Quando preferir manter

> Entendi o ponto. Eu manteria esta abordagem neste momento porque precisamos de X, mas a alternativa seria válida se tivéssemos Y.

---

# 22. FRASES PARA USAR DURANTE A SESSÃO

## Para começar

> Vou confirmar o entendimento e depois propor uma primeira abordagem.

## Para explicar escolha

> Estou escolhendo essa solução porque ela é simples, legível e atende aos requisitos atuais.

## Para evitar exagero

> Existe uma solução mais sofisticada, mas acho que adicionaria complexidade sem benefício neste momento.

## Para envolver o par

> Essa premissa faz sentido para você?

## Para organizar

> Vou fechar primeiro o fluxo principal e depois tratar os cenários de erro.

## Para testar

> Vou criar um exemplo pequeno para verificar se a lógica está correta.

## Para refatorar

> Agora que o comportamento está funcionando, vou melhorar nomes e responsabilidades.

## Para falar de produção

> Para produção, eu adicionaria observabilidade, validação mais robusta e testes de integração.

## Para tempo curto

> Para garantir uma entrega funcional, vou priorizar o caminho principal e explicar as evoluções depois.

---

# 23. O QUE DEMONSTRA SENIORIDADE

Não é saber toda API de memória.

É demonstrar:

- clareza;
- pragmatismo;
- boa comunicação;
- código legível;
- capacidade de priorizar;
- preocupação com erros;
- testes relevantes;
- noção de segurança;
- percepção de performance;
- decisões proporcionais;
- capacidade de ouvir;
- tranquilidade diante de erros.

---

# 24. O QUE EVITAR

- Ficar em silêncio por muito tempo.
- Começar a codar sem entender.
- Criar arquitetura demais.
- Colocar tudo no mesmo arquivo sem explicar.
- Tentar implementar todos os cenários.
- Otimizar antes de funcionar.
- Usar abstrações sem necessidade.
- Fingir que lembra algo.
- Ignorar sugestões.
- Pedir desculpas a cada erro.
- Usar termos técnicos sem conectar ao problema.
- Falar de produção sem entregar o exercício.

---

# 25. CHECKLIST DA SESSÃO

## Antes

```text
[ ] Node funcionando
[ ] Gerenciador de pacotes funcionando
[ ] Editor configurado
[ ] TypeScript funcionando
[ ] Testes funcionando
[ ] Microfone testado
[ ] Câmera testada
[ ] Compartilhamento de tela testado
[ ] Notificações desativadas
[ ] Abas pessoais fechadas
[ ] Terminal limpo
[ ] Esta consulta aberta
```

## Durante

```text
[ ] Confirmei o problema
[ ] Fiz perguntas relevantes
[ ] Dei um exemplo
[ ] Expliquei a abordagem
[ ] Comecei simples
[ ] Pensei em voz alta
[ ] Envolvi o entrevistador
[ ] Testei o cenário principal
[ ] Tratei pelo menos um erro
[ ] Expliquei trade-offs
```

## No final

```text
[ ] Rodei o código
[ ] Recapitulei a solução
[ ] Expliquei limitações
[ ] Falei das melhorias de produção
[ ] Perguntei se querem explorar outro cenário
```

---

# 26. FLUXO DE EMERGÊNCIA

Quando eu não souber o que fazer, seguir exatamente isto:

```text
1. O que entra?
2. O que deve sair?
3. Qual é o exemplo mais simples?
4. Como eu resolveria manualmente?
5. Quais etapas eu executei?
6. Como transformo cada etapa em função?
7. Qual cenário pode quebrar?
8. Como testo?
```

Frase para ganhar organização:

> Vou voltar ao exemplo básico, decompor o problema e implementar uma etapa de cada vez.

---

# 27. RESUMO DE UMA TELA

```text
ENTENDER
O que entra, o que sai e quais são as regras?

ALINHAR
Confirmar premissas e restrições.

EXEMPLIFICAR
Criar um cenário simples e um cenário de erro.

EXPLICAR
Dizer qual abordagem será usada e por quê.

IMPLEMENTAR
Começar pelo caminho principal.

VALIDAR
Rodar, testar e comparar com o esperado.

CORRIGIR
Analisar erros sem esconder o raciocínio.

REFATORAR
Melhorar nomes e responsabilidades.

ENCERRAR
Explicar decisões, limitações e próximos passos.
```

## Lembrete final

Eu não estou sendo avaliada por decorar tudo.

Estou sendo avaliada por conseguir:

```text
entender
↓
organizar
↓
comunicar
↓
implementar
↓
validar
↓
adaptar
```

> Guia de consulta rápida para entrevistas Node.js + React (Senior/Especialista)

## 📑 Índice

- 🎯 Mentalidade
- 🚀 Primeiros minutos
- 🧩 Estratégia de resolução
- 🟢 Node.js
- ⚛️ React
- 📘 TypeScript
- 🧪 Testes
- 🏛️ Arquitetura
- 💬 Frases úteis
- 🚨 Fluxo de emergência
- ✅ Checklist

1. PORQUE NO API USAMOS PRISMA?
   Escolhi o Prisma como camada de acesso a dados porque ele fornece tipagem integrada ao TypeScript, migrations e uma API de consulta simples. Isso reduz código repetitivo e facilita a manutenção do CRUD. O Prisma fica apenas na API porque é ela que possui as regras de negócio e a responsabilidade sobre a persistência. Ainda assim, eu não considero o Prisma obrigatório; a escolha dependeria da complexidade das consultas, dos requisitos de performance e dos padrões já adotados pela equipe.

Resumo
PostgreSQL
É onde os dados ficam armazenados.

Prisma
É a ferramenta que consulta e altera esses dados.

NestJS
Organiza a API, suas regras e endpoints.

BFF
Adapta a API para o frontend.

React
Exibe os dados e recebe interações.

Para nosso projeto, o Prisma foi escolhido principalmente porque o objetivo é criar um modelo rápido de consultar, tipado e fácil de modificar, não porque seja a única forma correta de acessar o PostgreSQL.

2. PORQUE USAR ENUM?
   Porque o banco também garante que o status seja válido.

Os valores possíveis serão:
PENDING
IN_PROGRESS
COMPLETED

No frontend podemos apresentá-los assim:
PENDING → Pendente
IN_PROGRESS → Em andamento
COMPLETED → Concluída

3. POSTGRESQL OU MYQL?
   Para este projeto:

| Critério                   |    PostgreSQL |     MySQL |
| -------------------------- | ------------: | --------: |
| CRUD comum                 |     Excelente | Excelente |
| Tipos e recursos avançados | Mais completo |       Bom |
| JSON                       |   Muito forte |       Bom |
| Consultas complexas        |   Muito forte |       Bom |
| Uso com Prisma             |     Excelente | Excelente |
| Valor como referência      |     **Maior** |       Bom |
