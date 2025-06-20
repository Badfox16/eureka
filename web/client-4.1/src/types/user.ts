import { Usuario } from "./usuario";

// Reexportando o tipo principal
export type { Usuario } from "./usuario";

// Mantendo compatibilidade com o código existente
// até que seja totalmente refatorado
export type User = Usuario;
