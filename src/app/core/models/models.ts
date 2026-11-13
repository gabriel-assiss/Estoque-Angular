export type RoleFuncionario = 'ADMIN' | 'PADRAO';
export type StatusFuncionario = 'ATIVO' | 'INATIVO';
export type StatusCategoria = 'ATIVO' | 'INATIVO';
export type StatusFornecedor = 'ATIVO' | 'INATIVO';
export type StatusProduto = 'ATIVO' | 'INATIVO';
export type StatusCompra = 'CONCLUIDA' | 'CANCELADA';
export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'MUDANCA';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  id: number;
  token: string;
  email: string;
  nome: string;
  role: RoleFuncionario;
}

export interface Funcionario {
  id: number;
  nome: string;
  matricula: string;
  cargo: string;
  role: RoleFuncionario;
  statusFuncionario: StatusFuncionario;
  email: string;
}

export interface FuncionarioRequest {
  nome: string;
  role: RoleFuncionario;
  email: string;
  senha?: string;
  cargo: string;
  matricula: string;
}

export interface Categoria {
  id: number;
  nome: string;
  statusCategoria?: StatusCategoria;
}

export interface CategoriaRequest {
  nome: string;
  statusCategoria?: StatusCategoria;
}

export interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string;
  statusFornecedor?: StatusFornecedor;
}

export interface FornecedorRequest {
  nome: string;
  cnpj: string;
}

export interface Produto {
  id: number;
  nome: string;
  unidadeMedida: string;
  statusProduto: StatusProduto;
  categoriaId?: number;
  categoriaNome?: string;
  estoqueQuantidade?: number;
}

export interface ProdutoRequest {
  nome: string;
  unidadeMedida: string;
  quantidade: number;
  categoriaId: number;
}

export interface Estoque {
  id: number;
  quantidadeEstoque: number;
  produtoId: number;
  produtoNome?: string;
}

export interface CompraItem {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  produtoNome?: string;
}

export interface CompraRequest {
  funcionario: number;
  fornecedor: number;
  itens: CompraItem[];
}

export interface Compra {
  id: number;
  dataCompra: string;
  statusCompra: StatusCompra;
  funcionarioId?: number;
  funcionarioNome?: string;
  fornecedorId?: number;
  fornecedorNome?: string;
  itens?: CompraItem[];
}

export interface MovimentacaoEstoque {
  id: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  dataHora?: string;
  produtoId?: number;
  produtoNome?: string;
  funcionarioId?: number;
  funcionarioNome?: string;
  observacao?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
    sort?: any;
    offset?: number;
    paged?: boolean;
    unpaged?: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
